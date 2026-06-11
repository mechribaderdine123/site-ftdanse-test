import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Building2, Trophy, GraduationCap, Award, LogOut, BadgeCheck,
  Calendar, MapPin, Mail, Phone, Plus, Pencil, Trash2, Users, FileText,
  TrendingUp, Medal, ShieldCheck, Clock, ArrowLeft, Eye,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ClubMember, UploadedDoc, loadClubMembers, upsertClubMember,
  removeClubMember, computeAge,
} from "@/data/clubMembersStore";
import { Switch } from "@/components/ui/switch";
import { Upload, Send, FileCheck2, CheckCircle2, XCircle, AlertCircle, Printer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import licenseTemplate from "@/assets/license-template.png";
import QRCode from "qrcode";

type AccountKind = "individual" | "club";
type IndividualRole = "athlete" | "coach" | "referee";

interface MemberSession {
  kind: AccountKind;
  role?: IndividualRole;
  fullName: string;
  email: string;
  city: string;
  discipline: string;
  clubName?: string;
  avatarUrl?: string;
}

interface Dancer {
  id: number;
  name: string;
  age: number;
  discipline: string;
  level: string;
  licenseActive: boolean;
}

const initialDancers: Dancer[] = [
  { id: 1, name: "Yasmine Hamdi", age: 19, discipline: "Hip-Hop", level: "Élite", licenseActive: true },
  { id: 2, name: "Sami Trabelsi", age: 22, discipline: "Breakdance", level: "National", licenseActive: true },
  { id: 3, name: "Mariem Khelifi", age: 17, discipline: "Hip-Hop", level: "Junior", licenseActive: false },
];

const RoleBadge = ({ session }: { session: MemberSession }) => {
  const map = {
    athlete: { label: "Athlète", icon: Trophy, color: "bg-blue-100 text-blue-700" },
    coach: { label: "Coach", icon: GraduationCap, color: "bg-amber-100 text-amber-700" },
    referee: { label: "Arbitre", icon: Award, color: "bg-purple-100 text-purple-700" },
  };
  if (session.kind === "club") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
        <Building2 className="w-3.5 h-3.5" /> Club
      </span>
    );
  }
  const m = map[session.role || "athlete"];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.color}`}>
      <Icon className="w-3.5 h-3.5" /> {m.label}
    </span>
  );
};

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<MemberSession | null>(null);
  const [dancers, setDancers] = useState<Dancer[]>(initialDancers);
  const [dancerDialog, setDancerDialog] = useState(false);
  const [editDancer, setEditDancer] = useState<Dancer | null>(null);
  const [badgeRequested, setBadgeRequested] = useState(false);

  // Club member management state
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [cmDialog, setCmDialog] = useState(false);
  const [editCm, setEditCm] = useState<ClubMember | null>(null);
  const [cmBirth, setCmBirth] = useState<string>("");
  const [cmDocs, setCmDocs] = useState<ClubMember["documents"]>({});
  const [cmPayment, setCmPayment] = useState<ClubMember["payment"]>({ status: "unpaid" });
  const [bulkPayDialog, setBulkPayDialog] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [searchId, setSearchId] = useState<string>("");
  const [viewMember, setViewMember] = useState<ClubMember | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("ftdap_member");
    if (!raw) { navigate("/member/login"); return; }
    setSession(JSON.parse(raw));
    setClubMembers(loadClubMembers());
  }, [navigate]);

  if (!session) return null;

  const logout = () => {
    localStorage.removeItem("ftdap_member");
    window.dispatchEvent(new Event("ftdap-auth-change"));
    navigate("/");
  };

  const requestBadge = () => {
    setBadgeRequested(true);
    toast({ title: "Demande d'activation envoyée", description: "Votre licence sera activée sous 48h." });
  };

  const saveDancer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const d: Dancer = {
      id: editDancer?.id || Date.now(),
      name: data.get("name") as string,
      age: parseInt(data.get("age") as string) || 0,
      discipline: data.get("discipline") as string,
      level: data.get("level") as string,
      licenseActive: false,
    };
    if (editDancer) {
      setDancers((prev) => prev.map((x) => (x.id === d.id ? d : x)));
    } else {
      setDancers((prev) => [d, ...prev]);
    }
    setDancerDialog(false);
    setEditDancer(null);
    toast({ title: editDancer ? "Danseur modifié" : "Danseur ajouté" });
  };

  const removeDancer = (id: number) => {
    setDancers((prev) => prev.filter((d) => d.id !== id));
    toast({ title: "Danseur supprimé" });
  };

  const isClub = session.kind === "club";
  const isAthlete = session.role === "athlete";
  const isCoach = session.role === "coach";
  const isReferee = session.role === "referee";

  // ---------- Club helpers ----------
  const myClubMembers = clubMembers.filter((m) => m.clubName === session.fullName);
  const availableSeasons = Array.from(
    new Set(myClubMembers.map((m) => m.season).filter(Boolean) as string[])
  ).sort().reverse();
  const filteredClubMembers = myClubMembers.filter((m) => {
    const matchSeason = seasonFilter === "all" || (m.season || "—") === seasonFilter;
    const matchId = searchId.trim() === "" || m.id.toLowerCase().includes(searchId.trim().toLowerCase());
    return matchSeason && matchId;
  });

  const openNewClubMember = () => {
    setEditCm(null);
    setCmBirth("");
    setCmDocs({});
    setCmPayment({ status: "unpaid" });
    setCmDialog(true);
  };
  const openEditClubMember = (m: ClubMember) => {
    setEditCm(m);
    setCmBirth(m.birthDate);
    setCmDocs(m.documents);
    setCmPayment(m.payment);
    setCmDialog(true);
  };

  const compressImage = (file: File, maxSize = 600, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("image load failed"));
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("no ctx"));
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const fakeUpload = async (file: File): Promise<UploadedDoc> => {
    let dataUrl: string | undefined;
    if (file.type.startsWith("image/")) {
      try {
        dataUrl = await compressImage(file);
      } catch {
        dataUrl = undefined;
      }
    }
    return { name: file.name, uploadedAt: new Date().toISOString(), size: file.size, dataUrl };
  };

  const handleDocChange = (key: keyof ClubMember["documents"]) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const doc = await fakeUpload(f);
      setCmDocs((prev) => ({ ...prev, [key]: doc }));
    };

  const age = computeAge(cmBirth);
  const isMinor = cmBirth && age < 18;
  const requiredDocsOk = cmBirth
    ? isMinor
      ? !!cmDocs.parentalAuth && !!cmDocs.photo
      : !!cmDocs.cin && !!cmDocs.photo
    : false;

  const saveClubMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requiredDocsOk) {
      toast({ title: "Documents requis manquants", variant: "destructive" });
      return;
    }
    const data = new FormData(e.currentTarget);
    const generateMemberId = () => {
      const yy = new Date().getFullYear().toString().slice(-2);
      const all = loadClubMembers();
      const sameYear = all.filter((x) => /^\d{3}-\d{2}$/.test(x.id) && x.id.endsWith(`-${yy}`));
      const maxSeq = sameYear.reduce((acc, x) => {
        const n = parseInt(x.id.split("-")[0], 10);
        return isNaN(n) ? acc : Math.max(acc, n);
      }, 0);
      return `${String(maxSeq + 1).padStart(3, "0")}-${yy}`;
    };
    const emRel = data.get("emergencyRelation") as string;
    const emName = data.get("emergencyName") as string;
    const emPhone = data.get("emergencyPhone") as string;
    const emEmail = data.get("emergencyEmail") as string;
    const m: ClubMember = {
      id: editCm?.id || generateMemberId(),
      clubName: session.fullName,
      fullName: data.get("fullName") as string,
      birthDate: cmBirth,
      age,
      gender: (data.get("gender") as "M" | "F") || "M",
      discipline: data.get("discipline") as string,
      phone: (data.get("phone") as string) || undefined,
      email: (data.get("email") as string) || undefined,
      season: (data.get("season") as string) || editCm?.season,
      quality: (data.get("quality") as string) || editCm?.quality,
      emergencyContact:
        emRel && emName && emPhone
          ? { relation: emRel, name: emName, phone: emPhone, email: emEmail || undefined }
          : editCm?.emergencyContact,
      documents: cmDocs,
      payment: cmPayment,
      approval: editCm?.approval || { status: "pending" },
      createdAt: editCm?.createdAt || new Date().toISOString(),
    };
    try {
      upsertClubMember(m);
      setClubMembers(loadClubMembers());
      setCmDialog(false);
      toast({ title: editCm ? "Membre modifié" : "Membre ajouté" });
    } catch (err) {
      // Quota likely exceeded — retry without dataUrls
      const slim: ClubMember = {
        ...m,
        documents: Object.fromEntries(
          Object.entries(m.documents).map(([k, v]) => [k, v ? { ...v, dataUrl: undefined } : v])
        ) as ClubMember["documents"],
      };
      try {
        upsertClubMember(slim);
        setClubMembers(loadClubMembers());
        setCmDialog(false);
        toast({
          title: "Membre enregistré",
          description: "Aperçu des images désactivé (stockage local plein).",
        });
      } catch {
        toast({
          title: "Stockage plein",
          description: "Supprimez d'anciens membres pour libérer de l'espace.",
          variant: "destructive",
        });
      }
    }
  };

  const deleteClubMember = (id: string) => {
    removeClubMember(id);
    setClubMembers(loadClubMembers());
    toast({ title: "Membre supprimé" });
  };

  const togglePaymentStatus = (m: ClubMember, paid: boolean) => {
    const all = loadClubMembers();
    const updated = all.map((x) =>
      x.id === m.id
        ? {
            ...x,
            payment: {
              ...x.payment,
              status: paid ? ("paid" as const) : ("unpaid" as const),
              updatedAt: new Date().toISOString(),
              // clear receipt if marked unpaid
              receipt: paid ? x.payment.receipt : undefined,
            },
          }
        : x,
    );
    saveAllAndReload(updated);
  };

  const paidMembers = myClubMembers.filter((m) => m.payment.status === "paid");

  const handleBulkPayment = async (file: File) => {
    if (paidMembers.length === 0) return;
    const receipt = await fakeUpload(file);
    const now = new Date().toISOString();
    const all = loadClubMembers();
    const paidIds = paidMembers.map((p) => p.id);
    const updated = all.map((m) => {
      if (!paidIds.includes(m.id)) return m;
      const docsCount = Object.values(m.documents).filter(Boolean).length;
      const canSubmit = docsCount >= 2;
      return {
        ...m,
        payment: { status: "paid" as const, receipt, updatedAt: now },
        approval: canSubmit
          ? { status: "pending" as const, submittedAt: now }
          : m.approval,
      };
    });
    saveAllAndReload(updated);
    const submittedCount = updated.filter(
      (m) => paidIds.includes(m.id) && m.approval.status === "pending" && m.approval.submittedAt === now,
    ).length;
    toast({
      title: "Paiement enregistré",
      description: `Reçu attaché à ${paidIds.length} membre(s) payé(s). ${submittedCount} soumission(s) envoyée(s) pour licence.`,
    });
    setBulkPayDialog(false);
  };

  const saveAllAndReload = (list: ClubMember[]) => {
    localStorage.setItem("ftdap_club_members", JSON.stringify(list));
    setClubMembers(loadClubMembers());
  };

  const approvalBadge = (status: ClubMember["approval"]["status"]) => {
    const m = {
      pending: { label: "En attente", cls: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
      accepted: { label: "Acceptée", cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
      rejected: { label: "Refusée", cls: "bg-red-100 text-red-700", icon: XCircle },
    }[status];
    const Icon = m.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>
        <Icon className="w-3 h-3" /> {m.label}
      </span>
    );
  };

  const printLicense = async (m: ClubMember) => {
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
  .toolbar { text-align:center; padding: 12px; }
  .toolbar button { padding:8px 16px; background:#0a3d8f; color:#fff; border:0; border-radius:6px; cursor:pointer; }
  @media print { .toolbar { display:none; } body { background:#fff; } .card { margin:0; } }
</style></head>
<body>
  <div class="card">
    <div class="lic">${m.id}</div>
    ${photo
      ? `<img class="photo" src="${photo}" alt="photo" />`
      : `<div class="photo-ph">Photo</div>`}
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
      function done(){
        try { window.parent.postMessage({ type: 'ftdap-license-print-done' }, '*'); } catch (e) {}
      }
      function go(){
        window.focus();
        setTimeout(function(){
          window.print();
          setTimeout(done, 1200);
        }, 60);
      }
      window.addEventListener('afterprint', done);
      if (pending === 0) { go(); return; }
      imgs.forEach(function(i){ i.addEventListener('load', function(){ if(--pending<=0) go(); }); i.addEventListener('error', function(){ if(--pending<=0) go(); }); });
    })();
  </script>
</body></html>`;

    document
      .querySelectorAll('iframe[data-license-print-frame="true"]')
      .forEach((node) => node.remove());

    const iframe = document.createElement("iframe");
    iframe.setAttribute("data-license-print-frame", "true");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.border = "0";
    iframe.style.right = "0";
    iframe.style.bottom = "0";

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      iframe.remove();
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "ftdap-license-print-done") {
        cleanup();
      }
    };

    window.addEventListener("message", handleMessage);
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      cleanup();
      toast({
        title: "Impression impossible",
        description: "Le document de licence n'a pas pu être généré.",
        variant: "destructive",
      });
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" /> Accueil
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>

          {/* Profile header */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 h-28" />
            <CardContent className="pt-0 pb-6">
              <div className="-mt-12 mb-4">
                <div className="w-24 h-24 shrink-0 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center overflow-hidden">
                  {isClub && session.avatarUrl ? (
                    <img src={session.avatarUrl} alt="Logo club" className="w-full h-full object-cover" />
                  ) : isClub ? (
                    <Building2 className="w-10 h-10 text-primary" />
                  ) : (
                    <User className="w-10 h-10 text-primary" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground break-words">{session.fullName}</h1>
                  <RoleBadge session={session} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {session.email}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.city}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {session.discipline}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="profile">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="profile">Mon profil</TabsTrigger>
              {isAthlete && <TabsTrigger value="badge">Ma licence</TabsTrigger>}
              {isAthlete && <TabsTrigger value="results">Mes résultats</TabsTrigger>}
              {isCoach && <TabsTrigger value="dancers">Mes danseurs</TabsTrigger>}
              {isClub && <TabsTrigger value="club-members">Membres du club</TabsTrigger>}
              {isReferee && <TabsTrigger value="missions">Mes missions</TabsTrigger>}
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* PROFILE */}
            <TabsContent value="profile">
              <Card>
                <CardHeader><CardTitle>Mes informations</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  {isClub && (
                    <div className="sm:col-span-2 space-y-2">
                      <Label>Logo du club</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                          {session.avatarUrl ? (
                            <img src={session.avatarUrl} alt="Logo club" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const url = ev.target?.result as string;
                                const updated = { ...session, avatarUrl: url };
                                localStorage.setItem("ftdap_member", JSON.stringify(updated));
                                setSession(updated);
                                toast({ title: "Logo mis à jour" });
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span><Upload className="w-3.5 h-3.5 mr-1" /> Changer l'image</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{isClub ? "Nom du club" : "Nom complet"}</Label>
                    <Input defaultValue={session.fullName} />
                  </div>
                  <div className="space-y-2"><Label>Email</Label><Input defaultValue={session.email} /></div>
                  <div className="space-y-2"><Label>Ville</Label><Input defaultValue={session.city} /></div>
                  <div className="space-y-2"><Label>Discipline</Label><Input defaultValue={session.discipline} /></div>
                  {!isClub && session.clubName && (
                    <div className="space-y-2"><Label>Club d'appartenance</Label><Input defaultValue={session.clubName} /></div>
                  )}
                  {isClub && (
                    <>
                      <div className="space-y-2">
                        <Label>Type d'organisme</Label>
                        <Input defaultValue="Association" placeholder="Institution / Association / Organisme privé" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nom de l'organisme</Label>
                        <Input placeholder="Ex. Ministère de la Jeunesse" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date de fondation</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Numéro d'affiliation FTDAP</Label>
                        <Input placeholder="FTDAP-CLB-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone principal</Label>
                        <Input type="tel" placeholder="+216 .. ... ..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone secondaire</Label>
                        <Input type="tel" placeholder="+216 .. ... ..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Adresse complète</Label>
                        <Input placeholder="Rue, quartier" />
                      </div>
                      <div className="space-y-2">
                        <Label>Code postal</Label>
                        <Input placeholder="1000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Gouvernorat</Label>
                        <Input placeholder="Tunis" />
                      </div>
                      <div className="space-y-2">
                        <Label>Localisation (Google Maps)</Label>
                        <Input placeholder="https://maps.google.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Président / Représentant légal</Label>
                        <Input placeholder="Nom complet" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email du président</Label>
                        <Input type="email" placeholder="president@club.tn" />
                      </div>
                      <div className="space-y-2">
                        <Label>Site web</Label>
                        <Input placeholder="https://monclub.tn" />
                      </div>
                      <div className="space-y-2">
                        <Label>Facebook</Label>
                        <Input placeholder="https://facebook.com/monclub" />
                      </div>
                      <div className="space-y-2">
                        <Label>Instagram</Label>
                        <Input placeholder="@monclub" />
                      </div>
                      <div className="space-y-2">
                        <Label>TikTok</Label>
                        <Input placeholder="@monclub" />
                      </div>
                      <div className="space-y-2">
                        <Label>YouTube</Label>
                        <Input placeholder="https://youtube.com/@monclub" />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input placeholder="+216 .. ... ..." />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Disciplines enseignées</Label>
                        <Input placeholder="Hip-Hop, Breakdance, Salsa..." />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Description du club</Label>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Présentez votre club, son histoire, sa mission..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horaires d'ouverture</Label>
                        <Input placeholder="Lun-Ven 9h-20h, Sam 9h-13h" />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacité d'accueil</Label>
                        <Input type="number" placeholder="Nombre de danseurs" />
                      </div>
                    </>
                  )}
                  <div className="sm:col-span-2 flex justify-end">
                    <Button onClick={() => toast({ title: "Profil mis à jour" })}>Enregistrer</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ATHLETE BADGE */}
            {isAthlete && (
              <TabsContent value="badge">
                <Card>
                  <CardHeader><CardTitle>Ma licence FTDAP</CardTitle></CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl p-6 max-w-md">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-xs opacity-80">Licence n°</p>
                          <p className="font-mono text-lg font-bold">FTDAP-2025-{Math.floor(Math.random() * 9000 + 1000)}</p>
                        </div>
                        <BadgeCheck className="w-10 h-10" />
                      </div>
                      <p className="font-bold text-xl">{session.fullName}</p>
                      <p className="text-sm opacity-90">{session.discipline} · {session.city}</p>
                      <div className="mt-6 pt-4 border-t border-primary-foreground/20 flex items-center justify-between text-xs">
                        <span>Saison 2025</span>
                        <span className={`px-2 py-0.5 rounded-full ${badgeRequested ? "bg-yellow-400 text-yellow-900" : "bg-green-400 text-green-900"}`}>
                          {badgeRequested ? "En attente" : "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Button onClick={requestBadge} disabled={badgeRequested}>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        {badgeRequested ? "Demande envoyée" : "Demander l'activation"}
                      </Button>
                      <Button variant="outline">Télécharger PDF</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* ATHLETE RESULTS */}
            {isAthlete && (
              <TabsContent value="results">
                <Card>
                  <CardHeader><CardTitle>Mes résultats</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <Medal className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
                        <p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Or</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <Medal className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-2xl font-bold">5</p><p className="text-xs text-muted-foreground">Argent</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                        <p className="text-2xl font-bold">240</p><p className="text-xs text-muted-foreground">Points</p>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>Compétition</TableHead><TableHead>Date</TableHead><TableHead>Classement</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { c: "Championnat National 2025", d: "12/03/2025", r: "1er" },
                          { c: "Coupe de Tunis", d: "20/02/2025", r: "2ème" },
                          { c: "Open Sousse", d: "15/01/2025", r: "1er" },
                        ].map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{r.c}</TableCell>
                            <TableCell>{r.d}</TableCell>
                            <TableCell><Badge>{r.r}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* COACH DANCERS (simple) */}
            {isCoach && (
              <TabsContent value="dancers">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Mes danseurs</CardTitle>
                    <Button size="sm" onClick={() => { setEditDancer(null); setDancerDialog(true); }}>
                      <Plus className="w-4 h-4 mr-2" /> Ajouter un danseur
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead><TableHead>Âge</TableHead>
                          <TableHead>Discipline</TableHead><TableHead>Niveau</TableHead>
                          <TableHead>Licence</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dancers.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell>{d.age} ans</TableCell>
                            <TableCell>{d.discipline}</TableCell>
                            <TableCell>{d.level}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${d.licenseActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {d.licenseActive ? "Active" : "En attente"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => { setEditDancer(d); setDancerDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeDancer(d.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {dancers.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun danseur enregistré</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* CLUB MEMBERS — full management */}
            {isClub && (
              <TabsContent value="club-members">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Membres du club</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gestion des inscriptions, paiements et soumissions de licence
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={paidMembers.length === 0}
                        onClick={() => setBulkPayDialog(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Payer ({paidMembers.length})
                      </Button>
                      <Button size="sm" variant="outline" onClick={openNewClubMember}>
                        <Plus className="w-4 h-4 mr-2" /> Nouveau membre
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Filtrer par saison :</Label>
                        <select
                          value={seasonFilter}
                          onChange={(e) => setSeasonFilter(e.target.value)}
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="all">Toutes les saisons</option>
                          {availableSeasons.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Rechercher par ID :</Label>
                        <Input
                          type="text"
                          placeholder="Ex: ATH-123456"
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          className="h-9 w-48"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {filteredClubMembers.length} membre(s)
                      </span>
                    </div>
                    <div className="bg-muted/40 border border-border rounded-lg p-3 mb-4 text-xs text-muted-foreground">
                      Activez le statut <strong>Payé</strong> pour les membres qui ont réglé, puis cliquez
                      sur <strong>Payer</strong> pour téléverser un seul reçu commun. Tous les membres
                      marqués payés seront automatiquement soumis pour licence
                      (si leurs documents sont complets). Les membres non payés ne seront pas envoyés.
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photo</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>ID Athlète</TableHead>
                          <TableHead>Âge</TableHead>
                          <TableHead>Discipline</TableHead>
                          <TableHead>Saison</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Paiement</TableHead>
                          <TableHead>Licence</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClubMembers.map((m) => {
                          const minor = m.age < 18;
                          const docsCount = Object.values(m.documents).filter(Boolean).length;
                          const required = minor ? 2 : 1;
                          return (
                            <TableRow key={m.id}>
                              <TableCell>
                                <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                                  {m.documents.photo?.dataUrl ? (
                                    <img src={m.documents.photo.dataUrl} alt={m.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {m.fullName}
                                <div className="text-xs text-muted-foreground">{m.gender === "M" ? "Homme" : "Femme"}</div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs">{m.id}</span>
                              </TableCell>
                              <TableCell>
                                {m.age} ans
                                {minor && <Badge variant="outline" className="ml-1 text-[10px]">Mineur</Badge>}
                              </TableCell>
                              <TableCell>{m.discipline}</TableCell>
                              <TableCell className="text-xs">{m.season || "—"}</TableCell>
                              <TableCell>
                                <span className={`text-xs ${docsCount >= required ? "text-green-700" : "text-yellow-700"}`}>
                                  {docsCount}/{required} fournis
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={m.payment.status === "paid"}
                                    onCheckedChange={(c) => togglePaymentStatus(m, c)}
                                  />
                                  <span className={`text-xs font-medium ${m.payment.status === "paid" ? "text-green-700" : "text-muted-foreground"}`}>
                                    {m.payment.status === "paid" ? "Payé" : "Non payé"}
                                  </span>
                                  {m.payment.receipt && (
                                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={m.payment.receipt.name}>
                                      {m.payment.receipt.name}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{approvalBadge(m.approval.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" title="Voir profil" onClick={() => setViewMember(m)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" title="Imprimer la licence" onClick={() => printLicense(m)}>
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => openEditClubMember(m)}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-destructive"
                                    onClick={() => deleteClubMember(m.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    {myClubMembers.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Aucun membre enregistré</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* REFEREE MISSIONS */}
            {isReferee && (
              <TabsContent value="missions">
                <Card>
                  <CardHeader><CardTitle>Mes missions d'arbitrage</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { event: "Championnat National 2025", date: "15/05/2025", venue: "Tunis", role: "Juge principal", status: "À venir" },
                        { event: "Coupe Sousse", date: "22/04/2025", venue: "Sousse", role: "Juge", status: "À venir" },
                        { event: "Open Hammamet", date: "10/03/2025", venue: "Nabeul", role: "Juge", status: "Terminée" },
                      ].map((m, i) => (
                        <div key={i} className="border border-border rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{m.event}</h4>
                            <Badge variant={m.status === "À venir" ? "default" : "secondary"}>{m.status}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.date}</p>
                            <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.venue}</p>
                            <p className="flex items-center gap-1"><Award className="w-3 h-3" /> {m.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1"><Award className="w-3 h-3" /> Arbitre National FTDAP</Badge>
                    <Badge variant="outline" className="gap-1"><Award className="w-3 h-3" /> Certifié WDSF</Badge>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* DOCUMENTS */}
            <TabsContent value="documents">
              <Card>
                <CardHeader><CardTitle>Mes documents</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["CIN.pdf", "Photo identité.jpg", isClub ? "Statuts club.pdf" : "Certificat médical.pdf"].map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <FileText className="w-5 h-5 text-accent" />
                        <span className="flex-1 text-sm font-medium">{doc}</span>
                        <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Validé</Badge>
                        <Button variant="ghost" size="sm">Télécharger</Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un document
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dancer dialog */}
          <Dialog open={dancerDialog} onOpenChange={setDancerDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editDancer ? "Modifier le danseur" : "Ajouter un danseur"}</DialogTitle></DialogHeader>
              <form onSubmit={saveDancer} className="space-y-4">
                <div className="space-y-2"><Label>Nom complet</Label><Input name="name" defaultValue={editDancer?.name} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Âge</Label><Input name="age" type="number" defaultValue={editDancer?.age} required /></div>
                  <div className="space-y-2"><Label>Niveau</Label><Input name="level" defaultValue={editDancer?.level || "Junior"} required /></div>
                </div>
                <div className="space-y-2"><Label>Discipline</Label><Input name="discipline" defaultValue={editDancer?.discipline} required /></div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDancerDialog(false)}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Club member dialog */}
          <Dialog open={cmDialog} onOpenChange={setCmDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editCm ? "Modifier le membre" : "Nouveau membre du club"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={saveClubMember} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>ID Athlète</Label>
                    <Input
                      value={editCm?.id || "Généré automatiquement à l'enregistrement"}
                      readOnly
                      className="font-mono bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom complet *</Label>
                    <Input name="fullName" defaultValue={editCm?.fullName} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance *</Label>
                    <Input type="date" value={cmBirth} onChange={(e) => setCmBirth(e.target.value)} required />
                    {cmBirth && (
                      <p className="text-xs text-muted-foreground">
                        {age} ans · {isMinor ? "Mineur (< 18 ans)" : "Adulte (≥ 18 ans)"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <select name="gender" defaultValue={editCm?.gender || "M"}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline *</Label>
                    <Input name="discipline" defaultValue={editCm?.discipline} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input name="phone" defaultValue={editCm?.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" defaultValue={editCm?.email} />
                  </div>
                  <div className="space-y-2">
                    <Label>Saison *</Label>
                    <Input name="season" defaultValue={editCm?.season || "2024-2025"} placeholder="Ex. 2024-2025" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Qualité</Label>
                    <select
                      name="quality"
                      defaultValue={editCm?.quality || "Athlète"}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Athlète">Athlète</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Élite">Élite</option>
                      <option value="Coach">Coach</option>
                    </select>
                  </div>
                  {cmBirth && (
                    <>
                      <div className="space-y-2">
                        <Label>Année (السنة) *</Label>
                        <Input name="actYear" type="number" min="1900" max="2100" placeholder="Ex. 2012" required />
                      </div>
                      <div className="space-y-2">
                        <Label>N° d'acte (رقم العقد) *</Label>
                        <Input name="actNumber" placeholder="Ex. 12345" required />
                      </div>
                    </>
                  )}
                </div>

                {/* Documents section */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">
                      Documents requis {cmBirth && (isMinor ? "(Mineur)" : "(Adulte)")}
                    </h4>
                  </div>
                  {!cmBirth && (
                    <p className="text-xs text-muted-foreground">
                      Saisissez la date de naissance pour afficher les documents requis.
                    </p>
                  )}

                  {cmBirth && !isMinor && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">CIN (Carte d'identité nationale) *</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocChange("cin")} />
                        {cmDocs.cin && <p className="text-xs text-green-700">✓ {cmDocs.cin.name}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Photo d'identité *</Label>
                        <Input type="file" accept=".jpg,.jpeg,.png" onChange={handleDocChange("photo")} />
                        {cmDocs.photo && <p className="text-xs text-green-700">✓ {cmDocs.photo.name}</p>}
                      </div>

                      <div className="border-t border-border pt-3 space-y-3">
                        <h5 className="text-xs font-semibold">
                          Contact en cas d'urgence
                        </h5>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Lien / Relation *</Label>
                            <Input name="emergencyRelation" defaultValue={editCm?.emergencyContact?.relation} required placeholder="Ex. Conjoint, Ami, Frère..." />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nom complet *</Label>
                            <Input name="emergencyName" defaultValue={editCm?.emergencyContact?.name} required />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Téléphone *</Label>
                            <Input name="emergencyPhone" type="tel" defaultValue={editCm?.emergencyContact?.phone} required placeholder="+216 .. ... ..." />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-xs">Email</Label>
                            <Input name="emergencyEmail" type="email" defaultValue={editCm?.emergencyContact?.email} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {cmBirth && isMinor && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">ترخيص أبوي (Autorisation parentale) *</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocChange("parentalAuth")} />
                        {cmDocs.parentalAuth && <p className="text-xs text-green-700">✓ {cmDocs.parentalAuth.name}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">الصورة (Photo d'identité) *</Label>
                        <Input type="file" accept=".jpg,.jpeg,.png" onChange={handleDocChange("photo")} />
                        {cmDocs.photo && <p className="text-xs text-green-700">✓ {cmDocs.photo.name}</p>}
                      </div>

                      <div className="border-t border-border pt-3 space-y-3">
                        <h5 className="text-xs font-semibold">
                          Contact d'urgence — Parent (obligatoire pour les mineurs)
                        </h5>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Lien de parenté *</Label>
                            <select
                              name="emergencyRelation"
                              required
                              defaultValue={editCm?.emergencyContact?.relation || "father"}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="father">Père (الأب)</option>
                              <option value="mother">Mère (الأم)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nom complet du parent *</Label>
                            <Input name="emergencyName" defaultValue={editCm?.emergencyContact?.name} required />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Téléphone *</Label>
                            <Input name="emergencyPhone" type="tel" defaultValue={editCm?.emergencyContact?.phone} required placeholder="+216 .. ... ..." />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-xs">Email du parent</Label>
                            <Input name="emergencyEmail" type="email" defaultValue={editCm?.emergencyContact?.email} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>


                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCmDialog(false)}>Annuler</Button>
                  <Button type="submit" disabled={!requiredDocsOk}>Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Bulk payment dialog */}
          <Dialog open={bulkPayDialog} onOpenChange={setBulkPayDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reçu de paiement groupé</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous allez attacher un reçu commun à <strong>{paidMembers.length} membre(s) payé(s)</strong>
                  {" "}et les soumettre pour licence.
                </p>
                <div className="max-h-40 overflow-y-auto border border-border rounded-md p-2 text-xs space-y-1">
                  {paidMembers.map((m) => {
                      const docsOk = Object.values(m.documents).filter(Boolean).length >= 2;
                      return (
                        <div key={m.id} className="flex justify-between">
                          <span>{m.fullName}</span>
                          <span className={docsOk ? "text-green-700" : "text-yellow-700"}>
                            {docsOk ? "Sera soumis" : "Reçu seulement (docs incomplets)"}
                          </span>
                        </div>
                      );
                    })}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reçu de paiement (PDF ou image) *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) await handleBulkPayment(f);
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setBulkPayDialog(false)}>Annuler</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Member profile view */}
          <Dialog open={!!viewMember} onOpenChange={(o) => !o && setViewMember(null)}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Profil du membre</DialogTitle>
              </DialogHeader>
              {viewMember && (() => {
                const m = viewMember;
                const minor = m.age < 18;
                const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60 text-sm">
                    <div className="text-muted-foreground">{label}</div>
                    <div className="col-span-2 font-medium break-words">{value || "—"}</div>
                  </div>
                );
                const DocItem = ({ label, doc }: { label: string; doc?: UploadedDoc }) => (
                  <div className="flex items-center justify-between gap-2 py-2 border-b border-border/60 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    {doc ? (
                      doc.dataUrl ? (
                        <a href={doc.dataUrl} target="_blank" rel="noreferrer" className="text-primary underline truncate max-w-[60%]">{doc.name}</a>
                      ) : (
                        <span className="truncate max-w-[60%]">{doc.name}</span>
                      )
                    ) : (
                      <span className="text-yellow-700 text-xs">Non fourni</span>
                    )}
                  </div>
                );
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                        {m.documents.photo?.dataUrl ? (
                          <img src={m.documents.photo.dataUrl} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{m.fullName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{m.id}</div>
                        <div className="mt-1">{approvalBadge(m.approval.status)}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Informations personnelles</h4>
                      <Row label="Nom complet" value={m.fullName} />
                      <Row label="Genre" value={m.gender === "M" ? "Homme" : "Femme"} />
                      <Row label="Date de naissance" value={m.birthDate} />
                      <Row label="Âge" value={`${m.age} ans${minor ? " (Mineur)" : ""}`} />
                      <Row label="Téléphone" value={m.phone} />
                      <Row label="Email" value={m.email} />
                      <div className="pt-3 mt-2 border-t border-border/40">
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1">
                          {minor ? "Contact d'urgence — Parent" : "Contact en cas d'urgence"}
                        </h5>
                      </div>
                      <Row
                        label={minor ? "Lien de parenté" : "Relation"}
                        value={
                          m.emergencyContact?.relation === "father"
                            ? "Père (الأب)"
                            : m.emergencyContact?.relation === "mother"
                            ? "Mère (الأم)"
                            : m.emergencyContact?.relation
                        }
                      />
                      <Row label={minor ? "Nom complet du parent" : "Nom"} value={m.emergencyContact?.name} />
                      <Row label="Téléphone" value={m.emergencyContact?.phone} />
                      <Row label={minor ? "Email du parent" : "Email"} value={m.emergencyContact?.email} />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Sportif</h4>
                      <Row label="Club" value={m.clubName} />
                      <Row label="Discipline" value={m.discipline} />
                      <Row label="Qualité" value={m.quality} />
                      <Row label="Saison" value={m.season} />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Documents</h4>
                      {minor ? (
                        <>
                          <DocItem label="Extrait de naissance" doc={m.documents.birthExtract} />
                          <DocItem label="Autorisation parentale" doc={m.documents.parentalAuth} />
                          <DocItem label="Photo" doc={m.documents.photo} />
                        </>
                      ) : (
                        <>
                          <DocItem label="CIN" doc={m.documents.cin} />
                          <DocItem label="Extrait de naissance" doc={m.documents.birthExtract} />
                        </>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Paiement</h4>
                      <Row label="Statut" value={m.payment.status === "paid" ? "Payé" : "Non payé"} />
                      <Row label="Montant" value={m.payment.amount ? `${m.payment.amount} DT` : "—"} />
                      <Row label="Mis à jour" value={m.payment.updatedAt ? new Date(m.payment.updatedAt).toLocaleString() : "—"} />
                      <DocItem label="Reçu" doc={m.payment.receipt} />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Licence</h4>
                      <Row label="Statut" value={approvalBadge(m.approval.status)} />
                      <Row label="Soumis le" value={m.approval.submittedAt ? new Date(m.approval.submittedAt).toLocaleString() : "—"} />
                      <Row label="Revu le" value={m.approval.reviewedAt ? new Date(m.approval.reviewedAt).toLocaleString() : "—"} />
                      <Row label="Note du réviseur" value={m.approval.reviewerNote} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => { setViewMember(null); openEditClubMember(m); }}>
                        <Pencil className="w-4 h-4 mr-1" /> Modifier
                      </Button>
                      <Button onClick={() => printLicense(m)}>
                        <Printer className="w-4 h-4 mr-1" /> Licence
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MemberDashboard;
