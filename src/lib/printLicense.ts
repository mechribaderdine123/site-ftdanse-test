import QRCode from "qrcode";
import licenseTemplate from "@/assets/license-template.png";
import type { ClubMember } from "@/data/clubMembersStore";

export const printMemberLicense = async (m: ClubMember) => {
  const [first, ...rest] = (m.fullName || "").split(" ");
  const prenom = rest.join(" ") || first;
  const nom = rest.length ? first : "";
  const photo = m.documents.photo?.dataUrl || "";
  const qrData = JSON.stringify({
    kind: "athlete",
    id: m.id,
    name: m.fullName,
    club: m.clubName,
    birthDate: m.birthDate,
    age: m.age,
    gender: m.gender,
    discipline: m.discipline,
    season: m.season,
    quality: m.quality,
    phone: m.phone,
    email: m.email,
  });
  let qrUrl = "";
  try {
    qrUrl = await QRCode.toDataURL(qrData, { width: 220, margin: 1, errorCorrectionLevel: "M" });
  } catch {}

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Licence ${m.id}</title>
<style>
  @page { size: A6 landscape; margin: 0; }
  body { margin: 0; font-family: 'Inter', Arial, sans-serif; background:#f3f4f6; }
  .card { position: relative; width: 620px; height: 400px; margin: 16px auto; background-image:url('${licenseTemplate}'); background-size: cover; background-position: center; }
  .fields { position:absolute; left: 38px; top: 168px; font-size: 14px; color:#0a3d8f; line-height: 1.55; font-weight:600; }
  .fields .row { display:flex; gap:6px; }
  .fields .lbl { width: 130px; color:#7a1d1d; }
  .fields .val { border-bottom:1px dotted #94a3b8; min-width:220px; padding:0 4px; }
  .lic { position:absolute; left: 230px; top: 118px; font-size: 15px; font-weight:700; color:#0a3d8f; }
  .photo { position:absolute; right: 24px; top: 36px; width: 130px; height: 160px; border:2px solid #c2185b; background:#fff; object-fit: cover; }
  .photo-ph { position:absolute; right: 24px; top: 36px; width: 130px; height: 160px; border:2px dashed #c2185b; background:#fff8; display:flex; align-items:center; justify-content:center; color:#c2185b; font-size:11px; }
  .qr { position:absolute; right: 28px; bottom: 18px; width: 86px; height: 86px; background:#fff; padding:4px; border:1px solid #c2185b; border-radius:4px; }
  @media print { body { background:#fff; } .card { margin:0; } }
</style></head>
<body>
  <div class="card">
    <div class="lic">${m.id}</div>
    ${photo ? `<img class="photo" src="${photo}" alt="photo" />` : `<div class="photo-ph">Photo</div>`}
    <div class="fields">
      <div class="row"><span class="lbl">Nom :</span><span class="val">${nom || "—"}</span></div>
      <div class="row"><span class="lbl">Prénom :</span><span class="val">${prenom || "—"}</span></div>
      <div class="row"><span class="lbl">Date de Naissance :</span><span class="val">${m.birthDate || "—"}</span></div>
      <div class="row"><span class="lbl">Saison :</span><span class="val">${m.season || "—"}</span></div>
      <div class="row"><span class="lbl">Qualité :</span><span class="val">${m.quality || m.discipline || "—"}</span></div>
      <div class="row"><span class="lbl">Club :</span><span class="val">${m.clubName || "—"}</span></div>
    </div>
    ${qrUrl ? `<img class="qr" src="${qrUrl}" alt="QR" />` : ""}
  </div>
  <script>
    (function(){
      var imgs = Array.from(document.images);
      var bg = new Image(); bg.src = '${licenseTemplate}'; imgs.push(bg);
      var pending = imgs.filter(function(i){ return !i.complete; }).length;
      function done(){ try { window.parent.postMessage({ type: 'ftdap-license-print-done' }, '*'); } catch (e) {} }
      function go(){ window.focus(); setTimeout(function(){ window.print(); setTimeout(done, 1200); }, 60); }
      window.addEventListener('afterprint', done);
      if (pending === 0) { go(); return; }
      imgs.forEach(function(i){ i.addEventListener('load', function(){ if(--pending<=0) go(); }); i.addEventListener('error', function(){ if(--pending<=0) go(); }); });
    })();
  </script>
</body></html>`;

  document.querySelectorAll('iframe[data-license-print-frame="true"]').forEach((n) => n.remove());
  const iframe = document.createElement("iframe");
  iframe.setAttribute("data-license-print-frame", "true");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed", width: "1px", height: "1px", opacity: "0",
    pointerEvents: "none", border: "0", right: "0", bottom: "0",
  } as CSSStyleDeclaration);

  const cleanup = () => { window.removeEventListener("message", handleMessage); iframe.remove(); };
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === "ftdap-license-print-done") cleanup();
  };
  window.addEventListener("message", handleMessage);
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) { cleanup(); return; }
  doc.open(); doc.write(html); doc.close();
};