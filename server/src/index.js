import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID, randomBytes, createHash } from "crypto";
import nodemailer from "nodemailer";
import { initializeDatabase, pool, generateLicenseNumber, generateMemberId, backfillIdentifiers } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET;
let databaseReady;

if (!jwtSecret) throw new Error("JWT_SECRET is required");

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
const mailer = smtpConfigured
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  : null;
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:8080").replace(/\/$/, "");

// Transport de secours (développement uniquement, sans SMTP réel) : compte de
// test Ethereal. Le mail part vers une boîte de démonstration consultable en
// ligne, et la réponse API contient aussi le lien de réinitialisation direct.
let devMailerPromise = null;
const getDevMailer = () => {
  devMailerPromise ||= nodemailer.createTestAccount().then((account) =>
    nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    }),
  );
  return devMailerPromise;
};

// Envoi via le compte de test Ethereal ; le lien local reste toujours valable
// même si Ethereal est injoignable (hors ligne).
const sendViaDevMailer = async (mail, resetUrl) => {
  try {
    const transport = await getDevMailer();
    const info = await transport.sendMail(mail);
    return {
      devMode: true,
      devResetUrl: resetUrl,
      previewUrl: nodemailer.getTestMessageUrl(info) || null,
    };
  } catch (devError) {
    console.warn("Ethereal unavailable, returning local reset link only", devError.message);
    return { devMode: true, devResetUrl: resetUrl, previewUrl: null };
  }
};

// Licences are annual: they expire at the end of the season (30 September).
// Renewal requests must be approved by the admin to push the deadline forward.
const seasonEnd = () => `${new Date().getFullYear()}-09-30`;
const nextSeasonEnd = () => `${new Date().getFullYear() + 1}-09-30`;
const asDateOrNull = (value) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: "20mb" }));
app.use(async (_req, res, next) => {
  try {
    databaseReady ||= initializeDatabase();
    await databaseReady;
    next();
  } catch (error) {
    console.error("Database startup failed", error);
    res.status(500).json({ error: "Database is unavailable" });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (["application/pdf", "image/jpeg", "image/png"].includes(file.mimetype)) return callback(null, true);
    callback(new Error("Only PDF, JPG and PNG documents are accepted"));
  },
});

const uploadDocuments = (req, res, next) => upload.array("documents", 10)(req, res, (error) => {
  if (error) return res.status(400).json({ error: error.message });
  next();
});

// Signup additionally accepts a club logo image alongside the documents.
const uploadSignupFiles = (req, res, next) => upload.fields([
  { name: "documents", maxCount: 10 },
  { name: "logo", maxCount: 1 },
])(req, res, (error) => {
  if (error) return res.status(400).json({ error: error.message });
  // Normalize: req.files stays an array of documents; the logo moves to req.logoFile.
  const files = req.files || {};
  req.files = files.documents || [];
  req.logoFile = (files.logo || [])[0] || null;
  next();
});

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.auth?.role !== "admin") return res.status(403).json({ error: "Administrator access required" });
  next();
};

app.get("/health", (_req, res) => res.json({ ok: true, message: "Backend is running" }));
app.get("/api/health", (_req, res) => res.json({ ok: true, message: "Backend is running" }));

// Public license verification (target of QR codes on printed licenses).
app.get("/api/verify/:license", async (req, res) => {
  try {
    const license = String(req.params.license || "").trim().toUpperCase();
    if (!license) return res.status(400).json({ error: "License number required" });

    const userResult = await pool.query(
      `SELECT license_number AS "licenseNumber", full_name AS "fullName", account_type AS "accountType",
        city, discipline, club_name AS "clubName", status, license_expires_at AS "licenseExpiresAt"
       FROM users WHERE license_number = $1`,
      [license],
    );
    let record = userResult.rows[0] || null;
    if (!record) {
      const clubResult = await pool.query(
        `SELECT c.license_number AS "licenseNumber", c.full_name AS "fullName", 'athlete' AS "accountType",
          u.city, c.discipline, c.club_name AS "clubName", c.approval_status AS "status"
         FROM users u JOIN club_members c ON c.club_user_id = u.id WHERE c.license_number = $1`,
        [license],
      );
      // Club-member verification also returns the annual deadline.
      const memberResult = await pool.query(
        `SELECT c.license_number AS "licenseNumber", c.full_name AS "fullName",
          'athlete' AS "accountType", c.club_name AS "clubName", c.discipline,
          c.season, c.approval_status AS "status", c.birth_date AS "birthDate",
          c.license_expires_at AS "licenseExpiresAt"
         FROM club_members c WHERE c.license_number = $1`,
        [license],
      );
      record = memberResult.rows[0] || clubResult.rows[0] || null;
    }
    if (!record) return res.status(404).json({ valid: false, error: "Licence introuvable" });

    // A license is only active while its annual deadline (season end) is in the future.
    const expired = Boolean(record.licenseExpiresAt && record.licenseExpiresAt < seasonEnd());
    const active = record.status === "approved" && !expired;
    res.json({
      valid: true,
      active,
      expired,
      licenseExpiresAt: record.licenseExpiresAt || null,
      licenseNumber: record.licenseNumber,
      fullName: record.fullName,
      accountType: record.accountType,
      city: record.city || null,
      discipline: record.discipline || null,
      clubName: record.clubName || null,
      season: record.season || null,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ valid: false, error: "Vérification impossible" });
  }
});

// Serve uploaded documents statically (content images live here too).
app.use("/api/uploads", express.static(path.resolve("data/uploads")));

app.post("/api/auth/signup", uploadSignupFiles, async (req, res) => {
  const { fullName, email, password, phone, city, discipline, clubName, accountType } = req.body;
  if (!fullName || !email || !password || !accountType) return res.status(400).json({ error: "Name, email, password and account type are required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must contain at least 8 characters" });
  if (!["athlete", "coach", "referee", "trainer", "club"].includes(accountType)) return res.status(400).json({ error: "Invalid account type" });

  let documentTypes = [];
  try { documentTypes = JSON.parse(req.body.documentTypes || "[]"); } catch { return res.status(400).json({ error: "Invalid document types" }); }
  const uploadedFiles = req.files || [];
  if (uploadedFiles.length && (
    !Array.isArray(documentTypes)
    || documentTypes.length !== uploadedFiles.length
    || documentTypes.some((type) => typeof type !== "string" || !type.trim())
  )) {
    return res.status(400).json({ error: "A document type is required for every uploaded file" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(password, 12);
    const licenseNumber = await generateLicenseNumber(client, accountType);
    // Club branding: type, organization name and optional logo (image upload).
    const clubType = typeof req.body.clubType === "string" ? req.body.clubType.trim().slice(0, 50) : "";
    const organizationName = typeof req.body.organizationName === "string" ? req.body.organizationName.trim().slice(0, 255) : "";
    // Dancer profile fields shared by club members and individual accounts.
    const birthDate = typeof req.body.birthDate === "string" ? req.body.birthDate.trim().slice(0, 20) : "";
    const gender = ["M", "F"].includes(req.body.gender) ? req.body.gender : "M";
    const actYear = req.body.actYear && Number.isSafeInteger(Number(req.body.actYear)) ? Number(req.body.actYear) : null;
    const actNumber = typeof req.body.actNumber === "string" ? req.body.actNumber.trim().slice(0, 50) : "";
    let emergencyContact = null;
    if (typeof req.body.emergencyContact === "string" && req.body.emergencyContact.trim()) {
      try { emergencyContact = JSON.parse(req.body.emergencyContact); } catch { emergencyContact = null; }
    }
    const logoFile = req.logoFile;
    let logoUrl = null;
    if (logoFile) {
      if (!logoFile.mimetype.startsWith("image/")) {
        const error = new Error("Club logo must be an image");
        error.status = 400;
        throw error;
      }
      const logoId = randomUUID();
      const logoExtension = path.extname(logoFile.originalname).toLowerCase() || ".png";
      const logoDirectory = path.resolve("data/uploads/club-logos");
      fs.mkdirSync(logoDirectory, { recursive: true });
      fs.writeFileSync(path.join(logoDirectory, `${logoId}${logoExtension}`), logoFile.buffer);
      logoUrl = `/api/uploads/club-logos/${logoId}${logoExtension}`;
    }
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, city, discipline, club_name, account_type, status, public_id, license_number,
        club_type, organization_name, logo_url, birth_date, gender, act_year, act_number, emergency_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb)
       RETURNING id, email, role, full_name, status, license_number AS "licenseNumber"`,
      [email.trim().toLowerCase(), passwordHash, accountType === "club" ? "club" : "member", fullName, phone || null, city || null, discipline || null, clubName || null, accountType, licenseNumber,
        clubType || null, organizationName || null, logoUrl,
        birthDate || null, gender, actYear, actNumber || null, emergencyContact ? JSON.stringify(emergencyContact) : null],
    );
    const user = userResult.rows[0];
    const requestResult = await client.query(
      `INSERT INTO account_requests (user_id, account_type, full_name, email, phone, city, discipline, club_name, club_type, organization_name, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [user.id, accountType, fullName, user.email, phone || null, city || null, discipline || null, clubName || null, clubType || null, organizationName || null, logoUrl],
    );
    const requestId = requestResult.rows[0].id;
    const requestDirectory = path.resolve("data/uploads/account-requests", String(requestId));
    const documents = [];
    for (const [index, file] of uploadedFiles.entries()) {
      const documentId = randomUUID();
      const extension = path.extname(file.originalname).toLowerCase();
      const storedName = `${documentId}${extension}`;
      fs.mkdirSync(requestDirectory, { recursive: true });
      fs.writeFileSync(path.join(requestDirectory, storedName), file.buffer);
      documents.push({
        id: documentId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storedName,
        type: typeof documentTypes[index] === "string" && documentTypes[index].trim() ? documentTypes[index].trim() : "Document non précisé",
      });
    }
    await client.query("UPDATE account_requests SET documents = $1::jsonb WHERE id = $2", [JSON.stringify(documents), requestId]);
    
    // Create notifications for all admins
    const adminResult = await client.query("SELECT id FROM users WHERE role = $1", ["admin"]);
    for (const admin of adminResult.rows) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [admin.id, "new_registration", "Nouvelle demande d'inscription", 
         `Nouvelle demande d'inscription de ${fullName} (${email})`, requestId]
      );
    }
    
    await client.query("COMMIT");
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name, status: user.status, licenseNumber: user.licenseNumber } });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") return res.status(409).json({ error: "An account with this email already exists" });
    if (error.status === 400) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Unable to create account" });
  } finally {
    client.release();
  }
});

