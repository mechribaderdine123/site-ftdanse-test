import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/api";
import { downloadProtectedFile } from "@/lib/download";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Building2, User, Mail, Phone, MapPin, Award, Check, X, Eye,
  Download, FileText, Loader2, AlertCircle, CheckCircle2, Dumbbell, Users,
  BadgeCheck, CalendarClock, Clock, XCircle, UserPlus,
} from "lucide-react";
import { openProtectedFile } from "@/lib/download";
import { ExpiryChip } from "@/components/LicenseExpiry";

interface AccountRequest {
  id: number;
  userId: number;
  accountType: "athlete" | "coach" | "referee" | "club";
  fullName: string;
  email: string;
  phone: string;
  city: string;
  discipline: string;
  clubName?: string;
  documents: Array<{ id: string; originalName: string; type: string }>;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  message?: string;
}

interface DirectoryEntry {
  id: number;
  userId?: number;
  accountType: "athlete" | "coach" | "referee" | "club";
  name: string;
  city: string;
  discipline: string;
  email?: string;
  phone?: string;
  licenseActive: boolean;
  memberCount?: number;
}

// ===== Types des validations de licences (sous-page « Validations ») =====

type ActivationRequest = {
  id: number;
  userId: number;
  status: "pending" | "approved" | "rejected";
  reason: string | null;
  documents: { id: string; name: string; url: string }[];
  createdAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
  fullName: string;
  email: string;
  accountType: string;
  licenseNumber: string | null;
  avatarUrl: string | null;
};

type ClubLicenseRequest = {
  id: number;
  memberId: string | null;
  licenseNumber: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  discipline: string | null;
  season: string | null;
  age: number | null;
  gender: string | null;
  quality: string | null;
  approvalStatus: string;
  paymentStatus: string;
  receiptName: string | null;
  receiptUrl: string | null;
  createdAt: string;
  clubUserId: number;
  clubName: string;
  clubEmail: string;
  clubCity: string | null;
  licenseExpiresAt?: string | null;
};

type IndividualRenewal = {
  id: number;
  userId: number;
  renewalYear: number;
  status: string;
  renewalDocuments: { id: string; originalName: string; type?: string }[];
  requestedAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
  fullName: string;
  email: string;
  accountType: string;
  licenseNumber: string | null;
  licenseExpiresAt: string | null;
};

type ClubMemberRenewal = {
  id: number;
  season: string;
  status: string;
  renewalDocuments: { id: string; originalName: string; type?: string }[];
  note: string | null;
  reviewerNote: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  clubMemberId: number;
  memberName: string;
  age: number | null;
  discipline: string | null;
  licenseNumber: string | null;
  licenseExpiresAt: string | null;
  memberStatus: string;
  clubUserId: number;
  clubName: string;
  clubEmail: string;
  clubCity: string | null;
};

const accountTypeLabels: Record<string, { label: string; icon: typeof User; color: string }> = {
  athlete: { label: "Athlète", icon: Award, color: "bg-blue-100 text-blue-700" },
  coach: { label: "Coach", icon: Dumbbell, color: "bg-amber-100 text-amber-700" },
  referee: { label: "Arbitre", icon: Award, color: "bg-emerald-100 text-emerald-700" },
  club: { label: "Club", icon: Building2, color: "bg-violet-100 text-violet-700" },
};

