import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Mail, Phone, MapPin, Award, LogOut, Loader2, AlertCircle, CheckCircle2,
  Building2, Printer, Camera, User, FileText, Trophy, Medal, Upload, X, ArrowLeft, Clock,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, API_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { openProtectedFile } from "@/lib/download";
import { LicenseQrCard, openPrintLicenseWindow } from "@/components/LicenseQr";
import LicenseExpiry from "@/components/LicenseExpiry";

interface RenewalInfo {
  licenseNumber: string | null;
  licenseExpiresAt: string | null;
  status: string;
  season: string;
  daysRemaining: number | null;
  canRequestRenewal: boolean;
  renewal: {
    id: number;
    status: string;
    renewalDocuments: { id: string; originalName: string }[];
    requestedAt: string;
    reviewedAt: string | null;
    reviewerNote: string | null;
  } | null;
}

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  discipline: string;
  accountType: "athlete" | "coach" | "referee" | "club";
  clubName?: string;
  status: string;
  licenseNumber: string | null;
  publicId: string | null;
  avatarUrl: string | null;
  licenseActive: boolean;
  createdAt: string;
}

interface RequestDocument {
  id: string;
  name: string;
  type?: string;
  mimeType: string;
  size?: number;
  url: string;
}

interface ActivationRequest {
  id: number;
  userId: number;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  documents?: RequestDocument[];
  createdAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

interface MemberResult {
  id: number;
  eventName: string;
  date: string | null;
  place: string | null;
  rank: number | null;
  club: string | null;
}

const RoleBadge = ({ accountType }: { accountType: UserProfile["accountType"] }) => {
  const map = {
    athlete: { label: "Athlète", icon: Trophy, cls: "bg-blue-100 text-blue-700" },
    coach: { label: "Coach", icon: Award, cls: "bg-amber-100 text-amber-700" },
    referee: { label: "Arbitre", icon: Award, cls: "bg-purple-100 text-purple-700" },
    club: { label: "Club", icon: Building2, cls: "bg-violet-100 text-violet-700" },
  };
  const m = map[accountType] || map.athlete;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {m.label}
    </span>
  );
};

const MemberProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activationRequest, setActivationRequest] = useState<ActivationRequest | null>(null);
  const [results, setResults] = useState<MemberResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [activationReason, setActivationReason] = useState("");
  const [activationFiles, setActivationFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [renewalInfo, setRenewalInfo] = useState<RenewalInfo | null>(null);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [renewalNote, setRenewalNote] = useState("");
  const [renewalFiles, setRenewalFiles] = useState<{ file: File; type: string }[]>([]);
  const [renewalSubmitting, setRenewalSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/member/login");
      return;
    }
    // Clubs land directly on their member-management dashboard.
    if (user.accountType === "club") {
      navigate("/member/dashboard", { replace: true });
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    void loadRenewalInfo();
    try {
      setLoading(true);
      const userData = await apiRequest<UserProfile>(`/api/member/profile`);
      setProfile(userData);
      const activRequest = await apiRequest<ActivationRequest>(`/api/member/activation-request`).catch(() => null);
      setActivationRequest(activRequest);
    } catch (error) {
      console.warn("Profil load warning:", error);
      // apiRequest clears the stored token on 401: send the member to login
      // instead of showing a misleading "profil non trouvé".
      if (!localStorage.getItem("authToken")) {
        navigate("/member/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRenewalInfo = async () => {
    try {
      setRenewalInfo(await apiRequest<RenewalInfo>("/api/member/license-renewal"));
    } catch {
      setRenewalInfo(null);
    }
  };

  const loadResults = async () => {
    setResultsLoading(true);
    try {
      const memberResults = await apiRequest<MemberResult[]>("/api/member/results");
      setResults(memberResults);
    } catch {
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erreur", description: "Veuillez choisir une image (JPG ou PNG)", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 5 Mo", variant: "destructive" });
      return;
    }
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await apiRequest<{ avatarUrl: string }>("/api/member/avatar", {
        method: "POST",
        body: formData,
      });
      setProfile((previous) => (previous ? { ...previous, avatarUrl: response.avatarUrl } : previous));
      toast({ title: "Succès", description: "Photo de profil mise à jour" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer la photo",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRequestActivation = async () => {
    if (!activationReason.trim()) {
      toast({ title: "Erreur", description: "Veuillez indiquer une raison", variant: "destructive" });
      return;
    }
    if (activationFiles.length === 0) {
      toast({ title: "Erreur", description: "Veuillez joindre au moins un document justificatif", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("reason", activationReason);
      activationFiles.forEach((file) => formData.append("documents", file));
      await apiRequest("/api/member/request-activation", {
        method: "POST",
        body: formData,
      });
      toast({ title: "Succès", description: "Demande de validation envoyée" });
      setActivationModalOpen(false);
      setActivationReason("");
      setActivationFiles([]);
      await loadProfile();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const viewDocument = async (url: string, name: string) => {
    try {
      await openProtectedFile(url);
    } catch {
      toast({ title: "Erreur", description: `Impossible d'ouvrir ${name}`, variant: "destructive" });
    }
  };

  const submitRenewal = async () => {
    if (renewalFiles.length === 0) {
      toast({ title: "Erreur", description: "Joignez au moins un document justificatif", variant: "destructive" });
      return;
    }
    if (renewalFiles.some((entry) => !entry.type.trim())) {
      toast({ title: "Erreur", description: "Indiquez le type de chaque document", variant: "destructive" });
      return;
    }
    try {
      setRenewalSubmitting(true);
      // Le serveur crée la demande (initiate) puis reçoit les fichiers (upload).
      await apiRequest("/api/member/license-renewal/initiate", { method: "POST" });
      const formData = new FormData();
      formData.append("documentTypes", JSON.stringify(renewalFiles.map((entry) => entry.type.trim())));
      formData.append("keepExistingDocuments", JSON.stringify([]));
      renewalFiles.forEach((entry) => formData.append("documents", entry.file));
      await apiRequest("/api/member/license-renewal/upload-documents", { method: "POST", body: formData });
      toast({ title: "Demande envoyée", description: "Votre renouvellement sera traité par l'administration." });
      setRenewalModalOpen(false);
      setRenewalNote("");
      setRenewalFiles([]);
      await loadRenewalInfo();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Envoi impossible",
        variant: "destructive",
      });
    } finally {
      setRenewalSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p>Profil non trouvé</p>
            <Button className="mt-4" onClick={() => navigate("/member/login")}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeLabels = { athlete: "Athlète", coach: "Coach", referee: "Arbitre", club: "Club" };

  const printLicense = async () => {
    const ok = await openPrintLicenseWindow({
      licenseNumber: profile.licenseNumber || profile.publicId || `FTDAP-M-${String(profile.id).padStart(6, "0")}`,
      fullName: profile.fullName,
      accountType: profile.accountType,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      discipline: profile.discipline,
      clubName: profile.clubName,
      photoUrl: avatarSrc || undefined,
    });
    if (!ok) {
      toast({ title: "Impression impossible", description: "Autorisez les pop-ups pour imprimer votre licence.", variant: "destructive" });
    }
  };

  const avatarSrc = profile.avatarUrl
    ? profile.avatarUrl.startsWith("/api/") ? `${API_URL}${profile.avatarUrl}` : profile.avatarUrl
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* En-tête style dashboard : bannière + avatar chevauchant */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Accueil
        </button>
        <div className="flex items-center gap-2">
          {profile.accountType === "club" && (
            <Button onClick={() => navigate("/member/dashboard")}>
              <Building2 className="mr-2 h-4 w-4" /> Gérer mes membres
            </Button>
          )}
          <Button variant="outline" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 h-28" />
        <CardContent className="pt-0 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between gap-4">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-card border-4 border-card shadow-lg overflow-hidden flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <label
                className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow hover:bg-primary/90 transition-colors ${uploadingAvatar ? "opacity-70 pointer-events-none" : ""}`}
                title="Changer la photo de profil"
              >
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold break-words">{profile.fullName}</h1>
              <RoleBadge accountType={profile.accountType} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile.email}</span>
              {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city}</span>}
              {profile.discipline && <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {profile.discipline}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profil">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {profile.accountType !== "club" && <TabsTrigger value="resultats">Résultats</TabsTrigger>}
          <TabsTrigger value="licence">Licence</TabsTrigger>
        </TabsList>

        {/* ===== Onglet Profil ===== */}
        <TabsContent value="profil" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium break-all">{profile.email}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{profile.phone || "—"}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Ville</p><p className="text-sm font-medium">{profile.city || "—"}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Discipline</p><p className="text-sm font-medium">{profile.discipline || "—"}</p></div>
                    </div>
                  </div>
                  {profile.clubName && (
                    <div className="border-t pt-4 flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div><p className="text-xs text-muted-foreground">Club</p><p className="text-sm font-medium">{profile.clubName}</p></div>
                    </div>
                  )}
                  {profile.licenseNumber && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">Numéro de licence (attribué automatiquement)</p>
                      <p className="font-mono font-bold text-primary">{profile.licenseNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Demande d'activation */}
              {!profile.licenseActive && (
                <Card className="border-yellow-200 bg-yellow-50/30">
                  <CardHeader><CardTitle className="text-lg">Demande de validation</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {activationRequest ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          {activationRequest.status === "pending" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                          {activationRequest.status === "approved" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {activationRequest.status === "rejected" && <AlertCircle className="h-5 w-5 text-red-600" />}
                          <span className="font-medium">
                            {activationRequest.status === "pending" ? "En attente de validation" : activationRequest.status === "approved" ? "Approuvée" : "Refusée"}
                          </span>
                        </div>
                        {activationRequest.reviewerNote && (
                          <p className="text-sm text-muted-foreground p-3 bg-white rounded border">{activationRequest.reviewerNote}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          Demande du {new Date(activationRequest.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">Demandez la validation de votre licence auprès de l'administrateur</p>
                        <Button onClick={() => setActivationModalOpen(true)}>Envoyer la demande de validation</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Statut */}
              <Card>
                <CardHeader><CardTitle>Statut</CardTitle></CardHeader>
                <CardContent>
                  <Badge className={profile.licenseActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {profile.licenseActive ? "✓ Licence active" : "Licence inactive"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite : aperçu licence + QR */}
            <div>
              <Card>
                <CardHeader><CardTitle>Licence</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <LicenseQrCard
                    licenseNumber={profile.licenseNumber || profile.publicId}
                    caption="Scannez pour vérifier la licence"
                  />
                  {renewalInfo && profile.licenseActive && (
                    <LicenseExpiry info={renewalInfo} className="w-full" />
                  )}
                  <Button className="w-full" onClick={printLicense}>
                    <Printer className="mr-2 h-4 w-4" />Imprimer licence
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== Onglet Documents ===== */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents envoyés lors de votre inscription et de vos demandes de validation.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> Documents d'inscription</p>
                <SignupDocuments onView={viewDocument} />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-2"><Upload className="w-4 h-4 text-accent" /> Documents des demandes de validation</p>
                {activationRequest?.documents && activationRequest.documents.length > 0 ? (
                  <div className="space-y-2">
                    {activationRequest.documents.map((document) => (
                      <div key={document.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <FileText className="w-5 h-5 text-accent shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{document.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Demande de validation — {new Date(activationRequest.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => viewDocument(document.url, document.name)}>
                          Voir
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Aucun document de validation envoyé pour le moment.
                  </p>
                )}
              </div>
            </CardContent>
            {!profile.licenseActive && !activationRequest && (
              <CardContent className="border-t">
                <Button className="mt-4" onClick={() => setActivationModalOpen(true)}>
                  Envoyer la demande de validation
                </Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* ===== Onglet Résultats ===== */}
        {profile.accountType !== "club" && (
        <TabsContent value="resultats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" /> Mes résultats</CardTitle>
              <p className="text-sm text-muted-foreground">Vos classements dans les compétitions publiées par la fédération.</p>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : results.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Aucun résultat enregistré à votre nom pour le moment.
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((memberResult) => (
                    <div key={memberResult.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {memberResult.rank === 1 ? <Medal className="w-5 h-5 text-yellow-500" />
                          : memberResult.rank === 2 ? <Medal className="w-5 h-5 text-gray-400" />
                          : memberResult.rank === 3 ? <Medal className="w-5 h-5 text-amber-600" />
                          : <span className="text-sm font-bold text-muted-foreground">{memberResult.rank || "—"}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{memberResult.eventName}</div>
                        <div className="text-xs text-muted-foreground">
                          {[memberResult.date, memberResult.place, memberResult.club].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </div>
                      {memberResult.rank === 1 && <Badge className="bg-yellow-100 text-yellow-700">Vainqueur</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* ===== Onglet Licence ===== */}
        <TabsContent value="licence" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Ma licence</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Numéro de licence</Label>
                  <p className="font-mono text-lg font-bold text-primary">
                    {profile.licenseNumber || profile.publicId || "En attente d'attribution"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Titulaire</Label>
                  <p className="text-sm font-medium">{profile.fullName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="text-sm font-medium">{typeLabels[profile.accountType]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={profile.licenseActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {profile.licenseActive ? "✓ Licence active" : "Licence inactive"}
                  </Badge>
                </div>

                {/* Échéance annuelle + compte à rebours */}
                {renewalInfo && profile.licenseActive && (
                  <LicenseExpiry info={renewalInfo} />
                )}

                {/* État de la demande de renouvellement */}
                {renewalInfo?.renewal && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {renewalInfo.renewal.status === "pending" && <Clock className="w-4 h-4 text-yellow-600" />}
                      {renewalInfo.renewal.status === "submitted" && <Clock className="w-4 h-4 text-yellow-600" />}
                      {renewalInfo.renewal.status === "approved" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {renewalInfo.renewal.status === "rejected" && <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span className="text-sm font-medium">
                        {renewalInfo.renewal.status === "pending"
                          ? "Renouvellement : brouillon à compléter"
                          : renewalInfo.renewal.status === "submitted"
                            ? `Renouvellement ${renewalInfo.season} : en cours de traitement`
                            : renewalInfo.renewal.status === "approved"
                              ? `Renouvellement ${renewalInfo.season} : approuvé`
                              : `Renouvellement ${renewalInfo.season} : refusé`}
                      </span>
                    </div>
                    {renewalInfo.renewal.reviewerNote && (
                      <p className="text-sm text-muted-foreground bg-white rounded border p-2">{renewalInfo.renewal.reviewerNote}</p>
                    )}
                  </div>
                )}

                {!profile.licenseActive && !activationRequest && (
                  <Button onClick={() => setActivationModalOpen(true)}>Envoyer la demande de validation</Button>
                )}
                {renewalInfo?.canRequestRenewal && (
                  <Button onClick={() => setRenewalModalOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    {renewalInfo.renewal?.status === "rejected" ? "Compléter la demande de renouvellement" : "Demander le renouvellement"}
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Vérification</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <LicenseQrCard
                  licenseNumber={profile.licenseNumber || profile.publicId}
                  caption="Scannez pour vérifier la licence"
                />
                <Button className="w-full" onClick={printLicense}>
                  <Printer className="mr-2 h-4 w-4" />Imprimer licence
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal demande de validation avec documents */}
      <Dialog open={activationModalOpen} onOpenChange={(open) => { if (!submitting) setActivationModalOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de validation</DialogTitle>
            <DialogDescription>
              Indiquez la raison de votre demande et joignez vos documents justificatifs (certificat médical, licence fédérale, pièce d'identité…).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Raison de la demande</Label>
              <Textarea
                placeholder="Expliquez votre demande..."
                value={activationReason}
                onChange={(e) => setActivationReason(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Documents justificatifs (obligatoire)</Label>
              <label className="mt-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cliquez pour ajouter des documents (PDF, JPG ou PNG)</span>
                <Input
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    event.target.value = "";
                    setActivationFiles((previous) => [...previous, ...files]);
                  }}
                />
              </label>
              {activationFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {activationFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30">
                      <FileText className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)} Ko</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setActivationFiles((previous) => previous.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActivationModalOpen(false)} disabled={submitting}>Annuler</Button>
              <Button onClick={handleRequestActivation} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de renouvellement annuel avec documents */}
      <Dialog open={renewalModalOpen} onOpenChange={(open) => { if (!renewalSubmitting) setRenewalModalOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renouvellement de licence — saison {renewalInfo?.season}</DialogTitle>
            <DialogDescription>
              Joignez vos documents justificatifs (certificat médical, pièce d'identité…).
              L'administration vérifiera votre dossier avant d'étendre votre licence d'un an.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {renewalInfo?.licenseExpiresAt && (
              <LicenseExpiry info={renewalInfo} />
            )}
            <div>
              <Label>Documents justificatifs (obligatoire)</Label>
              <label className="mt-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cliquez pour ajouter des documents (PDF, JPG ou PNG)</span>
                <Input
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    event.target.value = "";
                    setRenewalFiles((previous) => [...previous, ...files.map((file) => ({ file, type: "" }))]);
                  }}
                />
              </label>
              {renewalFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {renewalFiles.map((entry, index) => (
                    <div key={`${entry.file.name}-${index}`} className="p-2 border border-border rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm truncate flex-1">{entry.file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{(entry.file.size / 1024).toFixed(0)} Ko</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setRenewalFiles((previous) => previous.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Select
                        value={entry.type}
                        onValueChange={(value) =>
                          setRenewalFiles((previous) => previous.map((item, i) => (i === index ? { ...item, type: value } : item)))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Type de document *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Certificat médical</SelectItem>
                          <SelectItem value="id">Pièce d'identité</SelectItem>
                          <SelectItem value="insurance">Attestation d'assurance</SelectItem>
                          <SelectItem value="photo">Photo d'identité</SelectItem>
                          <SelectItem value="payment">Justificatif de paiement</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Note à l'administrateur (optionnel)</Label>
              <Textarea
                placeholder="Précisez votre demande..."
                value={renewalNote}
                onChange={(e) => setRenewalNote(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRenewalModalOpen(false)} disabled={renewalSubmitting}>Annuler</Button>
              <Button onClick={submitRenewal} disabled={renewalSubmitting || renewalFiles.length === 0}>
                {renewalSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Envoyer la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Lists the documents uploaded during signup (server route /api/member/documents).
const SignupDocuments = ({ onView }: { onView: (url: string, name: string) => void }) => {
  const [documents, setDocuments] = useState<RequestDocument[] | null>(null);

  useEffect(() => {
    apiRequest<RequestDocument[]>("/api/member/documents")
      .then(setDocuments)
      .catch(() => setDocuments([]));
  }, []);

  if (documents === null) {
    return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Aucun document d'inscription trouvé.</p>;
  }
  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <div key={document.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <FileText className="w-5 h-5 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{document.name}</div>
            <div className="text-xs text-muted-foreground">{document.type}</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onView(document.url, document.name)}>Voir</Button>
        </div>
      ))}
    </div>
  );
};

export default MemberProfile;