// Persistent media upload for content editors (news images, galleries, about…).
app.post("/api/admin/uploads", authenticate, requireAdmin, upload.array("files", 12), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: "No files provided" });
  const saved = [];
  for (const file of files) {
    const id = randomUUID();
    const extension = path.extname(file.originalname).toLowerCase() || ".bin";
    const storedName = `${id}${extension}`;
    const directory = path.resolve("data/uploads/content");
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, storedName), file.buffer);
    saved.push({ url: `/api/uploads/content/${storedName}`, name: file.originalname, size: file.size });
  }
  res.status(201).json({ files: saved });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: "8h" });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        status: user.status,
        accountType: user.account_type,
        city: user.city,
        discipline: user.discipline,
        clubName: user.club_name,
        licenseNumber: user.license_number,
        publicId: user.public_id,
      },
    });
  } catch {
    res.status(500).json({ error: "Unable to authenticate" });
  }
});

app.get("/api/admin/notifications", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, type, title, message, related_id AS "relatedId", read, created_at AS "createdAt"
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.auth.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to fetch notifications" });
  }
});

app.get("/api/admin/notifications/unread-count", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false`,
      [req.auth.userId]
    );
    res.json({ unreadCount: parseInt(result.rows[0].count) });
  } catch {
    res.status(500).json({ error: "Unable to fetch notification count" });
  }
});

app.patch("/api/admin/notifications/:id/read", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.auth.userId]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Unable to mark notification as read" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    let devInfo = null;
    if (user) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < NOW()", [user.id]);
      await pool.query(
        "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
        [user.id, tokenHash],
      );
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
      const mail = {
        from: process.env.SMTP_FROM || "FTDAP <no-reply@ftdap.dev>",
        to: email,
        subject: "Réinitialisation de votre mot de passe FTDAP",
        text: `Pour choisir un nouveau mot de passe, ouvrez ce lien dans l'heure : ${resetUrl}`,
        html: `<p>Pour choisir un nouveau mot de passe, ouvrez ce lien dans l'heure :</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>`,
      };
      if (mailer) {
        try {
          await mailer.sendMail(mail);
        } catch (smtpError) {
          // SMTP réel configuré mais indisponible (identifiants invalides,
          // réseau…) → repli développement pour ne pas bloquer l'utilisateur.
          console.error("Real SMTP send failed, falling back to dev mode", smtpError.message);
          devInfo = await sendViaDevMailer(mail, resetUrl);
        }
      } else {
        // Développement : SMTP non configuré → Ethereal + lien direct dans la
        // réponse pour que le flux « mot de passe oublié » reste utilisable.
        devInfo = await sendViaDevMailer(mail, resetUrl);
      }
    }
    res.json({ ok: true, message: "If an account exists, a reset link has been sent.", ...devInfo });
  } catch (error) {
    console.error("Password reset email failed", error);
    res.status(500).json({ error: "Unable to send reset email" });
  }
});

// Admin : envoyer un lien de réinitialisation de mot de passe à un compte.
// SÉCURITÉ : le destinataire est TOUJOURS l'email du profil enregistré en base
// (celui qui a créé le compte) — jamais une adresse fournie par la requête.
app.post("/api/admin/users/:id/send-password-reset", authenticate, requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isSafeInteger(userId)) return res.status(400).json({ error: "Invalid user id" });
  try {
    const result = await pool.query(
      "SELECT id, email, full_name FROM users WHERE id = $1",
      [userId],
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Compte introuvable" });
    if (!user.email) return res.status(409).json({ error: "Ce compte n'a pas d'email enregistré" });

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < NOW()", [user.id]);
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
      [user.id, tokenHash],
    );
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const mail = {
      from: process.env.SMTP_FROM || "FTDAP <no-reply@ftdap.dev>",
      to: user.email,
      subject: "Votre mot de passe FTDAP a été réinitialisé par l'administration",
      text: `L'administration FTDAP a initié une réinitialisation de votre mot de passe. Pour choisir un nouveau mot de passe, ouvrez ce lien dans l'heure : ${resetUrl}. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message — votre mot de passe actuel reste valable.`,
      html: `<p>L'administration FTDAP a initié une réinitialisation de votre mot de passe.</p><p><a href="${resetUrl}">Choisir un nouveau mot de passe</a> (valable 1 heure).</p><p style="color:#6b7280;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message — votre mot de passe actuel reste valable.</p>`,
    };
    if (mailer) {
      await mailer.sendMail(mail);
    } else {
      const transport = await getDevMailer();
      await transport.sendMail(mail);
    }
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)`,
      [user.id, "admin_password_reset", "Réinitialisation de mot de passe",
        "L'administration vous a envoyé un lien de réinitialisation de mot de passe par email."],
    );
    res.json({ ok: true, sentTo: user.email });
  } catch (error) {
    console.error("Admin password reset email failed", error);
    res.status(500).json({ error: "Envoi impossible — vérifiez la configuration SMTP" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "A valid token and a password of at least 8 characters are required" });
  }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE",
      [tokenHash],
    );
    const reset = result.rows[0];
    if (!reset) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This reset link is invalid or has expired" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, reset.user_id]);
    await client.query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1", [reset.id]);
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Password reset failed", error);
    res.status(500).json({ error: "Unable to reset password" });
  } finally {
    client.release();
  }
});

app.get("/api/directory", async (_req, res) => {
  try {
    const result = await pool.query(`SELECT id, user_id AS "userId", account_type AS "accountType", entry_type AS type, name, city,
      discipline, club_name AS "clubName", role, member_count AS "memberCount", license_number AS "licenseNumber",
      license_active AS "licenseActive"
      FROM directory_entries WHERE license_active = true ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load directory" });
  }
});

const contentKinds = new Set(["competitions", "news", "results", "media", "disciplines", "about"]);

app.get("/api/content/:kind", async (req, res) => {
  if (!contentKinds.has(req.params.kind)) return res.status(404).json({ error: "Unknown content type" });
  const result = await pool.query(
    `SELECT id, data, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM content_items WHERE kind = $1 AND published = true ORDER BY created_at DESC`,
    [req.params.kind],
  );
  res.json(result.rows.map((row) => ({ ...row.data, id: row.id, createdAt: row.createdAt, updatedAt: row.updatedAt })));
});

app.get("/api/content/:kind/:id", async (req, res) => {
  if (!contentKinds.has(req.params.kind)) return res.status(404).json({ error: "Unknown content type" });
  const result = await pool.query("SELECT id, data FROM content_items WHERE kind = $1 AND id = $2 AND published = true", [req.params.kind, req.params.id]);
  const row = result.rows[0];
  if (!row) return res.status(404).json({ error: "Content not found" });
  res.json({ ...row.data, id: row.id });
});

app.post("/api/admin/content/:kind", authenticate, requireAdmin, async (req, res) => {
  if (!contentKinds.has(req.params.kind)) return res.status(404).json({ error: "Unknown content type" });
  const result = await pool.query("INSERT INTO content_items (kind, data) VALUES ($1, $2::jsonb) RETURNING id, data", [req.params.kind, JSON.stringify(req.body)]);
  res.status(201).json({ ...result.rows[0].data, id: result.rows[0].id });
});

