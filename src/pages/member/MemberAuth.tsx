import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, User, Building2, Trophy, GraduationCap, Award,
  Upload, FileText, CheckCircle2, Mail, Lock, Phone, MapPin,
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

const MemberAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sign-up wizard state
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<AccountKind | null>(null);
  const [role, setRole] = useState<IndividualRole | null>(null);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", phone: "",
    city: "", discipline: "", clubName: "",
  });
  const [avatar, setAvatar] = useState<string>("");
  const [docs, setDocs] = useState<{ name: string; size: string }[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setDocs((prev) => [...prev, ...list]);
  };

  const finishSignup = () => {
    const session: MemberSession = {
      kind: kind!,
      role: role || undefined,
      fullName: kind === "club" ? form.clubName : form.fullName,
      email: form.email,
      city: form.city,
      discipline: form.discipline,
      clubName: form.clubName,
      avatarUrl: avatar || undefined,
    };
    localStorage.setItem("ftdap_member", JSON.stringify(session));
    window.dispatchEvent(new Event("ftdap-auth-change"));
    toast({
      title: "Demande envoyée",
      description: "Votre compte est créé. La licence sera validée sous 48h.",
    });
    navigate("/member");
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = (data.get("email") as string) || "demo@ftdap.tn";
    // Demo: pick a role from email prefix for showcase
    let demoRole: IndividualRole = "athlete";
    let demoKind: AccountKind = "individual";
    if (email.startsWith("club")) demoKind = "club";
    else if (email.startsWith("coach")) demoRole = "coach";
    else if (email.startsWith("referee") || email.startsWith("arbitre")) demoRole = "referee";

    const session: MemberSession = {
      kind: demoKind,
      role: demoKind === "individual" ? demoRole : undefined,
      fullName: demoKind === "club" ? "Club Elite Dance" : "Ahmed Ben Ali",
      email,
      city: "Tunis",
      discipline: "Hip-Hop",
      clubName: demoKind === "club" ? "Club Elite Dance" : "Club Tunis Danse",
      avatarUrl: demoKind === "club" ? "" : undefined,
    };
    localStorage.setItem("ftdap_member", JSON.stringify(session));
    toast({ title: "Connexion réussie" });
    navigate("/member");
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
                        <Input name="password" type="password" required placeholder="••••••••" className="pl-10" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      💡 Démo : préfixez votre email par <code>club</code>, <code>coach</code> ou <code>arbitre</code> pour tester chaque type d'espace.
                    </div>
                    <Button type="submit" className="w-full">Se connecter</Button>
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
                          <div className="space-y-2">
                            <Label>Nom du club *</Label>
                            <Input value={form.clubName} onChange={(e) => setForm({ ...form, clubName: e.target.value })} />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Nom complet *</Label>
                            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                          </div>
                        )}
                        {kind === "club" && (
                          <div className="space-y-2">
                            <Label>Logo du club</Label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                                {avatar ? (
                                  <img src={avatar} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                  <Building2 className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => setAvatar(ev.target?.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <span><Upload className="w-3.5 h-3.5 mr-1" /> Choisir une image</span>
                                </Button>
                              </label>
                            </div>
                          </div>
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
                          <Label>Mot de passe *</Label>
                          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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
                          <Button variant="ghost" onClick={() => setStep(kind === "club" ? 1 : 2)}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                          </Button>
                          <Button onClick={() => setStep(4)} disabled={!form.email || !form.password || !form.city}>
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
                            ) : (
                              <>
                                <li>Carte d'identité nationale (recto/verso)</li>
                                <li>Photo d'identité récente</li>
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
                          />
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Cliquez pour télécharger</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10MB</p>
                        </label>

                        {docs.length > 0 && (
                          <div className="space-y-2">
                            {docs.map((d, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <FileText className="w-4 h-4 text-accent" />
                                <span className="text-sm flex-1 truncate">{d.name}</span>
                                <span className="text-xs text-muted-foreground">{d.size}</span>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between pt-2">
                          <Button variant="ghost" onClick={() => setStep(3)}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                          </Button>
                          <Button onClick={finishSignup} disabled={docs.length === 0}>
                            Envoyer la demande
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
