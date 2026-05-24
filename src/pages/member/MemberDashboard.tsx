import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Building2, Trophy, GraduationCap, Award, LogOut, BadgeCheck,
  Calendar, MapPin, Mail, Phone, Plus, Pencil, Trash2, Users, FileText,
  TrendingUp, Medal, ShieldCheck, Clock, ArrowLeft,
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
import { Upload, Send, FileCheck2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

  useEffect(() => {
    const raw = localStorage.getItem("ftdap_member");
    if (!raw) { navigate("/member/login"); return; }
    setSession(JSON.parse(raw));
    setClubMembers(loadClubMembers());
  }, [navigate]);

  if (!session) return null;

  const logout = () => {
    localStorage.removeItem("ftdap_member");
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

  const fakeUpload = (file: File): UploadedDoc => ({
    name: file.name, uploadedAt: new Date().toISOString(), size: file.size,
  });

  const handleDocChange = (key: keyof ClubMember["documents"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setCmDocs((prev) => ({ ...prev, [key]: fakeUpload(f) }));
    };

  const age = computeAge(cmBirth);
  const isMinor = cmBirth && age < 18;
  const requiredDocsOk = cmBirth
    ? isMinor
      ? !!cmDocs.birthExtract && !!cmDocs.parentalAuth
      : !!cmDocs.birthExtract && !!cmDocs.cin
    : false;

  const saveClubMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requiredDocsOk) {
      toast({ title: "Documents requis manquants", variant: "destructive" });
      return;
    }
    const data = new FormData(e.currentTarget);
    const m: ClubMember = {
      id: editCm?.id || `cm_${Date.now()}`,
      clubName: session.fullName,
      fullName: data.get("fullName") as string,
      birthDate: cmBirth,
      age,
      gender: (data.get("gender") as "M" | "F") || "M",
      discipline: data.get("discipline") as string,
      phone: (data.get("phone") as string) || undefined,
      email: (data.get("email") as string) || undefined,
      documents: cmDocs,
      payment: cmPayment,
      approval: editCm?.approval || { status: "pending" },
      createdAt: editCm?.createdAt || new Date().toISOString(),
    };
    upsertClubMember(m);
    setClubMembers(loadClubMembers());
    setCmDialog(false);
    toast({ title: editCm ? "Membre modifié" : "Membre ajouté" });
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

  const handleBulkPayment = (file: File) => {
    if (paidMembers.length === 0) return;
    const receipt = fakeUpload(file);
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
              {isClub && <TabsTrigger value="club-competitions">Compétitions</TabsTrigger>}
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
                    <div className="bg-muted/40 border border-border rounded-lg p-3 mb-4 text-xs text-muted-foreground">
                      Activez le statut <strong>Payé</strong> pour les membres qui ont réglé, puis cliquez
                      sur <strong>Payer</strong> pour téléverser un seul reçu commun. Tous les membres
                      marqués payés seront automatiquement soumis pour licence
                      (si leurs documents sont complets). Les membres non payés ne seront pas envoyés.
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Âge</TableHead>
                          <TableHead>Discipline</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Paiement</TableHead>
                          <TableHead>Licence</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myClubMembers.map((m) => {
                          const minor = m.age < 18;
                          const docsCount = Object.values(m.documents).filter(Boolean).length;
                          const required = minor ? 2 : 2;
                          return (
                            <TableRow key={m.id}>
                              <TableCell className="font-medium">
                                {m.fullName}
                                <div className="text-xs text-muted-foreground">{m.gender === "M" ? "Homme" : "Femme"}</div>
                              </TableCell>
                              <TableCell>
                                {m.age} ans
                                {minor && <Badge variant="outline" className="ml-1 text-[10px]">Mineur</Badge>}
                              </TableCell>
                              <TableCell>{m.discipline}</TableCell>
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
                                      📄 {m.payment.receipt.name}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{approvalBadge(m.approval.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
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
                        <Label className="text-xs">مضمون (Extrait de naissance) *</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocChange("birthExtract")} />
                        {cmDocs.birthExtract && <p className="text-xs text-green-700">✓ {cmDocs.birthExtract.name}</p>}
                      </div>
                    </>
                  )}

                  {cmBirth && isMinor && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">مضمون (Extrait de naissance) *</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocChange("birthExtract")} />
                        {cmDocs.birthExtract && <p className="text-xs text-green-700">✓ {cmDocs.birthExtract.name}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">ترخيص أبوي (Autorisation parentale) *</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocChange("parentalAuth")} />
                        {cmDocs.parentalAuth && <p className="text-xs text-green-700">✓ {cmDocs.parentalAuth.name}</p>}
                      </div>
                    </>
                  )}
                </div>

                {/* Payment section */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm">Statut de paiement</h4>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={cmPayment.status === "paid"}
                      onCheckedChange={(c) =>
                        setCmPayment((p) => ({ ...p, status: c ? "paid" : "unpaid" }))
                      }
                    />
                    <span className="text-sm">{cmPayment.status === "paid" ? "Payé" : "Non payé"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le reçu sera téléversé en une seule fois pour tous les membres payés via
                    le bouton « Payer » sur la liste.
                  </p>
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
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleBulkPayment(f);
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setBulkPayDialog(false)}>Annuler</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Join competition dialog */}
          <Dialog open={!!joinDialog} onOpenChange={(o) => !o && setJoinDialog(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Rejoindre : {joinDialog?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les membres du club à engager dans cette compétition.
                </p>
                <div className="max-h-60 overflow-y-auto border border-border rounded-md p-2 space-y-1">
                  {myClubMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Aucun membre. Ajoutez d'abord des membres dans l'onglet "Membres du club".
                    </p>
                  )}
                  {myClubMembers.map((m) => {
                    const eligible = m.approval.status === "accepted";
                    const checked = joinSelection.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-2 rounded ${eligible ? "hover:bg-muted cursor-pointer" : "opacity-60"}`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!eligible}
                          onCheckedChange={(c) => {
                            setJoinSelection((prev) =>
                              c ? [...prev, m.id] : prev.filter((x) => x !== m.id),
                            );
                          }}
                        />
                        <span className="flex-1 text-sm">{m.fullName}</span>
                        <span className="text-xs text-muted-foreground">{m.discipline}</span>
                        {!eligible && (
                          <Badge variant="outline" className="text-[10px]">Licence requise</Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setJoinDialog(null)}>Annuler</Button>
                  <Button
                    disabled={joinSelection.length === 0}
                    onClick={() => {
                      if (!joinDialog) return;
                      const next = [...joinedComps, joinDialog.id];
                      setJoinedComps(next);
                      localStorage.setItem("ftdap_joined_comps", JSON.stringify(next));
                      toast({
                        title: "Inscription envoyée",
                        description: `${joinSelection.length} membre(s) engagé(s) pour ${joinDialog.title}.`,
                      });
                      setJoinDialog(null);
                    }}
                  >
                    Confirmer l'inscription
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MemberDashboard;
