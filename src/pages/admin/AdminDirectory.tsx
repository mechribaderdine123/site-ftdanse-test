import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, Search, User, Building2, Mail, Phone,
  Check, X, Eye, Inbox, GraduationCap, Users as UsersIcon, Trophy,
  FileText, Receipt, ShieldCheck, ArrowLeft, UserRound, QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { ClubMember, loadClubMembers, upsertClubMember } from "@/data/clubMembersStore";
import MemberQRDialog, { MemberQRPayload } from "@/components/shared/MemberQRDialog";

type AccountType = "athlete" | "club" | "coach" | "trainer";
type RequestStatus = "pending" | "approved" | "rejected";

interface DirectoryEntry {
  id: number;
  type: "member" | "club";
  accountType?: AccountType;
  name: string;
  city: string;
  discipline: string;
  role?: string;
  memberCount?: number;
  licenseActive: boolean;
  email?: string;
  phone?: string;
}

interface AccountRequest {
  id: number;
  accountType: AccountType;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  discipline: string;
  clubName?: string;
  experience?: string;
  message?: string;
  submittedAt: string;
  status: RequestStatus;
}

const initialData: DirectoryEntry[] = [
  { id: 1, type: "member", accountType: "athlete", name: "Ahmed Ben Ali", city: "Tunis", discipline: "Breakdance", role: "Danseur", licenseActive: true, email: "ahmed@mail.com", phone: "+216 20 111 222" },
  { id: 2, type: "member", accountType: "athlete", name: "Yasmine Hamdi", city: "Sousse", discipline: "Salsa", role: "Arbitre", licenseActive: true },
  { id: 3, type: "club", name: "Club Elite Dance", city: "Tunis", discipline: "Multi-disciplines", memberCount: 45, licenseActive: true },
  { id: 4, type: "member", accountType: "coach", name: "Sami Trabelsi", city: "Sfax", discipline: "Hip-Hop", role: "Coach", licenseActive: false },
  { id: 5, type: "club", name: "Dance Academy", city: "Hammamet", discipline: "Ballet, Jazz", memberCount: 30, licenseActive: true },
];

const initialRequests: AccountRequest[] = [
  {
    id: 101, accountType: "athlete", fullName: "Mariem Khelifi", email: "mariem.k@mail.com",
    phone: "+216 22 345 678", city: "Tunis", discipline: "Breakdance",
    experience: "3 ans de pratique en compétition régionale",
    message: "Je souhaite rejoindre la fédération pour participer aux compétitions nationales.",
    submittedAt: "2025-04-22", status: "pending",
  },
  {
    id: 102, accountType: "club", fullName: "Karim Bouazizi", email: "contact@dancestars.tn",
    phone: "+216 71 234 567", city: "Sfax", discipline: "Multi-disciplines",
    clubName: "Dance Stars Academy",
    message: "Affiliation officielle pour notre club de 25 membres.",
    submittedAt: "2025-04-21", status: "pending",
  },
  {
    id: 103, accountType: "coach", fullName: "Leila Mansouri", email: "leila.coach@mail.com",
    phone: "+216 98 765 432", city: "Sousse", discipline: "Salsa, Bachata",
    experience: "10 ans d'enseignement, certifiée niveau international",
    submittedAt: "2025-04-20", status: "pending",
  },
  {
    id: 104, accountType: "trainer", fullName: "Hatem Gharbi", email: "hatem.g@mail.com",
    phone: "+216 55 123 456", city: "Bizerte", discipline: "Hip-Hop",
    experience: "Entraîneur d'équipe, 7 ans d'expérience",
    clubName: "Club Urban Move",
    submittedAt: "2025-04-18", status: "approved",
  },
  {
    id: 105, accountType: "athlete", fullName: "Walid Saidi", email: "walid.s@mail.com",
    phone: "+216 27 999 888", city: "Monastir", discipline: "Krump",
    submittedAt: "2025-04-15", status: "rejected",
  },
];

const accountTypeMeta: Record<AccountType, { label: string; icon: typeof User; color: string }> = {
  athlete: { label: "Athlète", icon: Trophy, color: "bg-blue-100 text-blue-700" },
  club: { label: "Club", icon: Building2, color: "bg-violet-100 text-violet-700" },
  coach: { label: "Coach", icon: GraduationCap, color: "bg-amber-100 text-amber-700" },
  trainer: { label: "Entraîneur", icon: UsersIcon, color: "bg-emerald-100 text-emerald-700" },
};