app.put("/api/admin/content/:kind/:id", authenticate, requireAdmin, async (req, res) => {
  if (!contentKinds.has(req.params.kind)) return res.status(404).json({ error: "Unknown content type" });
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id)) return res.status(400).json({ error: "Invalid content id" });
  try {
    const result = await pool.query("UPDATE content_items SET data = $1::jsonb, updated_at = NOW() WHERE kind = $2 AND id = $3 RETURNING id, data", [JSON.stringify(req.body), req.params.kind, id]);
    if (!result.rowCount) return res.status(404).json({ error: "Content not found" });
    res.json({ ...result.rows[0].data, id: result.rows[0].id });
  } catch {
    res.status(400).json({ error: "Unable to update content" });
  }
});

app.delete("/api/admin/content/:kind/:id", authenticate, requireAdmin, async (req, res) => {
  if (!contentKinds.has(req.params.kind)) return res.status(404).json({ error: "Unknown content type" });
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id)) return res.status(400).json({ error: "Invalid content id" });
  const result = await pool.query("DELETE FROM content_items WHERE kind = $1 AND id = $2 RETURNING id", [req.params.kind, id]);
  if (!result.rowCount) return res.status(404).json({ error: "Content not found" });
  res.json({ ok: true });
});app.post("/api/member/request-activation", authenticate, uploadDocuments, async (req, res) => {
  // Accept both JSON { reason } and multipart { reason } + documents.
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  const uploadedFiles = req.files || [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Upsert first so documents land in data/uploads/activation-requests/<row id>/,
    // the location sendStoredDocument resolves when serving them back.
    const inserted = await client.query(
      `INSERT INTO activation_requests (user_id, reason, status, created_at) VALUES ($1, $2, 'pending', NOW())
       ON CONFLICT (user_id) DO UPDATE SET reason = $2, status = 'pending', created_at = NOW()
       RETURNING id`,
      [req.auth.userId, reason || null]
    );
    const requestId = inserted.rows[0].id;
    const documents = [];
    if (uploadedFiles.length > 0) {
      const requestDirectory = path.resolve("data/uploads/activation-requests", String(requestId));
      for (const file of uploadedFiles) {
        const documentId = randomUUID();
        const extension = path.extname(file.originalname).toLowerCase();
        const storedName = `${documentId}${extension}`;
        fs.mkdirSync(requestDirectory, { recursive: true });
        fs.writeFileSync(path.join(requestDirectory, storedName), file.buffer);
        documents.push({ id: documentId, originalName: file.originalname, mimeType: file.mimetype, size: file.size, storedName });
      }
    }

    await client.query("UPDATE activation_requests SET documents = $1::jsonb WHERE id = $2", [JSON.stringify(documents), requestId]);

    const adminResult = await client.query("SELECT id FROM users WHERE role = $1", ["admin"]);
    for (const admin of adminResult.rows) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)`,
        [admin.id, "activation_request", "Demande d'activation", `Demande d'activation reçue (motif: ${reason || "non précisé"})`],
      );
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Activation request failed", error);
    res.status(500).json({ error: "Unable to submit request" });
  } finally {
    client.release();
  }
});

app.get("/api/member/activation-request", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", status, reason, documents, created_at AS "createdAt", reviewed_at AS "reviewedAt", reviewer_note AS "reviewerNote"
       FROM activation_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.auth.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "No activation request" });
    const request = result.rows[0];
    const documents = (request.documents || []).map((document) => ({
      id: document.id, name: document.originalName, mimeType: document.mimeType, size: document.size,
      url: `/api/member/activation-documents/${request.id}/${document.id}`,
    }));
    res.json({ ...request, documents });
  } catch {
    res.status(500).json({ error: "Unable to fetch activation request" });
  }
});

app.get("/api/member/activation-documents/:requestId/:documentId", authenticate, async (req, res) => {
  // Ownership first: a member may only fetch documents from their own request.
  const owned = await pool.query(
    "SELECT 1 FROM activation_requests WHERE id = $1 AND user_id = $2",
    [req.params.requestId, req.auth.userId],
  );
  if (!owned.rows[0]) return res.status(404).json({ error: "Document not found" });
  await sendStoredDocument(res, {
    table: "activation_requests", column: "documents", directory: "data/uploads/activation-requests",
    rowId: req.params.requestId, documentId: req.params.documentId, disposition: "inline",
  });
});

// Admin: license activation requests submitted by members from their profile.
app.get("/api/admin/activation-requests", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.user_id AS "userId", a.status, a.reason, a.documents,
        a.created_at AS "createdAt", a.reviewed_at AS "reviewedAt", a.reviewer_note AS "reviewerNote",
        u.full_name AS "fullName", u.email, u.account_type AS "accountType",
        u.license_number AS "licenseNumber", u.avatar_url AS "avatarUrl"
       FROM activation_requests a JOIN users u ON u.id = a.user_id
       ORDER BY (a.status = 'pending') DESC, a.created_at DESC`,
    );
    res.json(result.rows.map((row) => ({
      ...row,
      documents: (row.documents || []).map((document) => ({
        id: document.id, name: document.originalName, mimeType: document.mimeType, size: document.size,
        url: `/api/admin/activation-requests/${row.id}/documents/${document.id}`,
      })),
    })));
  } catch {
    res.status(500).json({ error: "Unable to load activation requests" });
  }
});

app.get("/api/admin/activation-requests/:id/documents/:documentId", authenticate, requireAdmin, async (req, res) => {
  await sendStoredDocument(res, {
    table: "activation_requests", column: "documents", directory: "data/uploads/activation-requests",
    rowId: req.params.id, documentId: req.params.documentId, disposition: "inline",
  });
});

app.patch("/api/admin/activation-requests/:id", authenticate, requireAdmin, async (req, res) => {
  const { status, reviewerNote } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid review status" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const requestResult = await client.query(
      `SELECT a.id, a.user_id, u.account_type, u.full_name, u.city, u.discipline, u.club_name, u.license_number
       FROM activation_requests a JOIN users u ON u.id = a.user_id WHERE a.id = $1 FOR UPDATE`,
      [req.params.id],
    );
    const request = requestResult.rows[0];
    if (!request) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Request not found" });
    }
    await client.query(
      "UPDATE activation_requests SET status = $1, reviewer_note = $2, reviewed_at = NOW() WHERE id = $3",
      [status, reviewerNote || null, request.id],
    );
    if (status === "approved") {
      // Guarantee the member has a license number, then activate + publish.
      let licenseNumber = request.license_number || null;
      if (!licenseNumber) {
        licenseNumber = await generateLicenseNumber(client, request.account_type);
        await client.query("UPDATE users SET license_number = $1, public_id = $2 WHERE id = $3", [licenseNumber, licenseNumber, request.user_id]);
      }
      await client.query("UPDATE users SET status = 'approved' WHERE id = $1", [request.user_id]);
      // First approval grants a license valid until the current season end;
      // renewals extend it (see PATCH /api/admin/license-renewals/:id).
      await client.query(
        `UPDATE users SET license_expires_at = GREATEST(COALESCE(license_expires_at, $2::date), $2::date) WHERE id = $1`,
        [request.user_id, seasonEnd()],
      );
      await client.query(`INSERT INTO directory_entries (user_id, account_type, entry_type, name, city, discipline, club_name, role, license_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) DO UPDATE SET license_active = true, name = EXCLUDED.name, city = EXCLUDED.city,
          discipline = EXCLUDED.discipline, club_name = EXCLUDED.club_name, role = EXCLUDED.role, license_number = EXCLUDED.license_number`,
        [request.user_id, request.account_type, request.account_type === "club" ? "club" : "member",
          request.account_type === "club" ? (request.club_name || request.full_name) : request.full_name,
          request.city, request.discipline, request.club_name, request.account_type, licenseNumber]);
    } else {
      await client.query("UPDATE directory_entries SET license_active = false WHERE user_id = $1", [request.user_id]);
    }
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)`,
      [request.user_id, "activation_reviewed", "Demande de validation traitée",
        status === "approved"
          ? "Votre demande de validation a été approuvée. Votre licence est désormais active."
          : `Votre demande de validation a été refusée${reviewerNote ? ` : ${reviewerNote}` : "."}`],
    );
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Unable to review activation request" });
  } finally {
    client.release();
  }
});

