import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, User, Building2, Trophy, GraduationCap, Award,
  Upload, FileText, CheckCircle2, Mail, Lock, Phone, MapPin, Loader2, Eye, EyeOff, ImagePlus, X,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { computeAge } from "@/data/clubMembersStore";

type AccountKind = "individual" | "club";
type IndividualRole = "athlete" | "coach" | "referee";

const MemberAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  // Sign-up wizard state
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<AccountKind | null>(null);
  const [role, setRole] = useState<IndividualRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", phone: "",
    city: "", discipline: "", clubName: "",
    clubType: "", orgName: "",
    birthDate: "", gender: "M", actYear: "", actNumber: "",
    emergencyRelation: "", emergencyName: "", emergencyPhone: "", emergencyEmail: "",
  });
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setDocumentFiles(prev => [...prev, ...newFiles]);
    setDocumentTypes(prev => [...prev, ...newFiles.map(() => "")]);
  };

  const removeFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
    setDocumentTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogoChange = (file: File | null) => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  // Individual signups share the dancer profile: age drives the required documents.
  const signupAge = computeAge(form.birthDate);

  const finishSignup = async () => {
    if (documentFiles.length === 0) {
      toast({ title: "Erreur", description: "Au moins un document est requis", variant: "destructive" });
      return;
    }

    // Validate all documents have types
    if (documentTypes.some(t => !t.trim())) {
      toast({ title: "Erreur", description: "Veuillez spécifier le type pour chaque document", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Validate and build form data
      const fullNameValue = kind === "club" ? form.orgName : form.fullName;
      if (!fullNameValue?.trim()) throw new Error(kind === "club" ? "Nom d'organisme requis" : "Nom complet requis");
      if (!form.email?.trim()) throw new Error("Email requis");
      if (!form.password?.trim()) throw new Error("Mot de passe requis");
      if (!form.city?.trim()) throw new Error("Ville requise");
      if (!form.discipline?.trim()) throw new Error("Discipline requise");
      
      if (kind === "club" && !form.clubType?.trim()) throw new Error("Type du club requis");
      if (kind === "individual") {
        if (!form.birthDate?.trim()) throw new Error("Date de naissance requise");
        if (!form.actYear?.trim()) throw new Error("Année (السنة) requise");
        if (!form.actNumber?.trim()) throw new Error("N° d'acte (رقم العقد) requis");
        if (!form.emergencyRelation?.trim() || !form.emergencyName?.trim() || !form.emergencyPhone?.trim()) {
          throw new Error("Contact d'urgence incomplet (lien, nom et téléphone requis)");
        }
        const chosenTypes = documentTypes.map((t) => t.trim());
        if (signupAge < 18) {
          if (!chosenTypes.includes("parental_auth")) throw new Error("ترخيص أبوي (Autorisation parentale) requise pour les mineurs");
          if (!chosenTypes.includes("photo")) throw new Error("الصورة (Photo d'identité) requise pour les mineurs");
        } else {
          if (!chosenTypes.some((t) => t === "id_recto" || t === "id_verso")) throw new Error("Carte d'identité nationale requise (recto ou verso)");
          if (!chosenTypes.includes("photo")) throw new Error("Photo d'identité requise");
        }
      }

      formData.append("fullName", fullNameValue.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("phone", form.phone?.trim() || "");
      formData.append("city", form.city.trim());
      formData.append("discipline", form.discipline.trim());
      formData.append("clubName", form.clubName?.trim() || "");
      formData.append("accountType", kind === "club" ? "club" : (role || "athlete"));
      formData.append("documentTypes", JSON.stringify(documentTypes.map(t => t.trim())));
      if (kind === "club") {
        formData.append("clubType", form.clubType.trim());
        formData.append("organizationName", form.orgName.trim());
        if (logoFile) formData.append("logo", logoFile);
      } else {
        formData.append("birthDate", form.birthDate.trim());
        formData.append("gender", form.gender);
        formData.append("actYear", form.actYear.trim());
        formData.append("actNumber", form.actNumber.trim());
        formData.append("emergencyContact", JSON.stringify({
          relation: form.emergencyRelation.trim(),
          name: form.emergencyName.trim(),
          phone: form.emergencyPhone.trim(),
          email: form.emergencyEmail?.trim() || undefined,
        }));
      }

      // Add files
      for (let i = 0; i < documentFiles.length; i++) {
        formData.append("documents", documentFiles[i]);
      }
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      // Parse response
      let data: any = {};
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          if (text) {
            try {
              data = JSON.parse(text);
            } catch {
              throw new Error(`Server returned invalid response: ${text.substring(0, 100)}`);
            }
          }
        }
      } catch (parseErr) {
        console.error("Response parse error:", parseErr);
        throw new Error("Erreur serveur: réponse invalide");
      }

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Demande envoyée",
        description: "Votre compte est créé. La licence sera validée sous 48h.",
      });

      // Clear form and redirect
      setStep(1);
      navigate("/member/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue";
      console.error("Signup error:", message);
      toast({
        title: "Erreur d'inscription",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = (data.get("email") as string) || "";
    const password = (data.get("password") as string) || "";

    if (!email || !password) {
      toast({ title: "Erreur", description: "Email et mot de passe requis", variant: "destructive" });
      return;
    }

    const { error, user: signedIn } = await signIn(email, password);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Connexion réussie" });
      // Clubs skip the profile page and land directly on their member management.
      navigate(signedIn?.accountType === "club" ? "/member/dashboard" : "/member");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="bg-primary text-primary-foreground p-6">
              <h1 className="text-2xl font-bold">Espace Membre FTDAP</h1>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Accédez à votre espace personnel ou créez un compte
              </p>
            </div>

            <div className="p-6">
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup">Créer un compte</TabsTrigger>
                </TabsList>

                {/* === LOGIN === */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input name="email" type="email" required placeholder="vous@example.com" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" className="pl-10 pr-10" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Se connecter</Button>
                    <div className="text-center">
                      <Link to="/forgot-password" className="text-sm text-accent hover:underline">Mot de passe oublié?</Link>
                    </div>
                  </form>
                </TabsContent>

                {/* === SIGNUP === */}
                <TabsContent value="signup">
                  <div className="pt-4">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: step >= s ? "100%" : "0%" }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Step 1 — Kind */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Quel type de compte souhaitez-vous créer ?</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => { setKind("individual"); setStep(2); }}
                            className={`p-5 rounded-xl border-2 text-left transition-all hover:border-accent hover:shadow-md ${
                              kind === "individual" ? "border-accent bg-accent/5" : "border-border"
                            }`}
                          >
                            <User className="w-8 h-8 text-accent mb-2" />
                            <div className="font-semibold">Individuel</div>
                            <p className="text-xs text-muted-foreground mt-1">Athlète, coach ou arbitre</p>
                          </button>
                          <button
                            onClick={() => { setKind("club"); setRole(null); setStep(3); }}
                            className={`p-5 rounded-xl border-2 text-left transition-all hover:border-accent hover:shadow-md ${
                              kind === "club" ? "border-accent bg-accent/5" : "border-border"
                            }`}
                          >
                            <Building2 className="w-8 h-8 text-accent mb-2" />
                            <div className="font-semibold">Club</div>
                            <p className="text-xs text-muted-foreground mt-1">Affilier votre club et gérer vos danseurs</p>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2 — Individual role */}
                    {step === 2 && kind === "individual" && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Votre profil</h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {[
                            { id: "athlete", label: "Athlète", icon: Trophy, desc: "Danseur en compétition" },
                            { id: "coach", label: "Coach", icon: GraduationCap, desc: "Entraîneur de danseurs" },
                            { id: "referee", label: "Arbitre", icon: Award, desc: "Juge officiel" },
                          ].map((r) => {
                            const Icon = r.icon;
                            return (
                              <button
                                key={r.id}
                                onClick={() => { setRole(r.id as IndividualRole); setStep(3); }}
                                className={`p-4 rounded-xl border-2 text-left transition-all hover:border-accent ${
                                  role === r.id ? "border-accent bg-accent/5" : "border-border"
                                }`}
                              >
                                <Icon className="w-6 h-6 text-accent mb-2" />
                                <div className="font-semibold text-sm">{r.label}</div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                        </Button>
                      </div>
                    )}

                    {/* Step 3 — Personal info */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Vos informations</h3>
                        {kind === "club" ? (
                          <>
                            <div className="space-y-2">
                              <Label>Type du club *</Label>
                              <Select value={form.clubType} onValueChange={(v) => setForm({ ...form, clubType: v })}>
                                <SelectTrigger><SelectValue placeholder="Choisir le type..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="institution">Institution</SelectItem>
                                  <SelectItem value="association">Association</SelectItem>
                                  <SelectItem value="organisme-prive">Organisme privé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Nom de l'organisme *</Label>
                              <Input value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Nom du club *</Label>
                              <Input value={form.clubName} onChange={(e) => setForm({ ...form, clubName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Logo du club</Label>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                  {logoPreview ? (
                                    <img src={logoPreview} alt="Logo du club" className="w-full h-full object-contain" />
                                  ) : (
                                    <Building2 className="w-7 h-7 text-muted-foreground" />
                                  )}
                                </div>
                                <label className="inline-flex items-center gap-2 text-sm border border-border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors">
                                  <ImagePlus className="w-4 h-4" /> Choisir une image
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) handleLogoChange(f); }}
                                    disabled={submitting}
                                  />
                                </label>
                                {logoPreview && (
                                  <button
                                    type="button"
                                    onClick={() => handleLogoChange(null)}
                                    className="text-muted-foreground hover:text-destructive"
                                    title="Retirer le logo"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">PNG, JPG ou WebP — max 10 Mo (optionnel)</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Nom complet *</Label>
                              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Date de naissance *</Label>
                                <Input
                                  type="date"
                                  value={form.birthDate}
                                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                  max={new Date().toISOString().slice(0, 10)}
                                />
                                {form.birthDate && (
                                  <p className="text-xs text-muted-foreground">
                                    {signupAge} ans · {signupAge < 18 ? "Mineur (< 18 ans)" : "Adulte (≥ 18 ans)"}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Genre</Label>
                                <select
                                  value={form.gender}
                                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  <option value="M">Homme</option>
                                  <option value="F">Femme</option>
                                </select>
                              </div>
                            </div>
                            {form.birthDate && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Année (السنة) *</Label>
                                  <Input
                                    type="number"
                                    min={1900}
                                    max={2100}
                                    value={form.actYear}
                                    onChange={(e) => setForm({ ...form, actYear: e.target.value })}
                                    placeholder="Ex. 2012"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>N° d'acte (رقم العقد) *</Label>
                                  <Input
                                    value={form.actNumber}
                                    onChange={(e) => setForm({ ...form, actNumber: e.target.value })}
                                    placeholder="Ex. 12345"
                                  />
                                </div>
                              </div>
                            )}
                            {form.birthDate && (
                              <div className="border border-border rounded-lg p-3 space-y-3">
                                <h5 className="text-xs font-semibold">
                                  {signupAge < 18
                                    ? "Contact d'urgence — Parent (obligatoire pour les mineurs)"
                                    : "Contact en cas d'urgence"}
                                </h5>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      {signupAge < 18 ? "Lien de parenté *" : "Lien / Relation *"}
                                    </Label>
                                    {signupAge < 18 ? (
                                      <select
                                        value={form.emergencyRelation}
                                        onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      >
                                        <option value="father">Père (الأب)</option>
                                        <option value="mother">Mère (الأم)</option>
                                      </select>
                                    ) : (
                                      <Input
                                        value={form.emergencyRelation}
                                        onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                                        placeholder="Ex. Conjoint, Ami, Frère..."
                                      />
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Nom complet *</Label>
                                    <Input
                                      value={form.emergencyName}
                                      onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                                      required={signupAge < 18}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Téléphone *</Label>
                                    <Input
                                      type="tel"
                                      value={form.emergencyPhone}
                                      onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                                      placeholder="+216 .. ... ..."
                                      required={signupAge < 18}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Email</Label>
                                    <Input
                                      type="email"
                                      value={form.emergencyEmail}
                                      onChange={(e) => setForm({ ...form, emergencyEmail: e.target.value })}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Téléphone *</Label>
                            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Mot de passe (min. 8 caractères) *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10 pr-10" />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ville *</Label>
                            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Discipline *</Label>
                            <Select value={form.discipline} onValueChange={(v) => setForm({ ...form, discipline: v })}>
                              <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                              <SelectContent>
                                {["Breakdance", "Hip-Hop", "Salsa", "Bachata", "Ballet", "Jazz", "Contemporain", "Krump", "Multi-disciplines"].map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {kind === "individual" && (
                          <div className="space-y-2">
                            <Label>Club d'appartenance</Label>
                            <Input value={form.clubName} onChange={(e) => setForm({ ...form, clubName: e.target.value })} placeholder="Optionnel" />
                          </div>
                        )}
                        <div className="flex justify-between pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setStep(kind === "club" ? 1 : 2)}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                          </Button>
                          <Button size="sm" onClick={() => setStep(4)} disabled={!form.email || !form.password || !form.city || (kind === "individual" && !form.fullName) || (kind === "club" && !form.orgName)}>
                            Continuer <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 4 — Documents */}
                    {step === 4 && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Justificatifs d'identité</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Téléchargez les documents requis pour valider votre {kind === "club" ? "affiliation" : "profil"} :
                          </p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                            {kind === "club" ? (
                              <>
                                <li>Statuts du club (PDF)</li>
                                <li>Récépissé de dépôt légal / Journal Officiel</li>
                                <li>Pièce d'identité du président</li>
                                <li>Procès-verbal de la dernière AG</li>
                                <li>Liste des membres du bureau</li>
                                <li>RIB du club</li>
                                <li>Attestation d'assurance</li>
                              </>
                            ) : form.birthDate && signupAge < 18 ? (
                              <>
                                <li className="font-medium">ترخيص أبوي (Autorisation parentale) — obligatoire</li>
                                <li className="font-medium">الصورة (Photo d'identité) — obligatoire</li>
                                <li>Extrait de naissance</li>
                              </>
                            ) : (
                              <>
                                <li className="font-medium">Carte d'identité nationale (recto/verso) — obligatoire</li>
                                <li className="font-medium">Photo d'identité récente — obligatoire</li>
                                {role === "coach" && <li>Diplôme ou certificat d'entraîneur</li>}
                                {role === "referee" && <li>Certificat d'arbitrage</li>}
                                {role === "athlete" && <li>Certificat médical</li>}
                              </>
                            )}
                          </ul>
                        </div>

                        <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFiles(e.target.files)}
                            disabled={submitting}
                          />
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Cliquez pour télécharger</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10MB</p>
                        </label>

                        {documentFiles.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Documents {documentFiles.length > 0 && `(${documentFiles.length})`}</p>
                            {documentFiles.map((file, i) => (
                              <div key={i} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3 justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-accent shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="text-xs text-destructive hover:underline"
                                  >
                                    Retirer
                                  </button>
                                </div>
                                <div>
                                  <Label htmlFor={`type-${i}`} className="text-xs">Type de document *</Label>
                                  <Select value={documentTypes[i]} onValueChange={(v) => {
                                    const newTypes = [...documentTypes];
                                    newTypes[i] = v;
                                    setDocumentTypes(newTypes);
                                  }}>
                                    <SelectTrigger id={`type-${i}`} className="h-8 text-xs">
                                      <SelectValue placeholder="Sélectionner le type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {kind === "club" ? (
                                        <>
                                          <SelectItem value="statuts">Statuts du club</SelectItem>
                                          <SelectItem value="legal">Récépissé de dépôt légal</SelectItem>
                                          <SelectItem value="id">Pièce d'identité</SelectItem>
                                          <SelectItem value="ag">Procès-verbal AG</SelectItem>
                                          <SelectItem value="bureau">Liste du bureau</SelectItem>
                                          <SelectItem value="rib">RIB</SelectItem>
                                          <SelectItem value="assurance">Attestation assurance</SelectItem>
                                          <SelectItem value="autre">Autre</SelectItem>
                                        </>
                                      ) : (
                                        <>
                                          {form.birthDate && signupAge < 18 && (
                                            <SelectItem value="parental_auth">ترخيص أبوي (Autorisation parentale)</SelectItem>
                                          )}
                                          <SelectItem value="id_recto">Pièce d'identité recto</SelectItem>
                                          <SelectItem value="id_verso">Pièce d'identité verso</SelectItem>
                                          <SelectItem value="birth_extract">Extrait de naissance (مضمون)</SelectItem>
                                          <SelectItem value="photo">Photo d'identité</SelectItem>
                                          <SelectItem value="medical">Certificat médical</SelectItem>
                                          <SelectItem value="diplome">Diplôme/Certificat</SelectItem>
                                          <SelectItem value="autre">Autre</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setStep(3)} disabled={submitting}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                          </Button>
                          <Button 
                            size="sm"
                            onClick={finishSignup} 
                            disabled={documentFiles.length === 0 || submitting || documentTypes.some(t => !t.trim())}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Envoi...
                              </>
                            ) : (
                              "Envoyer la demande"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MemberAuth;
