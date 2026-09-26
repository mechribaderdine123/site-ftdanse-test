import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail, Phone, MapPin, Award, Printer, ArrowLeft, Loader2, AlertCircle,
  Calendar, Hash, FileText, Upload, BadgeCheck, User, KeyRound,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LicenseQrCard, openPrintLicenseWindow } from "@/components/LicenseQr";
import { DocumentsBrowser, type AdminDocument } from "@/components/admin/DocumentsBrowser";

interface AccountDetails {
  id: number;
  userId?: number;
  accountType: "athlete" | "coach" | "referee" | "club";
  name: string;
  email?: string;
  phone?: string;
  city: string;
  discipline: string;
  clubName?: string;
  licenseNumber?: string | null;
  licenseActive: boolean;
  memberCount?: number;
  createdAt: string;
}

interface UserDetailResponse {
  user: {
    id: number;
    email: string;
    fullName: string;
    phone: string | null;
    city: string | null;
    discipline: string | null;
    clubName: string | null;
    accountType: string;
    status: string;
    licenseNumber: string | null;
    publicId: string | null;
    avatarUrl: string | null;
    clubType: string | null;
    organizationName: string | null;
    logoUrl: string | null;
    birthDate: string | null;
    gender: string | null;
    actYear: number | null;
    actNumber: string | null;
    emergencyContact: { relation?: string; name?: string; phone?: string; email?: string } | null;
    createdAt: string;
  };
  signup: {
    status: string;
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewerNote: string | null;
    documents: AdminDocument[];
  } | null;
  activationRequests: {
    id: number;
    status: string;
    reason: string | null;
    createdAt: string;
    reviewedAt: string | null;
    reviewerNote: string | null;
    documents: AdminDocument[];
  }[];
  clubMembers: {
    id: number;
    memberId: string | null;
    fullName: string;
    birthDate: string | null;
    age: number | null;
    gender: string | null;
    discipline: string | null;
    season: string | null;
    quality: string | null;
    approvalStatus: string;
    licenseNumber: string | null;
    actYear: number | null;
    actNumber: string | null;
    emergencyContact: { relation?: string; name?: string; phone?: string; email?: string } | null;
    documents: AdminDocument[];
  }[];
}

const accountTypeLabels: Record<string, string> = {
  athlete: "Athlète",
  coach: "Coach",
  referee: "Arbitre",
  club: "Club",
};

