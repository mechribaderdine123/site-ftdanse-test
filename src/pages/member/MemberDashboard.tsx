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

  useEffect(() => {
    const raw = localStorage.getItem("ftdap_member");
    if (!raw) { navigate("/member/login"); return; }
    setSession(JSON.parse(raw));
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
            <div className="bg-gradient-to-r from-primary to-primary/80 h-24" />
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                <div className="w-24 h-24 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center">
                  {isClub ? <Building2 className="w-10 h-10 text-primary" /> : <User className="w-10 h-10 text-primary" />}
                </div>
                <div className="flex-1 sm:pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{session.fullName}</h1>
                    <RoleBadge session={session} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {session.email}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.city}</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {session.discipline}</span>
                  </div>
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
              {isClub && <TabsTrigger value="dancers">Membres du club</TabsTrigger>}
              {isReferee && <TabsTrigger value="missions">Mes missions</TabsTrigger>}
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* PROFILE */}
            <TabsContent value="profile">
              <Card>
                <CardHeader><CardTitle>Mes informations</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
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

            {/* COACH / CLUB DANCERS */}
            {(isCoach || isClub) && (
              <TabsContent value="dancers">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{isClub ? "Membres du club" : "Mes danseurs"}</CardTitle>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MemberDashboard;