// Results of the signed-in member: published result events where their name
// appears in the participants list (public results content is admin-managed).
app.get("/api/member/results", authenticate, async (req, res) => {
  try {
    const userResult = await pool.query("SELECT full_name FROM users WHERE id = $1", [req.auth.userId]);
    const fullName = (userResult.rows[0]?.full_name || "").trim().toLowerCase();
    if (!fullName) return res.json([]);
    const result = await pool.query(
      `SELECT id, data FROM content_items WHERE kind = 'results' AND published = true ORDER BY created_at DESC`,
    );
    const memberResults = [];
    for (const row of result.rows) {
      const data = row.data || {};
      if ((data.kind || "") === "ranking") continue;
      const participants = Array.isArray(data.participants) ? data.participants : [];
      const match = participants.find((p) =>
        typeof p?.name === "string" && p.name.trim().toLowerCase() === fullName,
      );
      if (match) {
        memberResults.push({
          id: row.id,
          eventName: data.eventName || "Compétition",
          date: data.date || null,
          place: data.place || null,
          rank: match.rank || null,
          club: match.club || null,
        });
      }
    }
    res.json(memberResults);
  } catch {
    res.status(500).json({ error: "Unable to load results" });
  }
});

// Member's own profile + license (used by the member space and printed license QR).
app.get("/api/member/profile", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, full_name AS "fullName", phone, city, discipline, club_name AS "clubName",
        account_type AS "accountType", status, public_id AS "publicId", license_number AS "licenseNumber",
        license_expires_at AS "licenseExpiresAt",
        avatar_url AS "avatarUrl", club_type AS "clubType", organization_name AS "organizationName",
        logo_url AS "logoUrl", birth_date AS "birthDate", gender, act_year AS "actYear", act_number AS "actNumber",
        emergency_contact AS "emergencyContact", created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [req.auth.userId],
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Profile not found" });
    // The license stays active only while the annual deadline is in the future.
    const expired = Boolean(user.licenseExpiresAt && user.licenseExpiresAt < seasonEnd());
    res.json({ ...user, licenseActive: user.status === "approved" && !expired });
  } catch {
    res.status(500).json({ error: "Unable to load profile" });
  }
});

// Profile picture upload (stored like content media, path saved on the user).
app.post("/api/member/avatar", authenticate, upload.single("avatar"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file provided" });
  if (!file.mimetype.startsWith("image/")) return res.status(400).json({ error: "Only image files are accepted" });
  const id = randomUUID();
  const extension = path.extname(file.originalname).toLowerCase() || ".png";
  const storedName = `${id}${extension}`;
  const directory = path.resolve("data/uploads/avatars");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, storedName), file.buffer);
  const url = `/api/uploads/avatars/${storedName}`;
  pool.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [url, req.auth.userId])
    .then(() => res.json({ avatarUrl: url }))
    .catch(() => res.status(500).json({ error: "Unable to save profile picture" }));
});

