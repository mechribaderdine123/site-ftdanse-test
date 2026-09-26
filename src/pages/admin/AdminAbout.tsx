import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Trash2, Plus, Save, ImageIcon, Eye, Loader2,
  Target, Flag, Heart, Star, Award, Trophy, Users, Zap,
  Globe, Shield, Rocket, Lightbulb, Compass, BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { Link } from "react-router-dom";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  adminListContent, adminCreateContent, adminUpdateContent,
  contentUrl, type ContentItem,
} from "@/lib/contentApi";

/** Available icons for Mission / Vision / Objectifs cards */
const ICON_OPTIONS = {
  Target, Eye, Flag, Heart, Star, Award, Trophy, Users,
  Zap, Globe, Shield, Rocket, Lightbulb, Compass, BookOpen,
} as const;
type IconName = keyof typeof ICON_OPTIONS;

const IconPicker = ({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) => {
  const Current = ICON_OPTIONS[value];
  return (
    <div className="space-y-2">
      <Label className="text-xs">Icône</Label>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Current className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="grid grid-cols-8 gap-1.5 flex-1">
          {(Object.keys(ICON_OPTIONS) as IconName[]).map((name) => {
            const Icon = ICON_OPTIONS[name];
            const active = name === value;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                title={name}
                className={`h-8 w-8 rounded-md flex items-center justify-center border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 border-border hover:bg-muted"
                }`}
              >
                <Icon className="w-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface TimelineItem { id: string; year: string; title: string; desc: string; }
interface BureauMember { id: string; name: string; role: string; date: string; photo: string; }
interface ValueCard { id: string; title: string; desc: string; icon: IconName; }

interface AboutPayload {
  heroImage: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  pratiquesImage: string;
  pratiquesTitle1: string;
  pratiquesTitle2: string;
  pratiquesDesc: string;
  values: ValueCard[];
  timeline: TimelineItem[];
  bureau: BureauMember[];
}

const AdminAbout = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [aboutId, setAboutId] = useState<number | null>(null);

  // Header
  const [heroImage, setHeroImage] = useState("");
  const [heroTitle1, setHeroTitle1] = useState("Fédération Tunisienne de Danse");
  const [heroTitle2, setHeroTitle2] = useState("Sportive et Artistique");
  const [heroDesc, setHeroDesc] = useState("La FTDAP regroupe l'ensemble des disciplines de danse en Tunisie depuis 1989.");

  // Pratiques
  const [pratiquesImage, setPratiquesImage] = useState("");
  const [pratiquesTitle1, setPratiquesTitle1] = useState("Nos Disciplines");
  const [pratiquesTitle2, setPratiquesTitle2] = useState("Pratiquées");
  const [pratiquesDesc, setPratiquesDesc] = useState("Découvrez la richesse des disciplines de danse encadrées par la fédération.");

  // Mission / Vision / Valeurs
  const [values, setValues] = useState<ValueCard[]>([
    { id: "1", title: "Mission", desc: "Promouvoir et développer la danse sportive et artistique en Tunisie.", icon: "Target" },
    { id: "2", title: "Vision", desc: "Faire de la Tunisie une référence régionale en danse sportive.", icon: "Eye" },
    { id: "3", title: "Objectifs", desc: "Former, encadrer et organiser les compétitions nationales et internationales.", icon: "Flag" },
  ]);

  // Timeline
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { id: "1", year: "1989", title: "Création", desc: "Fondation officielle de la fédération." },
    { id: "2", year: "2008–2020", title: "Évolution", desc: "Expansion des disciplines et structuration nationale." },
    { id: "3", year: "2020–2024", title: "Moments forts", desc: "Participations internationales et nouveaux championnats." },
  ]);

  // Bureau
  const [bureau, setBureau] = useState<BureauMember[]>([
    { id: "1", name: "Mohamed Ben Salah", role: "Président", date: "Depuis 2020", photo: "" },
    { id: "2", name: "Leila Trabelsi", role: "Vice-Présidente", date: "Depuis 2021", photo: "" },
    { id: "3", name: "Karim Jouini", role: "Secrétaire Général", date: "Depuis 2020", photo: "" },
    { id: "4", name: "Sami Bouazizi", role: "Trésorier", date: "Depuis 2022", photo: "" },
    { id: "5", name: "Ahmed Hamdi", role: "Directeur Technique", date: "Depuis 2021", photo: "" },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await adminListContent("about");
        const first = rows[0] as ContentItem & AboutPayload;
        if (!first) return;
        setAboutId(first.id);
        if (first.heroImage !== undefined) setHeroImage(first.heroImage);
        if (first.heroTitle1) setHeroTitle1(first.heroTitle1);
        if (first.heroTitle2) setHeroTitle2(first.heroTitle2);
        if (first.heroDesc) setHeroDesc(first.heroDesc);
        if (first.pratiquesImage !== undefined) setPratiquesImage(first.pratiquesImage);
        if (first.pratiquesTitle1) setPratiquesTitle1(first.pratiquesTitle1);
        if (first.pratiquesTitle2) setPratiquesTitle2(first.pratiquesTitle2);
        if (first.pratiquesDesc) setPratiquesDesc(first.pratiquesDesc);
        if (Array.isArray(first.values)) setValues(first.values);
        if (Array.isArray(first.timeline)) setTimeline(first.timeline);
        if (Array.isArray(first.bureau)) setBureau(first.bureau);
      } catch {
        /* first save will create the row */
      }
    };
    void load();
  }, []);

  const updateValue = <K extends keyof ValueCard>(id: string, field: K, val: ValueCard[K]) =>
    setValues((p) => p.map((v) => (v.id === id ? { ...v, [field]: val } : v)));

  const updateTimeline = (id: string, field: keyof TimelineItem, val: string) =>
    setTimeline((p) => p.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  const addTimeline = () =>
    setTimeline((p) => [...p, { id: Date.now().toString(), year: "", title: "", desc: "" }]);
  const removeTimeline = (id: string) => setTimeline((p) => p.filter((t) => t.id !== id));

  const updateBureau = (id: string, field: keyof BureauMember, val: string) =>
    setBureau((p) => p.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  const addBureau = () =>
    setBureau((p) => [...p, { id: Date.now().toString(), name: "", role: "", date: "", photo: "" }]);
  const removeBureau = (id: string) => setBureau((p) => p.filter((m) => m.id !== id));

  const handleSave = async () => {
    const payload: AboutPayload = {
      heroImage, heroTitle1, heroTitle2, heroDesc,
      pratiquesImage, pratiquesTitle1, pratiquesTitle2, pratiquesDesc,
      values, timeline, bureau,
    };
    try {
      setSaving(true);
      const saved = aboutId
        ? await adminUpdateContent("about", aboutId, { ...payload })
        : await adminCreateContent("about", { ...payload });
      setAboutId(saved.id);
      toast({
        title: "Modifications enregistrées",
        description: "La page À propos est mise à jour sur le site.",
      });
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Page À Propos"
        description="Modifiez le contenu, les images et les sections de la page institutionnelle"
        stats={[
          { label: "Sections", value: 4 },
          { label: "Membres bureau", value: bureau.length, color: "text-violet-600" },
          { label: "Évènements timeline", value: timeline.length, color: "text-amber-600" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/about" target="_blank"><Eye className="h-4 w-4 mr-2" /> Aperçu</Link>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </>
        }
      />

      <Tabs defaultValue="header" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="header">En-tête</TabsTrigger>
          <TabsTrigger value="values">Mission / Vision</TabsTrigger>
          <TabsTrigger value="timeline">Historique</TabsTrigger>
          <TabsTrigger value="bureau">Bureau fédéral</TabsTrigger>
        </TabsList>

        {/* ===== HEADER ===== */}
        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Bandeau d'introduction</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <ImageUploadField value={heroImage} onChange={setHeroImage} label="Image principale" />
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Titre (1ère partie)</Label>
                  <Input value={heroTitle1} onChange={(e) => setHeroTitle1(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Titre (2ème partie, en italique)</Label>
                  <Input value={heroTitle2} onChange={(e) => setHeroTitle2(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea rows={5} value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Section "Disciplines pratiquées"</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <ImageUploadField value={pratiquesImage} onChange={setPratiquesImage} label="Image" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Titre 1</Label>
                    <Input value={pratiquesTitle1} onChange={(e) => setPratiquesTitle1(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Titre 2 (italique)</Label>
                    <Input value={pratiquesTitle2} onChange={(e) => setPratiquesTitle2(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea rows={5} value={pratiquesDesc} onChange={(e) => setPratiquesDesc(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== VALUES ===== */}
        <TabsContent value="values" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {values.map((v) => (
              <Card key={v.id}>
                <CardContent className="p-4 space-y-3">
                  <IconPicker
                    value={v.icon}
                    onChange={(val) => updateValue(v.id, "icon", val)}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Titre</Label>
                    <Input
                      value={v.title}
                      onChange={(e) => updateValue(v.id, "title", e.target.value)}
                      className="font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      rows={5}
                      value={v.desc}
                      onChange={(e) => updateValue(v.id, "desc", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== TIMELINE ===== */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={addTimeline}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter une étape
            </Button>
          </div>
          <div className="space-y-3">
            {timeline.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-[120px_1fr_2fr_auto] gap-3 items-start">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Année</Label>
                      <Input value={item.year} onChange={(e) => updateTimeline(item.id, "year", e.target.value)} placeholder="2024" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Titre</Label>
                      <Input value={item.title} onChange={(e) => updateTimeline(item.id, "title", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea rows={2} value={item.desc} onChange={(e) => updateTimeline(item.id, "desc", e.target.value)} />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeline(item.id)}
                      className="text-destructive mt-6"
                      disabled={timeline.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== BUREAU ===== */}
        <TabsContent value="bureau" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={addBureau}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter un membre
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bureau.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4 space-y-3">
                  <ImageUploadField
                    value={m.photo}
                    onChange={(v) => updateBureau(m.id, "photo", v)}
                    label="Photo"
                    ratio="aspect-square"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nom complet</Label>
                    <Input value={m.name} onChange={(e) => updateBureau(m.id, "name", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Rôle</Label>
                    <Input value={m.role} onChange={(e) => updateBureau(m.id, "role", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date / Mandat</Label>
                    <Input value={m.date} onChange={(e) => updateBureau(m.id, "date", e.target.value)} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBureau(m.id)}
                    className="w-full text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAbout;