const AdminDirectory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "individual" | "club">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "athlete" | "coach" | "referee">("all");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [approving, setApproving] = useState(false);

  // Filtre dans l'angle : deux sous-pages — nouveaux comptes (méthode actuelle)
  // ou validations de licences (première attribution + renouvellements).
  const [view, setView] = useState<"new" | "validations">(
    new URLSearchParams(window.location.search).get("view") === "validations" ? "validations" : "new",
  );
  const [activations, setActivations] = useState<ActivationRequest[]>([]);
  const [clubLicenses, setClubLicenses] = useState<ClubLicenseRequest[]>([]);
  const [individualRenewals, setIndividualRenewals] = useState<IndividualRenewal[]>([]);
  const [memberRenewals, setMemberRenewals] = useState<ClubMemberRenewal[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountRequests, directoryData, activationList, clubLicenseList, individualRenewalList, memberRenewalList] = await Promise.all([
        apiRequest<AccountRequest[]>("/api/admin/account-requests"),
        apiRequest<DirectoryEntry[]>("/api/directory"),
        apiRequest<ActivationRequest[]>("/api/admin/activation-requests").catch(() => []),
        apiRequest<ClubLicenseRequest[]>("/api/admin/license-requests").catch(() => []),
        apiRequest<IndividualRenewal[]>("/api/admin/license-renewals").catch(() => []),
        apiRequest<ClubMemberRenewal[]>("/api/admin/club-member-renewals").catch(() => []),
      ]);
      setRequests(accountRequests);
      setEntries(directoryData || []);
      setActivations(activationList);
      setClubLicenses(clubLicenseList);
      setIndividualRenewals(individualRenewalList);
      setMemberRenewals(memberRenewalList);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du chargement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (typeFilter === "club" && req.accountType !== "club") return false;
    if (typeFilter === "individual" && req.accountType === "club") return false;
    if (typeFilter === "individual" && roleFilter !== "all" && req.accountType !== roleFilter) return false;
    if (search && !req.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !req.email.toLowerCase().includes(search.toLowerCase()) &&
        !req.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredEntries = entries.filter((entry) => {
    if (typeFilter === "club" && entry.accountType !== "club") return false;
    if (typeFilter === "individual" && entry.accountType === "club") return false;
    if (typeFilter === "individual" && roleFilter !== "all" && entry.accountType !== roleFilter) return false;
    if (search && !entry.name.toLowerCase().includes(search.toLowerCase()) &&
        !entry.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = async (req: AccountRequest) => {
    try {
      setApproving(true);
      await apiRequest(`/api/admin/account-requests/${req.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved", reviewerNote: reviewNote || null }),
      });
      toast({ title: "Profil approuvé", description: `${req.fullName} a été ajouté à l'annuaire.` });
      setSelectedRequest(null);
      setReviewNote("");
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'approbation",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (req: AccountRequest) => {
    try {
      setApproving(true);
      await apiRequest(`/api/admin/account-requests/${req.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected", reviewerNote: reviewNote || null }),
      });
      toast({ title: "Profil refusé" });
      setSelectedRequest(null);
      setReviewNote("");
      await loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du refus",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const downloadDocument = async (req: AccountRequest, doc: AccountRequest["documents"][0]) => {
    try {
      await downloadProtectedFile(
        `/api/admin/account-requests/${req.id}/documents/${doc.id}`,
        doc.originalName,
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur de téléchargement",
        variant: "destructive",
      });
    }
  };

  // ===== Handlers de validation des licences =====

  const viewRenewalDocument = async (url: string, name: string) => {
    try {
      await openProtectedFile(url);
    } catch (error) {
      toast({
        title: "Aperçu impossible",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    }
  };

  const reviewActivation = async (request: ActivationRequest, status: "approved" | "rejected") => {
    try {
      await apiRequest(`/api/admin/activation-requests/${request.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({
        title: status === "approved" ? "Licence activée" : "Demande refusée",
        description: status === "approved"
          ? `La licence de ${request.fullName} est désormais active${request.licenseNumber ? ` (${request.licenseNumber})` : ""}.`
          : `${request.fullName} a été notifié de la décision.`,
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Décision impossible",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    }
  };

  const reviewClubMember = async (request: ClubLicenseRequest, status: "approved" | "rejected" | "pending") => {
    try {
      const updated = await apiRequest<{ licenseNumber: string | null }>(`/api/admin/club-members/${request.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({
        title: status === "approved" ? "Licence attribuée" : status === "rejected" ? "Membre refusé" : "Membre remis en attente",
        description: status === "approved"
          ? `${request.fullName} · Licence : ${updated.licenseNumber || "générée"}`
          : `${request.fullName} a été mis à jour.`,
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Décision impossible",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    }
  };

  const reviewRenewal = async (renewal: IndividualRenewal, status: "approved" | "rejected") => {
    try {
      const result = await apiRequest<{ licenseExpiresAt: string | null }>(`/api/admin/license-renewals/${renewal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({
        title: status === "approved" ? "Renouvellement approuvé" : "Renouvellement refusé",
        description: status === "approved"
          ? `${renewal.fullName} · licence valable jusqu'au ${result.licenseExpiresAt}`
          : `${renewal.fullName} a été notifié de la décision.`,
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Décision impossible",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    }
  };

  const reviewMemberRenewal = async (renewal: ClubMemberRenewal, status: "approved" | "rejected") => {
    try {
      const result = await apiRequest<{ licenseExpiresAt: string | null }>(`/api/admin/club-member-renewals/${renewal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({
        title: status === "approved" ? "Renouvellement approuvé" : "Renouvellement refusé",
        description: status === "approved"
          ? `${renewal.memberName} (${renewal.clubName}) · valable jusqu'au ${result.licenseExpiresAt}`
          : `${renewal.clubName} a été notifié de la décision.`,
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Décision impossible",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    }
  };

  const statusPill = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: "En attente", cls: "bg-yellow-100 text-yellow-800" },
      // Dossier reçu côté admin (documents transmis) — à ne PAS confondre avec un refus.
      submitted: { label: "Dossier reçu", cls: "bg-blue-100 text-blue-800" },
      approved: { label: "Approuvé", cls: "bg-green-100 text-green-800" },
      rejected: { label: "Refusé", cls: "bg-red-100 text-red-800" },
    };
    const tone = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${tone.cls}`}>
        {tone.label}
      </span>
    );
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const validationsCount =
    clubLicenses.filter((r) => r.approvalStatus === "pending").length +
    activations.filter((r) => r.status === "pending").length +
    memberRenewals.filter((r) => r.status === "pending").length +
    individualRenewals.filter((r) => r.status === "submitted").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de l'Annuaire & Validations"
        description="Gérez les profils, clubs, et demandes d'inscription"
        stats={[
          { label: "Total demandes", value: requests.length },
          { label: "En attente", value: pendingCount, color: "text-yellow-600" },
          { label: "Approuvés", value: approvedCount, color: "text-green-600" },
          { label: "Refusés", value: requests.filter((r) => r.status === "rejected").length, color: "text-red-600" },
        ]}
      />

      {/* FILTRE DANS L'ANGLE : deux sous-pages — nouveaux comptes / validations */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 gap-1">
          <button
            type="button"
            onClick={() => { setView("new"); navigate("/admin/directory", { replace: true }); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === "new" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Nouveaux comptes
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setView("validations"); navigate("/admin/directory?view=validations", { replace: true }); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === "validations" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BadgeCheck className="w-4 h-4" /> Validations
            {validationsCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]">
                {validationsCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Filtrer par type:</Label>
                <div className="flex gap-2 flex-wrap">
                  {["all", "individual", "club"].map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={typeFilter === t ? "default" : "outline"}
                      onClick={() => { setTypeFilter(t as any); setRoleFilter("all"); }}
                      className="text-xs"
                    >
                      {t === "all" ? "Tous" : t === "individual" ? "Individual" : "Club"}
                    </Button>
                  ))}
                </div>
              </div>
              {typeFilter === "individual" && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Filtrer par rôle:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "athlete", "coach", "referee"].map((r) => (
                      <Button
                        key={r}
                        size="sm"
                        variant={roleFilter === r ? "default" : "outline"}
                        onClick={() => setRoleFilter(r as any)}
                        className="text-xs"
                      >
                        {r === "all" ? "Tous" : r === "athlete" ? "Athlète" : r === "coach" ? "Coach" : "Arbitre"}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* ===== SOUS-PAGE « NOUVEAUX COMPTES » (gestion actuelle, inchangée) ===== */}
      {view === "new" && (
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="text-xs">
            En attente {filteredRequests.filter((r) => r.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {filteredRequests.filter((r) => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs">Approuvés ({filteredEntries.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs">Refusés</TabsTrigger>
          <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
        </TabsList>

        {/* PENDING */}
        <TabsContent value="pending">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : filteredRequests.filter((r) => r.status === "pending").length === 0 ? (
            <Card><CardContent className="py-12 text-center"><CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" /><p>Aucune demande</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.filter((r) => r.status === "pending").map((req) => {
                const meta = accountTypeLabels[req.accountType];
                return (
                  <Card key={req.id} className="hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex gap-4 items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${meta.color}`}><meta.icon className="h-5 w-5" /></div>
                            <div><h3 className="font-semibold">{req.fullName}</h3><p className="text-xs text-muted-foreground">{meta.label}</p></div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                            <div className="flex items-center gap-1"><Mail className="h-3 w-3" /><span className="truncate">{req.email}</span></div>
                            <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{req.phone}</div>
                            <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.city}</div>
                            <div className="flex items-center gap-1"><Award className="h-3 w-3" />{req.discipline}</div>
                          </div>
                          {req.documents.length > 0 && (
                            <div className="mb-3"><p className="text-xs font-medium mb-2">Documents:</p>
                              <div className="flex flex-wrap gap-2">
                                {req.documents.map((doc) => (
                                  <Button key={doc.id} size="sm" variant="outline" className="text-xs" onClick={() => downloadDocument(req, doc)}>
                                    <Download className="h-3 w-3 mr-1" />{doc.originalName}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedRequest(req)}><Eye className="h-4 w-4 mr-1" />Voir</Button>
                          <Button size="sm" onClick={() => { setSelectedRequest(req); setReviewNote(""); }}><Check className="h-4 w-4 mr-1" />Valider</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* APPROVED */}
        <TabsContent value="approved">
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun compte</CardContent></Card>
            ) : (
              filteredEntries.map((entry) => {
                const meta = accountTypeLabels[entry.accountType];
                return (
                  <Link key={entry.id} to={`/admin/directory/${entry.userId ?? entry.id}`}>
                    <Card className="border-green-200 bg-green-50/30 cursor-pointer hover:shadow-md transition">
                      <CardContent className="pt-6">
                        <div className="flex justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${meta.color}`}><meta.icon className="h-5 w-5" /></div>
                              <div><h3 className="font-semibold">{entry.name}</h3><p className="text-xs text-muted-foreground">{meta.label}</p></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{entry.city}</div>
                              <div className="flex items-center gap-1"><Award className="h-3 w-3" />{entry.discipline}</div>
                              {entry.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{entry.email}</div>}
                              {entry.memberCount !== undefined && <div className="flex items-center gap-1"><Users className="h-3 w-3" />{entry.memberCount} membres</div>}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-300">Actif</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* REJECTED */}
        <TabsContent value="rejected">
          <div className="space-y-4">
            {filteredRequests.filter((r) => r.status === "rejected").length === 0 ? (
              <Card><CardContent className="py-8 text-center">Aucun refus</CardContent></Card>
            ) : (
              filteredRequests.filter((r) => r.status === "rejected").map((req) => {
                const meta = accountTypeLabels[req.accountType];
                return (
                  <Card key={req.id} className="border-red-200 bg-red-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${meta.color}`}><meta.icon className="h-5 w-5" /></div>
                            <div><h3 className="font-semibold">{req.fullName}</h3><p className="text-xs text-muted-foreground">{meta.label}</p></div>
                          </div>
                          {req.message && <div className="text-xs bg-red-100 text-red-700 p-2 rounded"><strong>Motif:</strong> {req.message}</div>}
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-300">Refusé</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ALL */}
        <TabsContent value="all">
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card><CardContent className="py-8 text-center">Aucune demande</CardContent></Card>
            ) : (
              filteredRequests.map((req) => {
                const meta = accountTypeLabels[req.accountType];
                const colors: Record<string, string> = { pending: "border-yellow-200 bg-yellow-50/30", approved: "border-green-200 bg-green-50/30", rejected: "border-red-200 bg-red-50/30" };
                return (
                  <Card key={req.id} className={colors[req.status]}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${meta.color}`}><meta.icon className="h-5 w-5" /></div>
                          <div><h3 className="font-semibold">{req.fullName}</h3><p className="text-xs">{meta.label}</p></div>
                        </div>
                        <Badge>{req.status === "pending" ? "En attente" : req.status === "approved" ? "Approuvé" : "Refusé"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
      )}

      {/* ===== SOUS-PAGE « VALIDATIONS » : licences à attribuer/activer + renouvellements ===== */}
      {view === "validations" && (
        <div className="space-y-6">
          {/* Licences de membres soumis par les clubs (première attribution) */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Licences de membres de club
            </h2>
            {!loading && clubLicenses.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune licence soumise par un club pour le moment.</p>
            )}
            {clubLicenses.map((request) => (
              <Card key={`club-license-${request.id}`} className={request.approvalStatus === "pending" ? "border-yellow-300" : undefined}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-3">
                    {request.fullName}
                    <span className="text-sm font-normal text-muted-foreground">
                      · {request.quality || "athlete"}{request.age ? ` · ${request.age} ans` : ""}
                      {request.discipline ? ` · ${request.discipline}` : ""}
                    </span>
                    {statusPill(request.approvalStatus)}
                    {request.licenseNumber && (
                      <span className="font-mono text-xs font-bold text-primary px-2 py-1 bg-muted rounded">
                        {request.licenseNumber}
                      </span>
                    )}
                    <ExpiryChip
                      info={{
                        licenseExpiresAt: request.licenseExpiresAt ?? null,
                        daysRemaining: request.licenseExpiresAt
                          ? Math.ceil((new Date(`${request.licenseExpiresAt}T00:00:00Z`).getTime() - Date.now()) / 86400000)
                          : null,
                      }}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Club : <span className="font-medium text-foreground">{request.clubName}</span>
                    {request.clubCity ? ` · ${request.clubCity}` : ""} · {request.clubEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.email || "Sans email"} · Saison {request.season || "—"} · Paiement : {request.paymentStatus === "paid" ? "enregistré" : request.paymentStatus}
                    · Soumis le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  {request.receiptUrl && (
                    <Button variant="outline" size="sm" onClick={() => void viewRenewalDocument(request.receiptUrl, request.receiptName || "reçu")}>
                      Voir le reçu : {request.receiptName || "paiement"}
                    </Button>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {request.approvalStatus !== "approved" && (
                      <Button size="sm" onClick={() => void reviewClubMember(request, "approved")}>
                        <BadgeCheck className="w-4 h-4 mr-1" /> Attribuer la licence
                      </Button>
                    )}
                    {request.approvalStatus !== "rejected" && (
                      <Button variant="destructive" size="sm" onClick={() => void reviewClubMember(request, "rejected")}>
                        <XCircle className="w-4 h-4 mr-1" /> Refuser
                      </Button>
                    )}
                    {request.approvalStatus !== "pending" && (
                      <Button variant="outline" size="sm" onClick={() => void reviewClubMember(request, "pending")}>
                        <Clock className="w-4 h-4 mr-1" /> Remettre en attente
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Renouvellements des licences de membres de club */}
          <section className="space-y-3 pt-4 border-t">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" /> Renouvellements — membres de club
            </h2>
            {!loading && memberRenewals.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune demande de renouvellement de membre de club pour le moment.</p>
            )}
            {memberRenewals.map((renewal) => (
              <Card key={`member-renewal-${renewal.id}`} className={renewal.status === "pending" ? "border-yellow-300" : undefined}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-3">
                    {renewal.memberName}
                    <span className="text-sm font-normal text-muted-foreground">
                      {renewal.age ? `· ${renewal.age} ans` : ""}{renewal.discipline ? ` · ${renewal.discipline}` : ""} · Saison {renewal.season}
                    </span>
                    {statusPill(renewal.status)}
                    {renewal.licenseNumber && (
                      <span className="font-mono text-xs font-bold text-primary px-2 py-1 bg-muted rounded">
                        {renewal.licenseNumber}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Club : <span className="font-medium text-foreground">{renewal.clubName}</span>
                    {renewal.clubCity ? ` · ${renewal.clubCity}` : ""} · {renewal.clubEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Échéance actuelle : {renewal.licenseExpiresAt
                      ? new Date(`${renewal.licenseExpiresAt}T00:00:00`).toLocaleDateString("fr-FR")
                      : "—"} · Demande du {new Date(renewal.requestedAt).toLocaleDateString("fr-FR")}
                    {renewal.reviewedAt ? ` · traitée le ${new Date(renewal.reviewedAt).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                  {renewal.note && <p className="text-sm bg-muted/50 border border-border rounded p-3">« {renewal.note} »</p>}
                  {renewal.reviewerNote && <p className="text-sm text-muted-foreground">Note : {renewal.reviewerNote}</p>}
                  {renewal.renewalDocuments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {renewal.renewalDocuments.map((document) => (
                        <Button
                          key={document.id}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void viewRenewalDocument(
                              `/api/admin/club-member-renewals/${renewal.id}/documents/${document.id}`,
                              document.originalName,
                            )
                          }
                        >
                          Voir : {document.originalName}{document.type ? ` (${document.type})` : ""}
                        </Button>
                      ))}
                    </div>
                  )}
                  {renewal.status === "pending" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button size="sm" onClick={() => void reviewMemberRenewal(renewal, "approved")}>
                        <BadgeCheck className="w-4 h-4 mr-1" /> Approuver le renouvellement
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void reviewMemberRenewal(renewal, "rejected")}>
                        <XCircle className="w-4 h-4 mr-1" /> Refuser
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Renouvellements des licences individuelles */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" /> Renouvellements — licences individuelles
            </h2>
            {!loading && individualRenewals.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune demande de renouvellement pour le moment.</p>
            )}
            {individualRenewals.map((renewal) => (
              <Card key={`individual-renewal-${renewal.id}`} className={renewal.status === "pending" ? "border-yellow-300" : undefined}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-3">
                    {renewal.fullName}
                    <span className="text-sm font-normal text-muted-foreground">· {renewal.accountType} · Saison {renewal.renewalYear}</span>
                    {statusPill(renewal.status)}
                    {renewal.licenseNumber && (
                      <span className="font-mono text-xs font-bold text-primary px-2 py-1 bg-muted rounded">
                        {renewal.licenseNumber}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{renewal.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Échéance actuelle : {renewal.licenseExpiresAt
                      ? new Date(`${renewal.licenseExpiresAt}T00:00:00`).toLocaleDateString("fr-FR")
                      : "—"} · Demande du {new Date(renewal.requestedAt).toLocaleDateString("fr-FR")}
                    {renewal.reviewedAt ? ` · traitée le ${new Date(renewal.reviewedAt).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                  {renewal.reviewerNote && <p className="text-sm text-muted-foreground">Note : {renewal.reviewerNote}</p>}
                  {renewal.renewalDocuments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {renewal.renewalDocuments.map((document) => (
                        <Button
                          key={document.id}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void viewRenewalDocument(
                              `/api/admin/license-renewals/${renewal.id}/documents/${document.id}`,
                              document.originalName,
                            )
                          }
                        >
                          Voir : {document.originalName}{document.type ? ` (${document.type})` : ""}
                        </Button>
                      ))}
                    </div>
                  )}
                  {renewal.status !== "approved" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {renewal.status === "pending" && (
                        <p className="text-xs text-muted-foreground w-full">
                          Dossier incomplet : le membre n'a pas encore joint ses documents (statut « brouillon »).
                        </p>
                      )}
                      <Button
                        size="sm"
                        disabled={renewal.status === "pending"}
                        onClick={() => void reviewRenewal(renewal, "approved")}
                      >
                        <BadgeCheck className="w-4 h-4 mr-1" /> Approuver le renouvellement
                      </Button>
                      {renewal.status !== "rejected" && (
                        <Button variant="destructive" size="sm" onClick={() => void reviewRenewal(renewal, "rejected")}>
                          <XCircle className="w-4 h-4 mr-1" /> Refuser
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Demandes d'activation de licence (première activation, envoyées depuis l'espace membre) */}
          <section className="space-y-3 pt-4 border-t">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-primary" /> Demandes d'activation de licence
            </h2>
            {!loading && activations.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune demande d'activation pour le moment.</p>
            )}
            {activations.map((request) => (
              <Card key={`activation-${request.id}`} className={request.status === "pending" ? "border-yellow-300" : undefined}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-3">
                    {request.fullName}
                    <span className="text-sm font-normal text-muted-foreground">· {request.accountType}</span>
                    {statusPill(request.status)}
                    {request.licenseNumber && (
                      <span className="font-mono text-xs font-bold text-primary px-2 py-1 bg-muted rounded">
                        {request.licenseNumber}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{request.email}</p>
                  {request.reason && (
                    <p className="text-sm bg-muted/50 border border-border rounded p-3">« {request.reason} »</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Demande du {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                    {request.reviewedAt ? ` · traitée le ${new Date(request.reviewedAt).toLocaleDateString("fr-FR")}` : ""}
                  </p>

                  {request.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {request.documents.map((document) => (
                        <Button
                          key={document.id}
                          variant="outline"
                          size="sm"
                          onClick={() => void viewRenewalDocument(document.url, document.name)}
                        >
                          Voir : {document.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {request.reviewerNote && (
                    <p className="text-sm text-muted-foreground">Note : {request.reviewerNote}</p>
                  )}

                  {request.status === "pending" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button size="sm" onClick={() => void reviewActivation(request, "approved")}>
                        <BadgeCheck className="w-4 h-4 mr-1" /> Activer la licence
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void reviewActivation(request, "rejected")}>
                        <XCircle className="w-4 h-4 mr-1" /> Refuser
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      )}

      {/* REQUEST DETAIL */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.fullName}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Email</Label><p>{selectedRequest.email}</p></div>
                <div><Label className="text-xs">Téléphone</Label><p>{selectedRequest.phone}</p></div>
                <div><Label className="text-xs">Ville</Label><p>{selectedRequest.city}</p></div>
                <div><Label className="text-xs">Discipline</Label><p>{selectedRequest.discipline}</p></div>
              </div>
              {selectedRequest.documents.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-xs font-semibold mb-3 block">Documents</Label>
                  {selectedRequest.documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between p-2 bg-muted rounded mb-2">
                      <div><p className="text-sm">{doc.originalName}</p><p className="text-xs text-muted-foreground">{doc.type}</p></div>
                      <Button size="sm" variant="outline" onClick={() => downloadDocument(selectedRequest, doc)}><Download className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
              {selectedRequest.status === "pending" && (
                <div className="border-t pt-4">
                  <Textarea placeholder="Note..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} className="mb-4" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => handleReject(selectedRequest)} disabled={approving}><X className="mr-2 h-4 w-4" />Refuser</Button>
                    <Button onClick={() => handleApprove(selectedRequest)} disabled={approving}><Check className="mr-2 h-4 w-4" />Approuver</Button>
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