// Club members managed by the signed-in club (list / create / update / delete).
app.get("/api/member/club-members", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, member_id AS "memberId", full_name AS "fullName", birth_date AS "birthDate", age, gender,
        discipline, phone, email, season, quality, club_name AS "clubName", emergency_contact AS "emergencyContact",
        documents, payment, approval_status AS "approvalStatus", license_number AS "licenseNumber",
        license_expires_at AS "licenseExpiresAt",
        act_year AS "actYear", act_number AS "actNumber", created_at AS "createdAt"
       FROM club_members WHERE club_user_id = $1 ORDER BY created_at DESC`,
      [req.auth.userId],
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load club members" });
  }
});

app.post("/api/member/club-members", authenticate, uploadDocuments, async (req, res) => {
  const { fullName, birthDate, age, gender, discipline, phone, email, season, quality, emergencyContact, actYear, actNumber } = req.body;
  if (!fullName) return res.status(400).json({ error: "Full name is required" });
  // documentKeys arrives as a JSON string through multipart forms.
  let documentKeys = req.body.documentKeys;
  if (typeof documentKeys === "string") {
    try { documentKeys = JSON.parse(documentKeys); } catch { documentKeys = null; }
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const memberId = await generateMemberId(client);
    const documents = {};
    for (const [index, file] of (req.files || []).entries()) {
      const id = randomUUID();
      const extension = path.extname(file.originalname).toLowerCase();
      const storedName = `${id}${extension}`;
      const directory = path.resolve("data/uploads/club-members", String(req.auth.userId));
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(path.join(directory, storedName), file.buffer);
      const key = typeof documentKeys?.[index] === "string" && documentKeys[index]
        ? documentKeys[index]
        : `doc${index}`;
      documents[key] = { id, originalName: file.originalname, mimeType: file.mimetype, size: file.size, storedName };
    }
    const result = await client.query(
      `INSERT INTO club_members (club_user_id, member_id, full_name, birth_date, age, gender, discipline, phone, email,
        season, quality, club_name, emergency_contact, documents, payment, act_year, act_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17)
       RETURNING id, member_id AS "memberId", full_name AS "fullName", birth_date AS "birthDate", age, gender,
        discipline, phone, email, season, quality, club_name AS "clubName", emergency_contact AS "emergencyContact",
        documents, payment, approval_status AS "approvalStatus", license_number AS "licenseNumber",
        act_year AS "actYear", act_number AS "actNumber", created_at AS "createdAt"`,
      [req.auth.userId, memberId, fullName, birthDate || null, Number(age) || null, gender || "M", discipline || null,
        phone || null, email || null, season || null, quality || null,
        // Store the club's display name (falls back to the account email).
        (await pool.query("SELECT full_name FROM users WHERE id = $1", [req.auth.userId])).rows[0]?.full_name || req.auth.email || null,
        emergencyContact || null, JSON.stringify(documents), req.body.payment ? String(req.body.payment) : JSON.stringify({ status: "unpaid" }),
        actYear ? Number(actYear) : null, actNumber || null],
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Club member creation failed", error);
    res.status(500).json({ error: "Unable to create club member" });
  } finally {
    client.release();
  }
});

app.put("/api/member/club-members/:id", authenticate, uploadDocuments, async (req, res) => {
  const { fullName, birthDate, age, gender, discipline, phone, email, season, quality, emergencyContact, keepExistingDocuments, actYear, actNumber } = req.body;
  // Multipart forms deliver JSON arrays as strings — parse before use.
  const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : null; } catch { return null; }
    }
    return null;
  };
  const documentKeys = parseJsonArray(req.body.documentKeys);
  const keepList = parseJsonArray(keepExistingDocuments);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existingResult = await client.query(
      "SELECT id, documents, member_id FROM club_members WHERE id = $1 AND club_user_id = $2 FOR UPDATE",
      [req.params.id, req.auth.userId],
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Club member not found" });
    }
    const documents = existing.documents || {};
    if (keepList) {
      for (const key of Object.keys(documents)) if (!keepList.includes(key)) delete documents[key];
    }
    for (const [index, file] of (req.files || []).entries()) {
      const id = randomUUID();
      const extension = path.extname(file.originalname).toLowerCase();
      const storedName = `${id}${extension}`;
      const directory = path.resolve("data/uploads/club-members", String(req.auth.userId));
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(path.join(directory, storedName), file.buffer);
      const key = typeof documentKeys?.[index] === "string" && documentKeys[index]
        ? documentKeys[index]
        : `doc${Date.now()}${index}`;
      documents[key] = { id, originalName: file.originalname, mimeType: file.mimetype, size: file.size, storedName };
    }
    const result = await client.query(
      `UPDATE club_members SET full_name = $1, birth_date = $2, age = $3, gender = $4, discipline = $5, phone = $6,
        email = $7, season = $8, quality = $9, emergency_contact = $10::jsonb, documents = $11::jsonb,
        act_year = $12, act_number = $13, updated_at = NOW()
       WHERE id = $14 AND club_user_id = $15
       RETURNING id, member_id AS "memberId", full_name AS "fullName", birth_date AS "birthDate", age, gender,
        discipline, phone, email, season, quality, club_name AS "clubName", emergency_contact AS "emergencyContact",
        documents, payment, approval_status AS "approvalStatus", license_number AS "licenseNumber",
        act_year AS "actYear", act_number AS "actNumber", created_at AS "createdAt"`,
      [fullName || existing.full_name || null, birthDate || null, Number(age) || null, gender || "M", discipline || null,
        phone || null, email || null, season || null, quality || null, emergencyContact || null,
        JSON.stringify(documents), actYear ? Number(actYear) : null, actNumber || null,
        req.params.id, req.auth.userId],
    );
    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Club member update failed", error);
    res.status(500).json({ error: "Unable to update club member" });
  } finally {
    client.release();
  }
});

app.delete("/api/member/club-members/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM club_members WHERE id = $1 AND club_user_id = $2 RETURNING id",
      [req.params.id, req.auth.userId],
    );
    if (!result.rowCount) return res.status(404).json({ error: "Club member not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Unable to delete club member" });
  }
});

// Mark members paid + attach one shared receipt, and submit them for licensing.
app.post("/api/member/club-members/bulk-payment", authenticate, uploadDocuments, async (req, res) => {
  let memberIds = [];
  const raw = req.body.memberIds || "[]";
  try { memberIds = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return res.status(400).json({ error: "Invalid memberIds" }); }
  if (!Array.isArray(memberIds) || memberIds.length === 0) return res.status(400).json({ error: "Select at least one member" });
  if (!Array.isArray(memberIds) || memberIds.length === 0) return res.status(400).json({ error: "Select at least one member" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let receipt = null;
    const file = (req.files || [])[0];
    if (file) {
      const id = randomUUID();
      const extension = path.extname(file.originalname).toLowerCase();
      const storedName = `${id}${extension}`;
      const directory = path.resolve("data/uploads/club-members", String(req.auth.userId));
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(path.join(directory, storedName), file.buffer);
      receipt = { id, originalName: file.originalname, mimeType: file.mimetype, size: file.size, storedName, uploadedAt: new Date().toISOString() };
    }
    // Params: $1 = payment jsonb, $2 = club_user_id, $3.. = member ids.
    const placeholders = memberIds.map((_, i) => `$${i + 3}`).join(",");
    const result = await client.query(
      `UPDATE club_members SET payment = payment || $1::jsonb, updated_at = NOW()
       WHERE club_user_id = $2 AND id IN (${placeholders})
       RETURNING id, license_number AS "licenseNumber"`,
      [JSON.stringify({ status: "paid", receipt, updatedAt: new Date().toISOString() }), req.auth.userId, ...memberIds],
    );
    await client.query("COMMIT");
    res.json({ ok: true, updated: result.rowCount });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Bulk payment failed", error);
    res.status(500).json({ error: "Unable to record payment" });
  } finally {
    client.release();
  }
});

app.get("/api/admin/account-requests", authenticate, requireAdmin, async (_req, res) => {
  const result = await pool.query(`SELECT id, user_id AS "userId", account_type AS "accountType", full_name AS "fullName",
    email, phone, city, discipline, club_name AS "clubName", club_type AS "clubType",
    organization_name AS "organizationName", logo_url AS "logoUrl", documents, reviewer_note AS "message", status,
    submitted_at AS "submittedAt", reviewed_at AS "reviewedAt"
    FROM account_requests ORDER BY submitted_at DESC`);
  res.json(result.rows);
});

// Admin: full profile of any user (member or club) with all their documents.
app.get("/api/admin/users/:id/detail", authenticate, requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isSafeInteger(userId)) return res.status(400).json({ error: "Invalid user id" });
  try {
    const userResult = await pool.query(
      `SELECT id, email, role, full_name AS "fullName", phone, city, discipline, club_name AS "clubName",
        account_type AS "accountType", status, public_id AS "publicId", license_number AS "licenseNumber",
        license_expires_at AS "licenseExpiresAt",
        avatar_url AS "avatarUrl", club_type AS "clubType", organization_name AS "organizationName",
        logo_url AS "logoUrl", birth_date AS "birthDate", gender, act_year AS "actYear", act_number AS "actNumber",
        emergency_contact AS "emergencyContact", created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [userId],
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    // Signup documents (latest account request).
    const accountRequest = await pool.query(
      `SELECT id, status, documents, club_type AS "clubType", organization_name AS "organizationName",
        logo_url AS "logoUrl", submitted_at AS "submittedAt", reviewed_at AS "reviewedAt", reviewer_note AS "reviewerNote"
       FROM account_requests WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
      [userId],
    );
    const signupRequest = accountRequest.rows[0] || null;
    const signupDocuments = (signupRequest?.documents || []).map((document) => ({
      id: document.id, name: document.originalName, type: document.type || "Document non précisé",
      mimeType: document.mimeType, size: document.size,
      url: `/api/admin/account-requests/${signupRequest.id}/documents/${document.id}`,
    }));

    // License validation requests + their documents.
    const activations = await pool.query(
      `SELECT id, status, reason, documents, created_at AS "createdAt", reviewed_at AS "reviewedAt", reviewer_note AS "reviewerNote"
       FROM activation_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    const activationRequests = activations.rows.map((row) => ({
      id: row.id, status: row.status, reason: row.reason, createdAt: row.createdAt,
      reviewedAt: row.reviewedAt, reviewerNote: row.reviewerNote,
      documents: (row.documents || []).map((document) => ({
        id: document.id, name: document.originalName, mimeType: document.mimeType, size: document.size,
        url: `/api/admin/activation-requests/${row.id}/documents/${document.id}`,
      })),
    }));

    // For clubs: the roster with each member's documents.
    let clubMembers = [];
    if (user.accountType === "club") {
      const roster = await pool.query(
        `SELECT id, member_id AS "memberId", full_name AS "fullName", birth_date AS "birthDate", age, gender,
          discipline, phone, email, season, quality, approval_status AS "approvalStatus",
          license_number AS "licenseNumber", act_year AS "actYear", act_number AS "actNumber",
          emergency_contact AS "emergencyContact", documents
         FROM club_members WHERE club_user_id = $1 ORDER BY created_at DESC`,
        [userId],
      );
      clubMembers = roster.rows.map((row) => ({
        id: row.id, memberId: row.memberId, fullName: row.fullName, birthDate: row.birthDate, age: row.age,
        gender: row.gender, discipline: row.discipline, phone: row.phone, email: row.email,
        season: row.season, quality: row.quality, approvalStatus: row.approvalStatus,
        licenseNumber: row.licenseNumber, actYear: row.actYear, actNumber: row.actNumber,
        emergencyContact: row.emergencyContact,
        documents: Object.entries(row.documents || {}).map(([key, document]) => ({
          key, name: document.originalName, mimeType: document.mimeType, size: document.size,
          url: `/api/admin/club-members/${row.id}/documents/${document.id}`,
        })),
      }));
    }

    res.json({
      user,
      signup: signupRequest ? { status: signupRequest.status, submittedAt: signupRequest.submittedAt,
        reviewedAt: signupRequest.reviewedAt, reviewerNote: signupRequest.reviewerNote, documents: signupDocuments } : null,
      activationRequests,
      clubMembers,
    });
  } catch (error) {
    console.error("Admin user detail failed", error);
    res.status(500).json({ error: "Unable to load user detail" });
  }
});

// Admin: download any stored club-member document (CIN, photo, parental auth…).
app.get("/api/admin/club-members/:id/documents/:documentId", authenticate, requireAdmin, async (req, res) => {
  try {
    await sendStoredDocument(res, {
      table: "club_members", column: "documents", directory: "data/uploads/club-members",
      rowId: req.params.id, documentId: req.params.documentId, disposition: "inline",
      ownerColumn: "club_user_id",
    });
  } catch {
    res.status(500).json({ error: "Unable to serve document" });
  }
});

/**
 * Serves a stored document from a JSONB array. Shared by the account-request,
 * member-documents and license-renewal download routes.
 */