const AccountDetailPage = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [detail, setDetail] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    loadAccountDetails();
  }, [accountId]);

  const loadAccountDetails = async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      // Prefer the rich detail endpoint; fall back to the public directory.
      const detail = await apiRequest<UserDetailResponse>(`/api/admin/users/${accountId}/detail`);
      setDetail(detail);
    } catch {
      try {
        const allAccounts = await apiRequest<AccountDetails[]>("/api/directory");
        // Directory ids are NOT user ids — match by entry id or the underlying userId.
        const acc = allAccounts?.find(
          (a) => a.id === Number(accountId) || a.userId === Number(accountId),
        );
        if (acc) {
          setDetail({
            user: {
              id: acc.id, email: acc.email || "", fullName: acc.name, phone: acc.phone || null,
              city: acc.city, discipline: acc.discipline, clubName: acc.clubName || null,
              accountType: acc.accountType, status: acc.licenseActive ? "approved" : "pending",
              licenseNumber: acc.licenseNumber || null, publicId: acc.licenseNumber || null,
              avatarUrl: null, clubType: null, organizationName: null, logoUrl: null,
              birthDate: null, gender: null, actYear: null, actNumber: null, emergencyContact: null,
              createdAt: acc.createdAt,
            },
            signup: null, activationRequests: [], clubMembers: [],
          });
        } else {
          navigate("/admin/directory");
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Erreur de chargement",
          variant: "destructive",
        });
        navigate("/admin/directory");
      }
    } finally {
      setLoading(false);
    }
  };

  // Envoie un lien de réinitialisation : le serveur le route TOUJOURS vers
  // l'email du profil enregistré (celui qui a créé le compte), pour la sécurité.
  const sendPasswordReset = async () => {
    if (!detail) return;
    try {
      setSendingReset(true);
      const result = await apiRequest<{ sentTo: string }>(`/api/admin/users/${detail.user.id}/send-password-reset`, {
        method: "POST",
      });
      toast({
        title: "Email envoyé",
        description: `Le lien de réinitialisation a été envoyé à l'email du profil : ${result.sentTo}`,
      });
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const printLicense = async () => {
    if (!detail) return;
    const ok = await openPrintLicenseWindow({
      licenseNumber: detail.user.licenseNumber || detail.user.publicId || `FTDAP-${String(detail.user.id).padStart(6, "0")}`,
      fullName: detail.user.fullName,
      accountType: detail.user.accountType,
      email: detail.user.email,
      phone: detail.user.phone || undefined,
      city: detail.user.city || undefined,
      discipline: detail.user.discipline || undefined,
      clubName: detail.user.clubName || undefined,
      photoUrl: detail.user.avatarUrl || undefined,
      logoUrl: detail.user.logoUrl || undefined,
    });
    if (!ok) {
      toast({ title: "Impression impossible", description: "Autorisez les pop-ups pour imprimer la licence.", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Compte non trouvé</p>
            <Button className="mt-4" onClick={() => navigate("/admin/directory")}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, signup, activationRequests, clubMembers } = detail;
  const isClub = user.accountType === "club";
  const allSignupDocuments = [
    ...(signup?.documents || []),
    ...activationRequests.flatMap((request) => request.documents),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/directory")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <h1 className="text-3xl font-bold">{user.fullName}</h1>
        <Badge>{accountTypeLabels[user.accountType]}</Badge>
        <Badge className={user.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
          {user.status === "approved" ? "✓ Licence active" : "En attente"}
        </Badge>
      </div>

      <Tabs defaultValue="profil">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="documents">
            Documents {allSignupDocuments.length > 0 && `(${allSignupDocuments.length})`}
          </TabsTrigger>
          {isClub && <TabsTrigger value="membres">Membres du club {clubMembers.length > 0 && `(${clubMembers.length})`}</TabsTrigger>}
        </TabsList>

        {/* ===== Profil ===== */}
        <TabsContent value="profil" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium break-all">{user.email}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{user.phone || "—"}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Ville</p><p className="text-sm font-medium">{user.city || "—"}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Discipline</p><p className="text-sm font-medium">{user.discipline || "—"}</p></div>
                    </div>
                    {isClub && user.clubType && (
                      <div className="flex items-center gap-3">
                        <BadgeCheck className="h-5 w-5 text-muted-foreground" />
                        <div><p className="text-xs text-muted-foreground">Type du club</p><p className="text-sm font-medium capitalize">{user.clubType.replace("-", " ")}</p></div>
                      </div>
                    )}
                    {isClub && user.organizationName && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div><p className="text-xs text-muted-foreground">Organisme</p><p className="text-sm font-medium">{user.organizationName}</p></div>
                      </div>
                    )}
                    {!isClub && user.birthDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div><p className="text-xs text-muted-foreground">Date de naissance</p><p className="text-sm font-medium">{user.birthDate}</p></div>
                      </div>
                    )}
                    {!isClub && user.actNumber && (
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Acte (السنة / رقم العقد)</p>
                          <p className="text-sm font-medium">{user.actYear || "—"} · {user.actNumber}</p>
                        </div>
                      </div>
                    )}
                    {user.emergencyContact && (
                      <div className="col-span-2 border-t pt-3">
                        <p className="text-xs text-muted-foreground mb-1">Contact d'urgence</p>
                        <p className="text-sm font-medium">
                          {[user.emergencyContact.relation, user.emergencyContact.name, user.emergencyContact.phone].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    )}
                    {!isClub && user.clubName && (
                      <div className="col-span-2 border-t pt-3">
                        <p className="text-xs text-muted-foreground">Club d'appartenance</p>
                        <p className="text-sm font-medium">{user.clubName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader><CardTitle>Licence</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <LicenseQrCard
                    licenseNumber={user.licenseNumber || user.publicId}
                    caption="Vérification officielle par QR code"
                  />
                  <Button className="w-full" onClick={printLicense}>
                    <Printer className="mr-2 h-4 w-4" />Imprimer la licence
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={sendPasswordReset}
                    disabled={sendingReset || !user.email}
                  >
                    {sendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Envoyer lien de réinitialisation
                  </Button>
                  <p className="text-xs text-muted-foreground text-center break-all">
                    Le lien part vers l'email du profil : {user.email || "—"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== Documents ===== */}
        <TabsContent value="documents" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> Documents d'inscription</CardTitle>
              </CardHeader>
              <CardContent>
                {signup ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Demande du {signup.submittedAt ? new Date(signup.submittedAt).toLocaleDateString("fr-FR") : "—"} · Statut : {signup.status === "approved" ? "Approuvée" : signup.status === "rejected" ? "Refusée" : "En attente"}
                      {signup.reviewerNote ? ` · Note : ${signup.reviewerNote}` : ""}
                    </p>
                    <DocumentsBrowser documents={signup.documents} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucune demande d'inscription trouvée.</p>
                )}
              </CardContent>
            </Card>

            {activationRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-accent" /> Demandes de validation de licence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activationRequests.map((request) => (
                    <div key={request.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={
                          request.status === "pending" ? "bg-yellow-100 text-yellow-800"
                            : request.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }>
                          {request.status === "pending" ? "En attente" : request.status === "approved" ? "Approuvée" : "Refusée"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      {request.reason && <p className="text-sm text-muted-foreground">« {request.reason} »</p>}
                      <DocumentsBrowser documents={request.documents} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ===== Membres du club ===== */}
        {isClub && (
          <TabsContent value="membres" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Membres du club ({clubMembers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clubMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucun membre enregistré par ce club.</p>
                )}
                {clubMembers.map((member) => (
                  <details key={member.id} className="border border-border rounded-lg p-4">
                    <summary className="cursor-pointer flex flex-wrap items-center gap-3">
                      <span className="font-medium">{member.fullName}</span>
                      <span className="font-mono text-xs text-primary">{member.memberId || member.licenseNumber || ""}</span>
                      <Badge className={
                        member.approvalStatus === "accepted" || member.approvalStatus === "approved" ? "bg-green-100 text-green-700"
                          : member.approvalStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }>
                        {member.approvalStatus === "accepted" || member.approvalStatus === "approved" ? "Validé"
                          : member.approvalStatus === "rejected" ? "Refusé" : "En attente"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {[member.age ? `${member.age} ans` : null, member.discipline, member.season, member.quality].filter(Boolean).join(" · ")}
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3 border-t pt-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-xs text-muted-foreground">Date de naissance</p><p>{member.birthDate || "—"}</p></div>
                        <div>
                          <p className="text-xs text-muted-foreground">Acte</p>
                          <p>{member.actYear || "—"} · {member.actNumber || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact d'urgence</p>
                          <p>
                            {member.emergencyContact
                              ? [member.emergencyContact.relation, member.emergencyContact.name, member.emergencyContact.phone].filter(Boolean).join(" · ")
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> Documents du membre</p>
                        <DocumentsBrowser documents={member.documents} />
                      </div>
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AccountDetailPage;