const statusMeta: Record<RequestStatus, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  approved: { label: "Approuvée", color: "bg-green-100 text-green-700 border-green-300" },
  rejected: { label: "Refusée", color: "bg-red-100 text-red-700 border-red-300" },
};

const AdminDirectory = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<DirectoryEntry[]>(initialData);
  const [requests, setRequests] = useState<AccountRequest[]>(initialRequests);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<DirectoryEntry | null>(null);

  const [reqDialogOpen, setReqDialogOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<AccountRequest | null>(null);
  const [reqStatusFilter, setReqStatusFilter] = useState<RequestStatus | "all">("pending");
  const [reqTypeFilter, setReqTypeFilter] = useState<AccountType | "all">("all");

  const { toast } = useToast();

  // Club member submissions (from clubs portal)
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [cmStatusFilter, setCmStatusFilter] = useState<"pending" | "accepted" | "rejected" | "all">("pending");
  const [activeClubMember, setActiveClubMember] = useState<ClubMember | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // Main view: choose between Clubs and Individuels
  const [mainView, setMainView] = useState<"select" | "clubs" | "individuels">("select");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [individualSubView, setIndividualSubView] = useState<"select" | "athlete" | "coach" | "referee">("select");

  // QR dialog
  const [qrPayload, setQrPayload] = useState<MemberQRPayload | null>(null);

  const openClubMemberQR = (m: ClubMember) => {
    setQrPayload({
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
      payment: m.payment.status,
      approval: m.approval.status,
    });
  };

  const openClubQR = (club: { name: string; city: string; discipline: string; membersCount: number }) => {
    setQrPayload({
      kind: "club",
      id: club.name,
      name: club.name,
      city: club.city,
      discipline: club.discipline,
      membersCount: club.membersCount,
    });
  };

  const openIndividualQR = (item: DirectoryEntry) => {
    setQrPayload({
      kind: (item.accountType as MemberQRPayload["kind"]) || "member",
      id: item.id,
      name: item.name,
      city: item.city,
      discipline: item.discipline,
      role: item.role,
      email: item.email,
      phone: item.phone,
      licenseActive: item.licenseActive,
    });
  };

  useEffect(() => {
    setClubMembers(loadClubMembers());
    const onStorage = () => setClubMembers(loadClubMembers());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filteredClubMembers = clubMembers.filter(
    (m) => cmStatusFilter === "all" || m.approval.status === cmStatusFilter,
  );
  const pendingClubMembersCount = clubMembers.filter((m) => m.approval.status === "pending").length;

  const approveClubMember = (m: ClubMember) => {
    const updated: ClubMember = {
      ...m,
      approval: { ...m.approval, status: "accepted", reviewedAt: new Date().toISOString() },
    };
    upsertClubMember(updated);
    setClubMembers(loadClubMembers());
    setActiveClubMember(null);
    toast({ title: "Membre approuvé", description: `${m.fullName} (${m.clubName}) a été accepté(e).` });
  };

  const rejectClubMember = (m: ClubMember) => {
    const updated: ClubMember = {
      ...m,
      approval: {
        ...m.approval, status: "rejected",
        reviewedAt: new Date().toISOString(),
        reviewerNote: rejectNote || undefined,
      },
    };
    upsertClubMember(updated);
    setClubMembers(loadClubMembers());
    setActiveClubMember(null);
    setRejectNote("");
    toast({ title: "Membre refusé", variant: "destructive" });
  };

  const filtered = items.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter((r) => {
    if (reqStatusFilter !== "all" && r.status !== reqStatusFilter) return false;
    if (reqTypeFilter !== "all" && r.accountType !== reqTypeFilter) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  // Build clubs list: union of directory clubs + clubs that appear in clubMembers store
  const clubsFromDirectory = items.filter((i) => i.type === "club");
  const clubNameSet = new Set<string>([
    ...clubsFromDirectory.map((c) => c.name),
    ...clubMembers.map((m) => m.clubName),
  ]);
  const clubsList = Array.from(clubNameSet).map((name) => {
    const dirEntry = clubsFromDirectory.find((c) => c.name === name);
    const members = clubMembers.filter((m) => m.clubName === name);
    return {
      name,
      city: dirEntry?.city ?? members[0]?.clubName ?? "—",
      discipline: dirEntry?.discipline ?? "Multi-disciplines",
      membersCount: members.length || dirEntry?.memberCount || 0,
      pendingCount: members.filter((m) => m.approval.status === "pending").length,
    };
  });

  const individualMembers = items.filter((i) => i.type === "member");
  const clubMembersForSelected = selectedClub
    ? clubMembers.filter((m) => m.clubName === selectedClub)
    : [];

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Entrée supprimée" });
  };

  const handleSave = () => {
    setDialogOpen(false);
    toast({ title: editItem ? "Entrée modifiée" : "Entrée créée" });
  };

  const approveRequest = (req: AccountRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r)));
    // Add to directory
    const newEntry: DirectoryEntry = {
      id: Date.now(),
      type: req.accountType === "club" ? "club" : "member",
      accountType: req.accountType,
      name: req.accountType === "club" ? (req.clubName || req.fullName) : req.fullName,
      city: req.city,
      discipline: req.discipline,
      role: accountTypeMeta[req.accountType].label,
      licenseActive: true,
      email: req.email,
      phone: req.phone,
    };
    setItems((prev) => [newEntry, ...prev]);
    setReqDialogOpen(false);
    toast({ title: "Demande approuvée", description: `${req.fullName} a été ajouté(e) à l'annuaire.` });
  };

  const rejectRequest = (req: AccountRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r)));
    setReqDialogOpen(false);
    toast({ title: "Demande refusée", variant: "destructive" });
  };

  const deleteRequest = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Demande supprimée" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de l'Annuaire"
        description="Membres, clubs, licences et demandes d'inscription"
        stats={[
          { label: "Total membres", value: items.length },
          { label: "Demandes en attente", value: pendingCount, color: "text-yellow-600" },
          { label: "Clubs", value: items.filter((i) => i.type === "club").length, color: "text-violet-600" },
          { label: "Licences actives", value: items.filter((i) => i.licenseActive).length, color: "text-emerald-600" },
        ]}
        actions={
          <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle entrée
          </Button>
        }
      />

      {/* === MAIN VIEW SELECTOR === */}
      {mainView === "select" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setMainView("clubs")}
            className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-violet-50 to-white p-10 text-left shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-violet-600 p-5 text-white shadow-md">
                <Building2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-violet-900">Clubs</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérer tous les clubs et leurs membres
                </p>
                <p className="text-xs text-violet-700 mt-2 font-medium">
                  {clubsList.length} club{clubsList.length > 1 ? "s" : ""} enregistré{clubsList.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMainView("individuels")}
            className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-white p-10 text-left shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-md">
                <UserRound className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900">Individuels</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Athlètes, coachs, entraîneurs indépendants
                </p>
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  {individualMembers.length} membre{individualMembers.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* === CLUBS VIEW === */}
      {mainView === "clubs" && !selectedClub && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setMainView("select")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <h3 className="text-lg font-semibold">Tous les clubs</h3>
            <div />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubsList.map((club) => (
                <button
                  key={club.name}
                  type="button"
                  onClick={() => setSelectedClub(club.name)}
                  className="text-left rounded-xl border border-border p-5 bg-card hover:shadow-md hover:border-violet-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-violet-100 p-3 text-violet-700">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{club.name}</h4>
                      <p className="text-xs text-muted-foreground">{club.city}</p>
                      <p className="text-xs text-muted-foreground mt-1">{club.discipline}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary">{club.membersCount} membres</Badge>
                        {club.pendingCount > 0 && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
                            {club.pendingCount} en attente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {clubsList.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Aucun club</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* === SELECTED CLUB MEMBERS === */}
      {mainView === "clubs" && selectedClub && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setSelectedClub(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Tous les clubs
              </Button>
              <div className="text-right">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-violet-600" />
                  {selectedClub}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {clubMembersForSelected.length} membre{clubMembersForSelected.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubMembersForSelected.map((m) => {
                  const docsCount = Object.values(m.documents).filter(Boolean).length;
                  const stMeta = {
                    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                    accepted: { label: "Accepté", color: "bg-green-100 text-green-700 border-green-300" },
                    rejected: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-300" },
                  }[m.approval.status];
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {m.fullName}
                        <div className="text-xs text-muted-foreground">{m.gender === "M" ? "Homme" : "Femme"}</div>
                      </TableCell>
                      <TableCell>
                        {m.age} ans
                        {m.age < 18 && <Badge variant="outline" className="ml-1 text-[10px]">Mineur</Badge>}
                      </TableCell>
                      <TableCell>{m.discipline}</TableCell>
                      <TableCell>
                        <span className={`text-xs ${docsCount >= 2 ? "text-green-700" : "text-yellow-700"}`}>
                          {docsCount}/2
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${m.payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {m.payment.status === "paid" ? "Payé" : "Non payé"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${stMeta.color}`}>
                          {stMeta.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setActiveClubMember(m)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {m.approval.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-green-600" onClick={() => approveClubMember(m)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => rejectClubMember(m)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {clubMembersForSelected.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Aucun membre dans ce club</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* === INDIVIDUELS VIEW === */}
      {mainView === "individuels" && individualSubView === "select" && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setMainView("select")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => setIndividualSubView("athlete")}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-white p-8 text-left shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-md">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Athlètes</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {individualMembers.filter((i) => i.accountType === "athlete" && i.role !== "Arbitre").length} enregistré(s)
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIndividualSubView("coach")}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-50 to-white p-8 text-left shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-amber-600 p-4 text-white shadow-md">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">Coachs</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {individualMembers.filter((i) => i.accountType === "coach" || i.accountType === "trainer").length} enregistré(s)
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIndividualSubView("referee")}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white p-8 text-left shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-md">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">Arbitres</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {individualMembers.filter((i) => i.role === "Arbitre").length} enregistré(s)
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {mainView === "individuels" && individualSubView !== "select" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIndividualSubView("select")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
              <h3 className="text-lg font-semibold">
                {individualSubView === "athlete" && "Athlètes"}
                {individualSubView === "coach" && "Coachs"}
                {individualSubView === "referee" && "Arbitres"}
              </h3>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Licence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individualMembers
                  .filter((e) => {
                    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                      e.city.toLowerCase().includes(search.toLowerCase());
                    if (!matchSearch) return false;
                    if (individualSubView === "athlete") return e.accountType === "athlete" && e.role !== "Arbitre";
                    if (individualSubView === "coach") return e.accountType === "coach" || e.accountType === "trainer";
                    if (individualSubView === "referee") return e.role === "Arbitre";
                    return true;
                  })
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.discipline}</TableCell>
                      <TableCell>{item.role}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.licenseActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {item.licenseActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditItem(item); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {(() => {
              const count = individualMembers.filter((e) => {
                if (individualSubView === "athlete") return e.accountType === "athlete" && e.role !== "Arbitre";
                if (individualSubView === "coach") return e.accountType === "coach" || e.accountType === "trainer";
                if (individualSubView === "referee") return e.role === "Arbitre";
                return false;
              }).filter((e) =>
                e.name.toLowerCase().includes(search.toLowerCase()) ||
                e.city.toLowerCase().includes(search.toLowerCase())
              ).length;
              return count === 0 ? <p className="text-center text-muted-foreground py-8">Aucun résultat</p> : null;
            })()}
          </CardContent>
        </Card>
      )}


      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Modifier l'entrée" : "Nouvelle entrée"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select defaultValue={editItem?.type || "member"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membre</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Nom</Label><Input defaultValue={editItem?.name || ""} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ville</Label><Input defaultValue={editItem?.city || ""} /></div>
              <div className="space-y-2"><Label>Discipline</Label><Input defaultValue={editItem?.discipline || ""} /></div>
            </div>
            <div className="space-y-2"><Label>Rôle / Nombre de membres</Label><Input defaultValue={editItem?.role || editItem?.memberCount?.toString() || ""} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request detail dialog */}
      <Dialog open={reqDialogOpen} onOpenChange={setReqDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeRequest && (
                <>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${accountTypeMeta[activeRequest.accountType].color}`}>
                    {accountTypeMeta[activeRequest.accountType].label}
                  </span>
                  Demande de {activeRequest.fullName}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {activeRequest && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Nom complet</Label><p className="font-medium">{activeRequest.fullName}</p></div>
                {activeRequest.clubName && <div><Label className="text-xs text-muted-foreground">Nom du club</Label><p className="font-medium">{activeRequest.clubName}</p></div>}
                <div><Label className="text-xs text-muted-foreground">Email</Label><p>{activeRequest.email}</p></div>
                <div><Label className="text-xs text-muted-foreground">Téléphone</Label><p>{activeRequest.phone}</p></div>
                <div><Label className="text-xs text-muted-foreground">Ville</Label><p>{activeRequest.city}</p></div>
                <div><Label className="text-xs text-muted-foreground">Discipline</Label><p>{activeRequest.discipline}</p></div>
                <div><Label className="text-xs text-muted-foreground">Date de soumission</Label><p>{activeRequest.submittedAt}</p></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <p><span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusMeta[activeRequest.status].color}`}>{statusMeta[activeRequest.status].label}</span></p>
                </div>
              </div>
              {activeRequest.experience && (
                <div>
                  <Label className="text-xs text-muted-foreground">Expérience</Label>
                  <Textarea readOnly value={activeRequest.experience} className="mt-1" />
                </div>
              )}
              {activeRequest.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <Textarea readOnly value={activeRequest.message} className="mt-1" />
                </div>
              )}
              {activeRequest.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => rejectRequest(activeRequest)}>
                    <X className="mr-2 h-4 w-4" /> Refuser
                  </Button>
                  <Button onClick={() => approveRequest(activeRequest)}>
                    <Check className="mr-2 h-4 w-4" /> Approuver et créer le compte
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Club member detail dialog */}
      <Dialog open={!!activeClubMember} onOpenChange={(o) => !o && setActiveClubMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dossier du membre</DialogTitle>
          </DialogHeader>
          {activeClubMember && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Club</Label><p className="font-medium">{activeClubMember.clubName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Nom complet</Label><p className="font-medium">{activeClubMember.fullName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Date de naissance</Label><p>{activeClubMember.birthDate} ({activeClubMember.age} ans)</p></div>
                <div><Label className="text-xs text-muted-foreground">Genre</Label><p>{activeClubMember.gender === "M" ? "Homme" : "Femme"}</p></div>
                <div><Label className="text-xs text-muted-foreground">Discipline</Label><p>{activeClubMember.discipline}</p></div>
                <div><Label className="text-xs text-muted-foreground">Téléphone</Label><p>{activeClubMember.phone || "—"}</p></div>
                <div className="col-span-2"><Label className="text-xs text-muted-foreground">Email</Label><p>{activeClubMember.email || "—"}</p></div>
              </div>

              <div className="border border-border rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</h4>
                {Object.entries(activeClubMember.documents).map(([k, v]) =>
                  v ? (
                    <div key={k} className="flex items-center justify-between text-sm">
                      <span>
                        {k === "cin" && "CIN"}
                        {k === "birthExtract" && "مضمون (Extrait de naissance)"}
                        {k === "parentalAuth" && "ترخيص أبوي (Autorisation parentale)"}
                        : <span className="text-muted-foreground">{v.name}</span>
                      </span>
                      <Button size="sm" variant="ghost">Voir</Button>
                    </div>
                  ) : null,
                )}
                {Object.values(activeClubMember.documents).filter(Boolean).length === 0 && (
                  <p className="text-xs text-muted-foreground">Aucun document fourni</p>
                )}
              </div>

              <div className="border border-border rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Receipt className="w-4 h-4" /> Paiement</h4>
                <p className="text-sm">
                  Statut :{" "}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeClubMember.payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {activeClubMember.payment.status === "paid" ? "Payé" : "Non payé"}
                  </span>
                </p>
                {activeClubMember.payment.receipt && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Reçu : <span className="text-muted-foreground">{activeClubMember.payment.receipt.name}</span></span>
                    <Button size="sm" variant="ghost">Voir</Button>
                  </div>
                )}
              </div>

              {activeClubMember.approval.reviewerNote && (
                <div>
                  <Label className="text-xs text-muted-foreground">Note de l'examinateur</Label>
                  <p className="text-sm">{activeClubMember.approval.reviewerNote}</p>
                </div>
              )}

              {activeClubMember.approval.status === "pending" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs">Note (optionnel, en cas de refus)</Label>
                  <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Motif du refus..." />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => rejectClubMember(activeClubMember)}>
                      <X className="mr-2 h-4 w-4" /> Refuser
                    </Button>
                    <Button onClick={() => approveClubMember(activeClubMember)}>
                      <Check className="mr-2 h-4 w-4" /> Approuver
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDirectory;