const sendStoredDocument = async (res, { table, column, directory, rowId, documentId, disposition, ownerColumn, ownerId }) => {
  const result = await pool.query(`SELECT ${column}${ownerColumn ? `, ${ownerColumn}` : ""} FROM ${table} WHERE id = $1`, [rowId]);
  const rawDocuments = result.rows[0]?.[column];
  // documents may be a JSONB array (account/activation requests) or an object keyed by type (club_members).
  const documents = Array.isArray(rawDocuments)
    ? rawDocuments
    : (rawDocuments && typeof rawDocuments === "object" ? Object.values(rawDocuments) : []);
  const document = documents.find((item) => item.id === documentId);
  if (!document) return res.status(404).json({ error: "Document not found" });
  // Club-member files live under <directory>/<club_user_id>/, other tables use <directory>/<rowId>/.
  const fileDir = ownerColumn && result.rows[0]?.[ownerColumn] != null
    ? String(result.rows[0][ownerColumn])
    : String(rowId);
  const filePath = document.storedName
    ? path.resolve(directory, fileDir, document.storedName)
    : path.resolve(directory, fileDir, `${documentId}${path.extname(document.originalName || "").toLowerCase()}`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Document file not found" });
  res.setHeader("Content-Type", document.mimeType);
  res.setHeader("Content-Disposition", `${disposition}; filename*=UTF-8''${encodeURIComponent(document.originalName)}`);
  res.sendFile(filePath);
};

app.get("/api/admin/account-requests/:id/documents/:documentId", authenticate, requireAdmin, async (req, res) => {
  await sendStoredDocument(res, {
    table: "account_requests", column: "documents", directory: "data/uploads/account-requests",
    rowId: req.params.id, documentId: req.params.documentId, disposition: "inline",
  });
});

app.get("/api/member/documents", authenticate, async (req, res) => {
  const result = await pool.query("SELECT id, documents, status FROM account_requests WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 1", [req.auth.userId]);
  const request = result.rows[0];
  if (!request) return res.json([]);
  res.json((request.documents || []).map((document) => ({
    id: document.id, name: document.originalName, type: document.type || "Document non précisé", mimeType: document.mimeType,
    size: document.size, status: request.status, url: `/api/member/documents/${request.id}/${document.id}`,
  })));
});

app.get("/api/member/documents/:requestId/:documentId", authenticate, async (req, res) => {
  // Ownership check first: the member may only fetch their own documents.
  const owned = await pool.query(
    "SELECT 1 FROM account_requests WHERE id = $1 AND user_id = $2",
    [req.params.requestId, req.auth.userId],
  );
  if (!owned.rows[0]) return res.status(404).json({ error: "Document not found" });
  await sendStoredDocument(res, {
    table: "account_requests", column: "documents", directory: "data/uploads/account-requests",
    rowId: req.params.requestId, documentId: req.params.documentId, disposition: "attachment",
  });
});

app.patch("/api/admin/account-requests/:id", authenticate, requireAdmin, async (req, res) => {
  const { status, reviewerNote } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid review status" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const requestResult = await client.query("SELECT * FROM account_requests WHERE id = $1 FOR UPDATE", [req.params.id]);
    const request = requestResult.rows[0];
    if (!request) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Request not found" });
    }
    await client.query("UPDATE account_requests SET status = $1, reviewer_note = $2, reviewed_at = NOW() WHERE id = $3", [status, reviewerNote || null, request.id]);
    await client.query("UPDATE users SET status = $1 WHERE id = $2", [status, request.user_id]);
    if (status === "approved") {
      // Guarantee the user has a license number before publishing the directory entry.
      const userRow = await client.query("SELECT license_number, public_id FROM users WHERE id = $1", [request.user_id]);
      let licenseNumber = userRow.rows[0]?.license_number || null;
      if (!licenseNumber) {
        licenseNumber = await generateLicenseNumber(client, request.account_type);
        await client.query("UPDATE users SET license_number = $1, public_id = $2 WHERE id = $3", [licenseNumber, licenseNumber, request.user_id]);
      }
      // First approval grants a license valid until the current season end.
      await client.query(
        `UPDATE users SET license_expires_at = GREATEST(COALESCE(license_expires_at, $2::date), $2::date) WHERE id = $1`,
        [request.user_id, seasonEnd()],
      );
      await client.query(`INSERT INTO directory_entries (user_id, account_type, entry_type, name, city, discipline, club_name, role, license_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) DO UPDATE SET license_active = true, name = EXCLUDED.name, city = EXCLUDED.city,
          discipline = EXCLUDED.discipline, club_name = EXCLUDED.club_name, role = EXCLUDED.role, license_number = EXCLUDED.license_number`,
        [request.user_id, request.account_type, request.account_type === "club" ? "club" : "member", request.account_type === "club" ? (request.club_name || request.full_name) : request.full_name,
          request.city, request.discipline, request.club_name, request.account_type, licenseNumber]);
    } else {
      await client.query("UPDATE directory_entries SET license_active = false WHERE user_id = $1", [request.user_id]);
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Unable to review request" });
  } finally {
    client.release();
  }
});

app.delete("/api/admin/account-requests/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM account_requests WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "Request not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Unable to delete request" });
  }
});

// ===== Renouvellement annuel des licences (échéance = fin de saison, 30 septembre) =====

// Jours restants avant l'échéance (null si pas d'échéance connue).
const daysUntil = (value) => {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00Z`).getTime();
  if (Number.isNaN(target)) return null;
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`).getTime();
  return Math.ceil((target - today) / 86400000);
};

// Un renouvellement n'a de sens que si la licence est active et pas déjà
// étendue sur la saison suivante.
const canRequestRenewal = (status, expiresAt) =>
  status === "approved" && (!expiresAt || expiresAt < nextSeasonEnd());

