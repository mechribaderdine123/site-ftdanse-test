import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// DATE/TIMESTAMP columns are exposed as "YYYY-MM-DD" strings (not Date objects)
// so the license-expiry logic can compare them safely.
pg.types.setTypeParser(1082, (value) => value);

export const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      full_name VARCHAR(255), phone VARCHAR(100), city VARCHAR(255),
      discipline VARCHAR(255), club_name VARCHAR(255),
      account_type VARCHAR(50) NOT NULL DEFAULT 'athlete',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      public_id VARCHAR(30) UNIQUE,
      license_number VARCHAR(30) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS discipline VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS club_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) NOT NULL DEFAULT 'athlete';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id VARCHAR(30);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(30);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS club_type VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS users_public_id_idx ON users (public_id);
    CREATE UNIQUE INDEX IF NOT EXISTS users_license_number_idx ON users (license_number);

    CREATE TABLE IF NOT EXISTS account_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_type VARCHAR(50) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(100), city VARCHAR(255), discipline VARCHAR(255), club_name VARCHAR(255),
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(50) NOT NULL DEFAULT 'pending', reviewer_note TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, reviewed_at TIMESTAMP
    );
    ALTER TABLE account_requests ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE account_requests ADD COLUMN IF NOT EXISTS reviewer_note TEXT;
    ALTER TABLE account_requests ADD COLUMN IF NOT EXISTS club_type VARCHAR(50);
    ALTER TABLE account_requests ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255);
    ALTER TABLE account_requests ADD COLUMN IF NOT EXISTS logo_url TEXT;

    CREATE TABLE IF NOT EXISTS directory_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      account_type VARCHAR(50) NOT NULL, entry_type VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL, city VARCHAR(255), discipline VARCHAR(255),
      club_name VARCHAR(255), role VARCHAR(255), member_count INTEGER DEFAULT 0,
      license_number VARCHAR(30) UNIQUE,
      license_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE directory_entries ADD COLUMN IF NOT EXISTS license_number VARCHAR(30);
    CREATE UNIQUE INDEX IF NOT EXISTS directory_license_number_idx ON directory_entries (license_number);

    CREATE TABLE IF NOT EXISTS content_items (
      id SERIAL PRIMARY KEY,
      kind VARCHAR(30) NOT NULL,
      data JSONB NOT NULL,
      published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS password_reset_tokens_lookup_idx ON password_reset_tokens (token_hash, expires_at);
    CREATE INDEX IF NOT EXISTS content_items_kind_idx ON content_items (kind);

    CREATE TABLE IF NOT EXISTS license_renewals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      renewal_year INTEGER NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      renewal_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      reviewed_at TIMESTAMP,
      reviewer_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, renewal_year)
    );

    -- Renewal request for club-managed members (files uploaded by the club,
    -- reviewed by the admin; approval extends the member license by one year).
    CREATE TABLE IF NOT EXISTS club_member_renewals (
      id SERIAL PRIMARY KEY,
      club_member_id INTEGER NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
      season VARCHAR(20) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      note TEXT,
      reviewer_note TEXT,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(club_member_id, season)
    );
    CREATE INDEX IF NOT EXISTS club_member_renewals_member_idx ON club_member_renewals (club_member_id);

    -- Annual license expiry (end of the season). NULL for legacy rows: they are
    -- treated as unexpired until their next admin approval sets a real deadline.
    ALTER TABLE users ADD COLUMN IF NOT EXISTS license_expires_at DATE;
    ALTER TABLE club_members ADD COLUMN IF NOT EXISTS license_expires_at DATE;
    ALTER TABLE club_member_renewals ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP;
    ALTER TABLE license_renewals ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP;

    CREATE TABLE IF NOT EXISTS renewal_document_requirements (
      id SERIAL PRIMARY KEY,
      renewal_year INTEGER NOT NULL UNIQUE,
      required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activation_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP,
      reviewer_note TEXT
    );
    ALTER TABLE activation_requests ADD COLUMN IF NOT EXISTS reason TEXT;

    ALTER TABLE club_members ADD COLUMN IF NOT EXISTS act_year INTEGER;
    ALTER TABLE club_members ADD COLUMN IF NOT EXISTS act_number VARCHAR(50);

    ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(2) DEFAULT 'M';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS act_year INTEGER;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS act_number VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

    CREATE TABLE IF NOT EXISTS club_members (
      id SERIAL PRIMARY KEY,
      club_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_id VARCHAR(30) UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      birth_date VARCHAR(20),
      age INTEGER,
      gender VARCHAR(2) DEFAULT 'M',
      discipline VARCHAR(255),
      phone VARCHAR(100), email VARCHAR(255),
      season VARCHAR(20), quality VARCHAR(50),
      club_name VARCHAR(255),
      emergency_contact JSONB,
      documents JSONB NOT NULL DEFAULT '{}'::jsonb,
      payment JSONB NOT NULL DEFAULT '{}'::jsonb,
      approval_status VARCHAR(50) NOT NULL DEFAULT 'pending',
      license_number VARCHAR(30) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS club_members_club_idx ON club_members (club_user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS club_members_member_id_idx ON club_members (member_id);
    CREATE UNIQUE INDEX IF NOT EXISTS club_members_license_idx ON club_members (license_number);

    CREATE TABLE IF NOT EXISTS competition_entries (
      id SERIAL PRIMARY KEY,
      competition_id INTEGER NOT NULL,
      club_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      club_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(competition_id, club_user_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      related_id INTEGER,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, read);
  `);
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-admin-password';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await pool.query(
    `INSERT INTO users (email, password_hash, role, account_type, status, public_id, license_number)
     VALUES ($1, $2, 'admin', 'admin', 'approved', $3, $4)
     ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'approved'`,
    [adminEmail, passwordHash, 'FTDAP-ADM-0001', 'FTDAP-ADM-0001'],
  );

  // Backfill license numbers / public ids for existing rows.
  await backfillIdentifiers();
};

const PREFIX = { athlete: 'ATH', coach: 'COA', referee: 'REF', club: 'CLB', admin: 'ADM' };

/** Generates the next sequential license/public id, e.g. FTDAP-ATH-000123. */
export const generateLicenseNumber = async (client, accountType) => {
  const prefix = PREFIX[accountType] || 'MEM';
  const table = accountType === 'club' ? 'directory_entries' : 'users';
  const result = await client.query(
    `SELECT COUNT(*)::int AS count FROM ${table} WHERE license_number LIKE $1`,
    [`FTDAP-${prefix}-%`],
  );
  const next = (result.rows[0]?.count || 0) + 1;
  let candidate = `FTDAP-${prefix}-${String(next).padStart(6, '0')}`;
  let attempt = next;
  // Guard against race conditions / pre-existing collisions.
  for (let i = 0; i < 50; i += 1) {
    const dup = await client.query(
      `SELECT 1 FROM users WHERE license_number = $1
       UNION ALL SELECT 1 FROM directory_entries WHERE license_number = $1
       UNION ALL SELECT 1 FROM club_members WHERE license_number = $1 LIMIT 1`,
      [candidate],
    );
    if (!dup.rows[0]) return candidate;
    attempt += 1;
    candidate = `FTDAP-${prefix}-${String(attempt).padStart(6, '0')}`;
  }
  // Last resort: random suffix.
  return `FTDAP-${prefix}-${Date.now().toString().slice(-6)}`;
};

/** Same format as licenses, for club-managed members (FTDAP-ATH-xxxxxx). */
export const generateMemberId = async (client) => {
  const result = await client.query(
    `SELECT COUNT(*)::int AS count FROM club_members WHERE member_id LIKE 'FTDAP-ATH-%'`,
  );
  const next = (result.rows[0]?.count || 0) + 1;
  let attempt = next;
  for (let i = 0; i < 50; i += 1) {
    const candidate = `FTDAP-ATH-${String(attempt).padStart(6, '0')}`;
    const dup = await client.query('SELECT 1 FROM club_members WHERE member_id = $1', [candidate]);
    if (!dup.rows[0]) return candidate;
    attempt += 1;
  }
  return `FTDAP-ATH-${Date.now().toString().slice(-6)}`;
};

/** Assign license_number/public_id to any approved user missing them. */
export const backfillIdentifiers = async () => {
  const client = await pool.connect();
  try {
    const missing = await client.query(
      `SELECT id, account_type FROM users
       WHERE role <> 'admin' AND (license_number IS NULL OR public_id IS NULL)`,
    );
    for (const user of missing.rows) {
      const license = await generateLicenseNumber(client, user.account_type || 'athlete');
      await client.query(
        'UPDATE users SET license_number = $1, public_id = $2 WHERE id = $3',
        [license, license, user.id],
      );
    }
    const dirMissing = await client.query(
      `SELECT d.id, d.account_type FROM directory_entries d
       LEFT JOIN users u ON u.id = d.user_id
       WHERE d.license_number IS NULL`,
    );
    for (const entry of dirMissing.rows) {
      const license = await generateLicenseNumber(client, entry.account_type || 'athlete');
      await client.query('UPDATE directory_entries SET license_number = $1 WHERE id = $2', [license, entry.id]);
    }
    const memberMissing = await client.query(
      `SELECT id FROM club_members WHERE member_id IS NULL OR (approval_status = 'approved' AND license_number IS NULL)`,
    );
    for (const member of memberMissing.rows) {
      const memberId = await generateMemberId(client);
      await client.query(
        'UPDATE club_members SET member_id = COALESCE(member_id, $1), license_number = COALESCE(license_number, $1) WHERE id = $2',
        [memberId, member.id],
      );
    }
    // Backfill the annual deadline on rows that were approved before the
    // license_expires_at column existed (season end: 30 September).
    const seasonEnd = `${new Date().getFullYear()}-09-30`;
    await client.query(
      `UPDATE users SET license_expires_at = $1::date
       WHERE role <> 'admin' AND status = 'approved' AND license_expires_at IS NULL`,
      [seasonEnd],
    );
    await client.query(
      `UPDATE club_members SET license_expires_at = $1::date
       WHERE approval_status = 'approved' AND license_expires_at IS NULL`,
      [seasonEnd],
    );
  } finally {
    client.release();
  }
};
