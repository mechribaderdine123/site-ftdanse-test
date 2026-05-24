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
  FileText, Receipt, ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { ClubMember, loadClubMembers, upsertClubMember } from "@/data/clubMembersStore";

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

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests" className="relative">
            <Inbox className="mr-2 h-4 w-4" /> Demandes d'inscription
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-500 text-white">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="club-members" className="relative">
            <ShieldCheck className="mr-2 h-4 w-4" /> Membres clubs
            {pendingClubMembersCount > 0 && (
              <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-500 text-white">{pendingClubMembersCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="directory">
            <UsersIcon className="mr-2 h-4 w-4" /> Annuaire
          </TabsTrigger>
        </TabsList>

        {/* === DEMANDES === */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Statut</Label>
                  <Select value={reqStatusFilter} onValueChange={(v) => setReqStatusFilter(v as any)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvées</SelectItem>
                      <SelectItem value="rejected">Refusées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type de compte</Label>
                  <Select value={reqTypeFilter} onValueChange={(v) => setReqTypeFilter(v as any)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="athlete">Athlète</SelectItem>
                      <SelectItem value="club">Club</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="trainer">Entraîneur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => {
                    const meta = accountTypeMeta[req.accountType];
                    const Icon = meta.icon;
                    return (
                      <TableRow key={req.id}>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                            <Icon className="h-3 w-3" /> {meta.label}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {req.fullName}
                          {req.clubName && <div className="text-xs text-muted-foreground">{req.clubName}</div>}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {req.email}</div>
                          <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {req.phone}</div>
                        </TableCell>
                        <TableCell>{req.city}</TableCell>
                        <TableCell>{req.discipline}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{req.submittedAt}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusMeta[req.status].color}`}>
                            {statusMeta[req.status].label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setActiveRequest(req); setReqDialogOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {req.status === "pending" && (
                              <>
                                <Button variant="ghost" size="icon" className="text-green-600" onClick={() => approveRequest(req)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => rejectRequest(req)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRequest(req.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucune demande</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === MEMBRES SOUMIS PAR LES CLUBS === */}
        <TabsContent value="club-members" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Statut</Label>
                  <Select value={cmStatusFilter} onValueChange={(v) => setCmStatusFilter(v as any)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="accepted">Acceptés</SelectItem>
                      <SelectItem value="rejected">Refusés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club</TableHead>
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
                  {filteredClubMembers.map((m) => {
                    const docsCount = Object.values(m.documents).filter(Boolean).length;
                    const required = 2;
                    const stMeta = {
                      pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                      accepted: { label: "Accepté", color: "bg-green-100 text-green-700 border-green-300" },
                      rejected: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-300" },
                    }[m.approval.status];
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.clubName}</TableCell>
                        <TableCell>
                          {m.fullName}
                          <div className="text-xs text-muted-foreground">{m.gender === "M" ? "Homme" : "Femme"}</div>
                        </TableCell>
                        <TableCell>
                          {m.age} ans
                          {m.age < 18 && <Badge variant="outline" className="ml-1 text-[10px]">Mineur</Badge>}
                        </TableCell>
                        <TableCell>{m.discipline}</TableCell>
                        <TableCell>
                          <span className={`text-xs ${docsCount >= required ? "text-green-700" : "text-yellow-700"}`}>
                            {docsCount}/{required}
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
              {filteredClubMembers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune soumission de membre {cmStatusFilter !== "all" ? `(${cmStatusFilter})` : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ANNUAIRE === */}
        <TabsContent value="directory" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Rôle/Membres</TableHead>
                    <TableHead>Licence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.type === "club" ? <Building2 className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.discipline}</TableCell>
                      <TableCell>{item.type === "club" ? `${item.memberCount} membres` : item.role}</TableCell>
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
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun résultat</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