// Individu (ou compte club) : échéance, compte à rebours et état de sa demande.
app.get("/api/member/license-renewal", authenticate, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, license_number AS "licenseNumber", public_id AS "publicId",
        status, license_expires_at AS "licenseExpiresAt", account_type AS "accountType"
       FROM users WHERE id = $1`,
      [req.auth.userId],
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: "Profile not found" });
    const year = new Date().getFullYear();
    const renewalResult = await pool.query(
      `SELECT id, status, renewal_documents AS "renewalDocuments", requested_at AS "requestedAt",
        reviewed_at AS "reviewedAt", reviewer_note AS "reviewerNote"
       FROM license_renewals WHERE user_id = $1 AND renewal_year = $2`,
      [req.auth.userId, year],
    );
    res.json({
      licenseNumber: user.licenseNumber || user.publicId || null,
      licenseExpiresAt: asDateOrNull(user.licenseExpiresAt),
      status: user.status,
      season: `${year}-${year + 1}`,
      daysRemaining: daysUntil(asDateOrNull(user.licenseExpiresAt)),
      canRequestRenewal: canRequestRenewal(user.status, asDateOrNull(user.licenseExpiresAt)),
      renewal: renewalResult.rows[0] || null,
    });
  } catch {
    res.status(500).json({ error: "Unable to load renewal info" });
  }
});

// Club : renouvellement pour chacun de ses membres (état + échéance + demande).
app.get("/api/member/club-member-renewals", authenticate, async (req, res) => {
  try {
    const season = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const result = await pool.query(
      `SELECT c.id, c.full_name AS "fullName", c.license_number AS "licenseNumber",
        c.license_expires_at AS "licenseExpiresAt", c.approval_status AS "approvalStatus",
        r.id AS "renewalId", r.season AS "renewalSeason", r.status AS "renewalStatus",
        r.documents AS "renewalDocuments", r.requested_at AS "requestedAt",
        r.reviewed_at AS "reviewedAt", r.reviewer_note AS "reviewerNote", r.note AS "note"
       FROM club_members c
       LEFT JOIN club_member_renewals r
         ON r.club_member_id = c.id AND r.season = $2
       WHERE c.club_user_id = $1
       ORDER BY c.created_at DESC`,
      [req.auth.userId, season],
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load member renewals" });
  }
});

// Club : soumettre (ou compléter) une demande de renouvellement pour un membre,
// avec documents justificatifs obligatoires.
app.post("/api/member/club-members/:id/renewal", authenticate, uploadDocuments, async (req, res) => {
  const memberResult = await pool.query(
    "SELECT id, full_name, approval_status, license_number, license_expires_at FROM club_members WHERE id = $1 AND club_user_id = $2",
    [req.params.id, req.auth.userId],
  );
  const member = memberResult.rows[0];
  if (!member) return res.status(404).json({ error: "Club member not found" });
  if (member.approval_status !== "approved" || !member.license_number) {
    return res.status(409).json({ error: "Ce membre n'a pas encore de licence approuvée" });
  }
  const expiresAt = asDateOrNull(member.license_expires_at);
  if (expiresAt && expiresAt >= nextSeasonEnd()) {
    return res.status(409).json({ error: "La licence de ce membre est déjà à jour pour la saison suivante" });
  }
  const files = req.files || [];
  let documentTypes = [];
  try { documentTypes = JSON.parse(req.body.documentTypes || "[]"); } catch { documentTypes = []; }
  if (files.length === 0) return res.status(400).json({ error: "Au moins un document justificatif est requis" });
  if (documentTypes.length !== files.length || documentTypes.some((type) => typeof type !== "string" || !type.trim())) {
    return res.status(400).json({ error: "Un type est requis pour chaque document" });
  }
  const season = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT id, status, documents FROM club_member_renewals WHERE club_member_id = $1 AND season = $2 FOR UPDATE",
      [member.id, season],
    );
    if (existing.rows[0] && ["submitted", "approved"].includes(existing.rows[0].status)) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: existing.rows[0].status === "approved"
          ? "Le renouvellement de ce membre est déjà approuvé"
          : "Une demande de renouvellement est déjà en cours de traitement",
      });
    }
    let renewalId;
    if (existing.rows[0]) {
      // Rejets précédents : on complète le même dossier.
      renewalId = existing.rows[0].id;
    } else {
      const inserted = await client.query(
        `INSERT INTO club_member_renewals (club_member_id, season, status, documents, note)
         VALUES ($1, $2, 'pending', '[]'::jsonb, $3) RETURNING id`,
        [member.id, season, req.body.note || null],
      );
      renewalId = inserted.rows[0].id;
    }
    const renewalDirectory = path.resolve("data/uploads/club-member-renewals", String(renewalId));
    const documents = [];
    for (const [index, file] of files.entries()) {
      const documentId = randomUUID();
      const storedName = `${documentId}${path.extname(file.originalname).toLowerCase()}`;
      fs.mkdirSync(renewalDirectory, { recursive: true });
      fs.writeFileSync(path.join(renewalDirectory, storedName), file.buffer);
      documents.push({
        id: documentId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storedName,
        type: documentTypes[index].trim(),
      });
    }
    const merged = [...(existing.rows[0]?.documents || []), ...documents];
    await client.query(
      `UPDATE club_member_renewals SET documents = $1::jsonb, status = 'pending', note = $2,
        requested_at = NOW(), reviewed_at = NULL, reviewer_note = NULL, decided_at = NULL
       WHERE id = $3`,
      [JSON.stringify(merged), req.body.note || null, renewalId],
    );
    await client.query("COMMIT");
    res.status(201).json({ ok: true, renewalId, message: "Demande de renouvellement envoyée à l'administration" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Club member renewal submission failed", error);
    res.status(500).json({ error: "Unable to submit renewal request" });
  } finally {
    client.release();
  }
});

app.post("/api/member/license-renewal/initiate", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Le renouvellement exige une licence active et pas déjà étendue.
    const userState = await client.query("SELECT status, license_expires_at FROM users WHERE id = $1 FOR UPDATE", [req.auth.userId]);
    const state = userState.rows[0];
    if (!state) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Profile not found" });
    }
    if (state.status !== "approved") {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Votre licence doit d'abord être activée avant de demander un renouvellement" });
    }
    const expiresAt = asDateOrNull(state.license_expires_at);
    if (expiresAt && expiresAt >= nextSeasonEnd()) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Votre licence est déjà à jour pour la saison suivante" });
    }
    const renewalYear = new Date().getFullYear();

    const previousDocsResult = await client.query(
      `SELECT documents FROM account_requests
       WHERE user_id = $1 AND status = 'approved'
       ORDER BY submitted_at DESC LIMIT 1`,
      [req.auth.userId]
    );

    const previousDocuments = previousDocsResult.rows[0]?.documents || [];

    const result = await client.query(
      `INSERT INTO license_renewals (user_id, renewal_year, status, documents)
       VALUES ($1, $2, 'pending', $3::jsonb)
       ON CONFLICT (user_id, renewal_year)
       DO UPDATE SET status = 'pending', documents = $3::jsonb
       RETURNING id, renewal_year AS "renewalYear", status, documents, renewal_documents AS "renewalDocuments"`,
      [req.auth.userId, renewalYear, JSON.stringify(previousDocuments)]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Renewal initiation failed:", error);
    res.status(500).json({ error: "Unable to initiate renewal" });
  } finally {
    client.release();
  }
});

app.get("/api/member/license-renewal/status", authenticate, async (req, res) => {
  try {
    const renewalYear = new Date().getFullYear();
    const result = await pool.query(
      `SELECT id, renewal_year AS "renewalYear", status, documents, renewal_documents AS "renewalDocuments",
       requested_at AS "requestedAt", completed_at AS "completedAt", reviewed_at AS "reviewedAt"
       FROM license_renewals WHERE user_id = $1 AND renewal_year = $2`,
      [req.auth.userId, renewalYear]
    );
    if (!result.rows[0]) return res.json({ status: "not_started" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Unable to fetch renewal status" });
  }
});

app.post("/api/member/license-renewal/upload-documents", authenticate, uploadDocuments, async (req, res) => {
  const renewalYear = new Date().getFullYear();
  let documentTypes = [];
  let keepExistingDocuments = [];

  try {
    documentTypes = JSON.parse(req.body.documentTypes || "[]");
    keepExistingDocuments = JSON.parse(req.body.keepExistingDocuments || "[]");
  } catch {
    return res.status(400).json({ error: "Invalid document types or keepExistingDocuments" });
  }

  const uploadedFiles = req.files || [];

  if (uploadedFiles.length && (documentTypes.length !== uploadedFiles.length || documentTypes.some((type) => typeof type !== "string" || !type.trim()))) {
    return res.status(400).json({ error: "A document type is required for every uploaded file" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const renewalResult = await client.query(
      `SELECT id, documents FROM license_renewals WHERE user_id = $1 AND renewal_year = $2`,
      [req.auth.userId, renewalYear]
    );
    if (!renewalResult.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "No renewal request found. Please initiate renewal first." });
    }

    const renewalId = renewalResult.rows[0].id;
    const existingDocuments = renewalResult.rows[0].documents || [];
    const renewalDirectory = path.resolve("data/uploads/license-renewals", String(renewalId));

    const finalDocuments = [];

    for (const docId of keepExistingDocuments) {
      const existingDoc = existingDocuments.find(doc => doc.id === docId);
      if (existingDoc) {
        finalDocuments.push(existingDoc);
      }
    }

    for (const [index, file] of uploadedFiles.entries()) {
      const documentId = randomUUID();
      const extension = path.extname(file.originalname).toLowerCase();
      const storedName = `${documentId}${extension}`;
      fs.mkdirSync(renewalDirectory, { recursive: true });
      fs.writeFileSync(path.join(renewalDirectory, storedName), file.buffer);
      finalDocuments.push({
        id: documentId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storedName,
        type: documentTypes[index].trim(),
      });
    }

    if (finalDocuments.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "At least one document is required (keep existing or upload new)" });
    }

    await client.query(
      "UPDATE license_renewals SET renewal_documents = $1::jsonb, status = 'submitted', completed_at = NOW() WHERE id = $2",
      [JSON.stringify(finalDocuments), renewalId]
    );
    await client.query("COMMIT");
    res.json({ ok: true, message: "Documents submitted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Document upload failed:", error);
    res.status(500).json({ error: "Unable to upload documents" });
  } finally {
    client.release();
  }
});

app.get("/api/admin/license-renewals", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT lr.id, lr.user_id AS "userId", lr.renewal_year AS "renewalYear", lr.status,
        lr.renewal_documents AS "renewalDocuments", lr.requested_at AS "requestedAt",
        lr.completed_at AS "completedAt", lr.reviewed_at AS "reviewedAt", lr.reviewer_note AS "reviewerNote",
        u.full_name AS "fullName", u.email, u.account_type AS "accountType",
        u.license_number AS "licenseNumber", u.license_expires_at AS "licenseExpiresAt"
      FROM license_renewals lr
      JOIN users u ON lr.user_id = u.id
      ORDER BY lr.requested_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load renewals" });
  }
});

app.get("/api/admin/license-renewals/:id/documents/:documentId", authenticate, requireAdmin, async (req, res) => {
  await sendStoredDocument(res, {
    table: "license_renewals", column: "renewal_documents", directory: "data/uploads/license-renewals",
    rowId: req.params.id, documentId: req.params.documentId, disposition: "inline",
  });
});

app.patch("/api/admin/license-renewals/:id", authenticate, requireAdmin, async (req, res) => {
  const { status, reviewerNote } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid review status" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const renewalResult = await client.query("SELECT * FROM license_renewals WHERE id = $1 FOR UPDATE", [req.params.id]);
    const renewal = renewalResult.rows[0];
    if (!renewal) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Renewal not found" });
    }
    await client.query(
      "UPDATE license_renewals SET status = $1, reviewer_note = $2, reviewed_at = NOW(), decided_at = NOW() WHERE id = $3",
      [status, reviewerNote || null, renewal.id]
    );
    if (status === "approved") {
      // Le renouvellement étend la licence d'un an (fin de la prochaine saison).
      await client.query(
        "UPDATE users SET license_expires_at = $2::date, status = 'approved' WHERE id = $1",
        [renewal.user_id, nextSeasonEnd()],
      );
      await client.query("UPDATE directory_entries SET license_active = true WHERE user_id = $1", [renewal.user_id]);
    }
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)`,
      [renewal.user_id, "license_renewal_reviewed", "Renouvellement de licence",
        status === "approved"
          ? `Votre renouvellement a été approuvé. Votre licence est valable jusqu'au ${nextSeasonEnd()}.`
          : `Votre demande de renouvellement a été refusée${reviewerNote ? ` : ${reviewerNote}` : "."}`],
    );
    await client.query("COMMIT");
    res.json({ ok: true, licenseExpiresAt: status === "approved" ? nextSeasonEnd() : null });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Unable to review renewal" });
  } finally {
    client.release();
  }
});

// Admin: demandes de renouvellement des licences des membres de club.
app.get("/api/admin/club-member-renewals", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.season AS "season", r.status, r.documents AS "renewalDocuments",
        r.note, r.reviewer_note AS "reviewerNote", r.requested_at AS "requestedAt",
        r.reviewed_at AS "reviewedAt",
        c.id AS "clubMemberId", c.full_name AS "memberName", c.age, c.discipline,
        c.license_number AS "licenseNumber", c.license_expires_at AS "licenseExpiresAt",
        c.approval_status AS "memberStatus",
        u.id AS "clubUserId", u.full_name AS "clubName", u.email AS "clubEmail", u.city AS "clubCity"
      FROM club_member_renewals r
      JOIN club_members c ON c.id = r.club_member_id
      JOIN users u ON u.id = c.club_user_id
      ORDER BY (r.status = 'pending') DESC, r.requested_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load club member renewals" });
  }
});

