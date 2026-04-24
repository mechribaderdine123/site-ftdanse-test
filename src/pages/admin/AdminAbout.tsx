import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, Plus, Save, ImageIcon, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import heroDanceImg from "@/assets/hero-dance.jpg";
import danceAboutImg from "@/assets/dance-about.jpg";
import { Link } from "react-router-dom";

/** Reusable image picker (mockup mode — uses object URL) */
const ImagePicker = ({
  value,
  onChange,
  label,
  ratio = "aspect-video",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  ratio?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    onChange(url);
  };
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className={`relative ${ratio} w-full rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted/30 group`}>
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 mb-2" />
            <span className="text-xs">Aucune image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Changer
          </Button>
          {value && (
            <Button size="sm" variant="destructive" onClick={() => onChange("")}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
};

interface TimelineItem { id: string; year: string; title: string; desc: string; }
interface BureauMember { id: string; name: string; role: string; date: string; photo: string; }
interface ValueCard { id: string; title: string; desc: string; }

const AdminAbout = () => {
  const { toast } = useToast();

  // Header
  const [heroImage, setHeroImage] = useState(heroDanceImg);
  const [heroTitle1, setHeroTitle1] = useState("Fédération Tunisienne de Danse");
  const [heroTitle2, setHeroTitle2] = useState("Sportive et Artistique");
  const [heroDesc, setHeroDesc] = useState("La FTDAP regroupe l'ensemble des disciplines de danse en Tunisie depuis 1989.");

  // Pratiques
  const [pratiquesImage, setPratiquesImage] = useState(danceAboutImg);
  const [pratiquesTitle1, setPratiquesTitle1] = useState("Nos Disciplines");
  const [pratiquesTitle2, setPratiquesTitle2] = useState("Pratiquées");
  const [pratiquesDesc, setPratiquesDesc] = useState("Découvrez la richesse des disciplines de danse encadrées par la fédération.");

  // Mission / Vision / Valeurs
  const [values, setValues] = useState<ValueCard[]>([
    { id: "1", title: "Mission", desc: "Promouvoir et développer la danse sportive et artistique en Tunisie." },
    { id: "2", title: "Vision", desc: "Faire de la Tunisie une référence régionale en danse sportive." },
    { id: "3", title: "Objectifs", desc: "Former, encadrer et organiser les compétitions nationales et internationales." },
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

  const updateValue = (id: string, field: keyof ValueCard, val: string) =>
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

  const handleSave = () => {
    toast({
      title: "Modifications enregistrées",
      description: "Mode maquette : les changements ne sont pas persistés en base.",
    });
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
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Enregistrer
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
              <ImagePicker value={heroImage} onChange={setHeroImage} label="Image principale" />
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
              <ImagePicker value={pratiquesImage} onChange={setPratiquesImage} label="Image" />
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
                <CardHeader className="pb-2">
                  <Input
                    value={v.title}
                    onChange={(e) => updateValue(v.id, "title", e.target.value)}
                    className="font-bold text-base"
                  />
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={6}
                    value={v.desc}
                    onChange={(e) => updateValue(v.id, "desc", e.target.value)}
                  />
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
            {timeline.map((item, i) => (
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
                  <ImagePicker
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