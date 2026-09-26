import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const licenseVerifyUrl = (licenseNumber: string, origin = window.location.origin) =>
  `${origin}/verify/${encodeURIComponent(licenseNumber)}`;

export const makeLicenseQrDataUrl = async (licenseNumber: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(licenseVerifyUrl(licenseNumber), {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch {
    return "";
  }
};

interface LicenseQrProps {
  licenseNumber: string | null | undefined;
  size?: number;
  className?: string;
  caption?: string;
}

/** Inline QR code card showing the auto-generated license ID and live validity badge. */
export const LicenseQrCard = ({ licenseNumber, size = 140, className, caption }: LicenseQrProps) => {
  const [qr, setQr] = useState("");
  const [state, setState] = useState<"loading" | "valid" | "invalid" | "none">("loading");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!licenseNumber) {
        if (!cancelled) setState("none");
        return;
      }
      if (!cancelled) setQr(await makeLicenseQrDataUrl(licenseNumber));
      try {
        const response = await fetch(`/api/verify/${encodeURIComponent(licenseNumber)}`);
        const data = await response.json().catch(() => ({}));
        if (!cancelled) setState(response.ok && data?.valid ? (data.active ? "valid" : "invalid") : "invalid");
      } catch {
        // Offline / API down: still show the QR, just without a verdict.
        if (!cancelled) setState("none");
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [licenseNumber]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className="bg-white rounded-lg border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {state === "loading" ? (
          <Loader2 className="w-8 h-8 text-indigo-300 animate-spin" />
        ) : qr ? (
          <img src={qr} alt={`QR licence ${licenseNumber}`} className="w-full h-full object-contain p-1" />
        ) : (
          <QrCode className="w-14 h-14 text-indigo-300" />
        )}
      </div>
      <p className="font-mono text-sm font-bold text-primary">{licenseNumber || "—"}</p>
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      {state === "valid" && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <ShieldCheck className="w-3.5 h-3.5" /> Licence active
        </span>
      )}
      {state === "invalid" && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
          <ShieldAlert className="w-3.5 h-3.5" /> En attente de validation
        </span>
      )}
    </div>
  );
};

/**
 * Opens the printable license (A6 card with QR + auto ID). Shared by the member
 * space, the club roster and the admin validation/detail pages.
 */
export const openPrintLicenseWindow = async (options: {
  licenseNumber: string;
  fullName: string;
  accountType: string;
  email?: string;
  phone?: string;
  city?: string;
  discipline?: string;
  clubName?: string;
  season?: string;
  photoDataUrl?: string;
  /** Profile picture served by the API (used when no photoDataUrl is given). */
  photoUrl?: string;
  logoUrl?: string;
}) => {
  const {
    licenseNumber, fullName, accountType, email, phone, city, discipline, clubName, season, photoDataUrl, photoUrl, logoUrl,
  } = options;
  const qrUrl = await makeLicenseQrDataUrl(licenseNumber);
  const seasonValue = season || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const typeLabels: Record<string, string> = {
    athlete: "Athlète", coach: "Coach", referee: "Arbitre", club: "Club", admin: "Administration",
  };
  const escapeHtml = (v: string | null | undefined) =>
    String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label: string, value: string | null | undefined) =>
    `<div class="row"><span class="lbl">${label} :</span><span class="val">${escapeHtml(value) || "—"}</span></div>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Licence ${escapeHtml(licenseNumber)}</title>
<style>
  @page { size: A6 landscape; margin: 0; }
  body { margin: 0; font-family: 'Inter', Arial, sans-serif; background:#f3f4f6; }
  .card { position: relative; width: 620px; height: 400px; margin: 16px auto; background:#0a3d8f; border-radius:10px; color:#fff; overflow:hidden; }
  .card:before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#0a3d8f 0%,#7a1d1d 130%); }
  .card > * { position: relative; }
  .head { display:flex; justify-content:space-between; align-items:flex-start; padding:22px 26px 0; }
  .brand { font-size:20px; font-weight:800; letter-spacing:1px; }
  .brand small { display:block; font-size:9px; font-weight:500; opacity:.75; letter-spacing:2px; }
  .lic { margin-top:6px; font-family:monospace; font-size:14px; font-weight:700; color:#ffd166; }
  .badge { font-size:10px; font-weight:700; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.35); padding:5px 12px; border-radius:999px; }
  .photo { width:110px; height:130px; object-fit:cover; border:2px solid rgba(255,255,255,.8); border-radius:6px; background:#fff; }
  .fields { padding:14px 26px 0; font-size:12.5px; line-height:1.9; max-width:360px; }
  .row { display:flex; gap:8px; }
  .lbl { width:150px; opacity:.75; }
  .val { font-weight:600; border-bottom:1px dotted rgba(255,255,255,.4); flex:1; min-width:120px; }
  .qrbox { position:absolute; right:26px; bottom:20px; text-align:center; }
  .qr { width:92px; height:92px; background:#fff; padding:4px; border-radius:6px; }
  .qrbox span { display:block; font-size:8px; margin-top:3px; opacity:.85; }
  .foot { position:absolute; left:26px; bottom:18px; font-size:9.5px; opacity:.7; max-width:340px; }
  .toolbar { text-align:center; padding:12px; }
  .toolbar button { padding:8px 18px; background:#0a3d8f; color:#fff; border:0; border-radius:6px; cursor:pointer; font-weight:600; }
  @media print { .toolbar { display:none; } body { background:#fff; } .card { margin:0; border-radius:0; } }
</style></head>
<body>
  <div class="card">
    <div class="head">
      <div>
        <div class="brand">FTDAP<small>FÉDÉRATION TUNISIENNE DE DANSE</small></div>
        <div class="lic">${escapeHtml(licenseNumber)}</div>
      </div>
      <div style="text-align:right">
        <span class="badge">${escapeHtml(typeLabels[accountType] || accountType)} · SAISON ${escapeHtml(seasonValue)}</span>
        ${photoDataUrl ? `<img class="photo" src="${photoDataUrl}" alt="" style="margin-top:8px"/>` : photoUrl ? `<img class="photo" src="${photoUrl}" alt="" style="margin-top:8px"/>` : logoUrl ? `<img class="photo" src="${logoUrl}" alt="" style="object-fit:contain;padding:4px;margin-top:8px"/>` : ""}
      </div>
    </div>
    <div class="fields">
      ${row("Nom / Organisme", fullName)}
      ${clubName ? row("Club", clubName) : ""}
      ${city ? row("Ville", city) : ""}
      ${discipline ? row("Discipline", discipline) : ""}
      ${email ? row("Email", email) : ""}
      ${phone ? row("Téléphone", phone) : ""}
    </div>
    <div class="qrbox">
      ${qrUrl ? `<img class="qr" src="${qrUrl}" alt="QR"/>` : ""}
      <span>Vérifier: /verify/${escapeHtml(licenseNumber)}</span>
    </div>
    <div class="foot">Licence officielle — vérifiable sur ${escapeHtml(window.location.origin)}/verify/${escapeHtml(licenseNumber)}</div>
  </div>
  <div class="toolbar"><button onclick="window.print()">Imprimer</button></div>
  <script>
    (function(){
      function go(){ window.focus(); setTimeout(function(){ window.print(); }, 250); }
      if (document.readyState === "complete") go(); else window.addEventListener("load", go);
    })();
  </script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
};