app.get("/api/admin/club-member-renewals/:id/documents/:documentId", authenticate, requireAdmin, async (req, res) => {
  await sendStoredDocument(res, {
    table: "club_member_renewals", column: "documents", directory: "data/uploads/club-member-renewals",
    rowId: req.params.id, documentId: req.params.documentId, disposition: "inline",
  });
});

app.patch("/api/admin/club-member-renewals/:id", authenticate, requireAdmin, async (req, res) => {
  const { status, reviewerNote } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ error: "Invalid review status" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const renewalResult = await client.query(
      `SELECT r.id, r.club_member_id, r.status, c.full_name, c.license_number,
        c.license_expires_at, c.club_user_id
       FROM club_member_renewals r JOIN club_members c ON c.id = r.club_member_id
       WHERE r.id = $1 FOR UPDATE`,
      [req.params.id],
    );
    const renewal = renewalResult.rows[0];
    if (!renewal) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Renewal not found" });
    }
    let licenseExpiresAt = null;
    if (status === "approved") {
      // Une seule extension par saison : on n'applique la nouvelle échéance que
      // si elle est postérieure à l'actuelle.
      const expiresResult = await client.query(
        `UPDATE club_members
         SET license_expires_at = $2::date, updated_at = NOW()
         WHERE id = $1 AND (license_expires_at IS NULL OR license_expires_at < $2::date)
         RETURNING license_expires_at`,
        [renewal.club_member_id, nextSeasonEnd()],
      );
      licenseExpiresAt = expiresResult.rows[0]?.license_expires_at || null;
    }
    await client.query(
      `UPDATE club_member_renewals SET status = $1, reviewer_note = $2, reviewed_at = NOW(), decided_at = NOW()
       WHERE id = $3`,
      [status, reviewerNote || null, renewal.id],
    );
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)`,
      [renewal.club_user_id, "club_member_renewal_reviewed", "Renouvellement de licence membre",
        status === "approved"
          ? `Le renouvellement de la licence de ${renewal.full_name} (${renewal.license_number}) a été approuvé — valable jusqu'au ${nextSeasonEnd()}.`
          : `Le renouvellement de la licence de ${renewal.full_name} a été refusé${reviewerNote ? ` : ${reviewerNote}` : "."}`],
    );
    await client.query("COMMIT");
    res.json({ ok: true, licenseExpiresAt });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin club-member renewal review failed", error);
    res.status(500).json({ error: "Unable to review club member renewal" });
  } finally {
    client.release();
  }
});

// Admin: club roster (members registered by a club account).
app.get("/api/admin/clubs/:clubId/members", authenticate, requireAdmin, async (req, res) => {
  try {
    const clubId = Number(req.params.clubId);
    if (!Number.isSafeInteger(clubId)) return res.status(400).json({ error: "Invalid club id" });
    const result = await pool.query(
      `SELECT c.id, c.member_id AS "memberId", c.license_number AS "licenseNumber", c.full_name AS "name",
        c.email, c.discipline, c.season, c.age, c.gender, c.quality,
        c.approval_status AS "approvalStatus", c.payment->>'status' AS "paymentStatus",
        u.city, 'athlete' AS role
       FROM club_members c
       JOIN directory_entries d ON d.user_id = c.club_user_id AND d.account_type = 'club'
       JOIN users u ON u.id = c.club_user_id
       WHERE c.club_user_id = (SELECT user_id FROM directory_entries WHERE id = $1)
       ORDER BY c.created_at DESC`,
      [clubId],
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load club members" });
  }
});

// Admin: review a club member (approve => license + directory, reject, or back to pending).
app.patch("/api/admin/club-members/:id", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid review status" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const memberResult = await client.query("SELECT id, club_user_id, approval_status FROM club_members WHERE id = $1 FOR UPDATE", [req.params.id]);
    const member = memberResult.rows[0];
    if (!member) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Club member not found" });
    }
    let licenseNumber = null;
    let licenseExpiresAt = null;
    if (status === "approved") {
      // Approving a club member issues/keeps their FTDAP-ATH license number
      // and sets/extends the annual deadline to the current season end.
      const existing = await client.query("SELECT license_number FROM club_members WHERE id = $1", [req.params.id]);
      licenseNumber = existing.rows[0]?.license_number || null;
      if (!licenseNumber) {
        licenseNumber = await generateLicenseNumber(client, "athlete");
        await client.query("UPDATE club_members SET license_number = $1, member_id = COALESCE(member_id, $1) WHERE id = $2", [licenseNumber, req.params.id]);
      }
      await client.query(
        `UPDATE club_members SET license_expires_at = GREATEST(COALESCE(license_expires_at, $2::date), $2::date) WHERE id = $1`,
        [req.params.id, seasonEnd()],
      );
    } else if (status === "rejected") {
      // A rejected member loses their license number (it stays reserved until re-approval).
      await client.query("UPDATE club_members SET license_number = NULL WHERE id = $1", [req.params.id]);
    }
    // Members live in club_members (resolvable via /api/verify); no directory entry:
    // directory_entries.user_id is UNIQUE and already used by the club itself.
    const updated = await client.query(
      `UPDATE club_members SET approval_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, member_id AS "memberId", license_number AS "licenseNumber",
         license_expires_at AS "licenseExpiresAt",
         full_name AS "fullName", approval_status AS "approvalStatus"`,
      [status, req.params.id],
    );
    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin club-member review failed", error);
    res.status(500).json({ error: "Unable to review club member" });
  } finally {
    client.release();
  }
});

// Admin: club members whose licensing was submitted by their club (payment recorded).
app.get("/api/admin/license-requests", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.member_id AS "memberId", c.license_number AS "licenseNumber",
        c.license_expires_at AS "licenseExpiresAt",
        c.full_name AS "fullName", c.email, c.phone, c.discipline, c.season, c.age, c.gender,
        c.quality, c.approval_status AS "approvalStatus",
        c.payment->>'status' AS "paymentStatus",
        c.payment->'receipt'->>'originalName' AS "receiptName",
        c.payment->'receipt'->>'id' AS "receiptId",
        c.created_at AS "createdAt",
        u.id AS "clubUserId", u.full_name AS "clubName", u.email AS "clubEmail",
        u.city AS "clubCity"
       FROM club_members c
       JOIN users u ON u.id = c.club_user_id
       WHERE c.payment->>'status' = 'paid'
       ORDER BY c.created_at DESC`,
    );
    res.json(result.rows.map((row) => ({
      ...row,
      receiptUrl: row.receiptId ? `/api/admin/club-members/${row.id}/documents/${row.receiptId}` : null,
    })));
  } catch (error) {
    console.error("Admin license requests failed", error);
    res.status(500).json({ error: "Unable to load license requests" });
  }
});

// Clubs join a competition (persisted, replaces the localStorage hack).
app.post("/api/competitions/:id/join", authenticate, async (req, res) => {
  try {
    const competitionId = Number(req.params.id);
    if (!Number.isSafeInteger(competitionId)) return res.status(400).json({ error: "Invalid competition id" });
    const directoryResult = await pool.query(
      "SELECT id, name FROM directory_entries WHERE user_id = $1 AND account_type = 'club'",
      [req.auth.userId],
    );
    const club = directoryResult.rows[0];
    if (!club) return res.status(403).json({ error: "Only approved clubs can join competitions" });
    await pool.query(
      `INSERT INTO competition_entries (competition_id, club_user_id, club_name)
       VALUES ($1, $2, $3) ON CONFLICT (competition_id, club_user_id) DO NOTHING`,
      [competitionId, req.auth.userId, club.name],
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Unable to join competition" });
  }
});

app.get("/api/competitions-joined", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT competition_id FROM competition_entries WHERE club_user_id = $1",
      [req.auth.userId],
    );
    res.json({ joined: result.rows.map((r) => r.competition_id) });
  } catch {
    res.json({ joined: [] });
  }
});

// Admin: dashboard counters for news and competitions.
app.get("/api/admin/news", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, data->>'title' AS title, data->>'description' AS excerpt, created_at AS "createdAt"
       FROM content_items WHERE kind = 'news' ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load news" });
  }
});

app.get("/api/admin/competitions", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, data->>'title' AS name, data->>'dateStart' AS date, data->>'location' AS location
       FROM content_items WHERE kind = 'competitions' ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Unable to load competitions" });
  }
});

if (!process.env.VERCEL) {
  databaseReady = initializeDatabase();
  databaseReady
    .then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
    .catch((error) => {
      console.error("Database startup failed", error);
      process.exit(1);
    });
}

export default app;
