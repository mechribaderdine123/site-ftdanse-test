import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, X, Upload, ImageIcon, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  adminListContent, adminCreateContent, adminUpdateContent, adminDeleteContent,
  uploadMediaFile, contentUrl, type ContentItem,
} from "@/lib/contentApi";

type Status = "open" | "closed" | "upcoming";

interface AttachedDoc {
  name: string;
  type: string;
  size: string;
  url?: string;
}

interface ProgrammeItem {
  id: string;
  time: string;
  title: string;
  detail: string;
}

interface Participant {
  id: string;
  name: string;
  club: string;
  category: string;
}

interface ResultRow {
  id: string;
  position: string;
  athlete: string;
  club: string;
  score: string;
}

interface EditableCompetition extends ContentItem {
  title: string;
  type: string;
  status: Status;
  dateStart: string;
  dateEnd: string;
  location: string;
  athletesLabel: string;
  disciplines: string[];
  description: string;
  heroImage: string;
  galleryImages: string[];
  documents: AttachedDoc[];
  programme: ProgrammeItem[];
  participants: Participant[];
  results: ResultRow[];
}

const statusLabels: Record<Status, { label: string; cls: string }> = {
  upcoming: { label: "À venir", cls: "bg-yellow-100 text-yellow-700" },
  open: { label: "Inscriptions ouvertes", cls: "bg-blue-100 text-blue-700" },
  closed: { label: "Inscriptions clôturées", cls: "bg-green-100 text-green-700" },
};

const TYPES = ["Championnat National", "Coupe de Tunisie", "Battle", "Gala", "Open International", "Festival"];
const DISCIPLINES = ["Classique", "Contemporain", "Hip-Hop", "Jazz", "Breaking", "Freestyle", "Salsa", "Bachata", "Ballet"];

const emptyComp = (): EditableCompetition => ({
  id: 0,
  title: "",
  type: TYPES[0],
  status: "upcoming",
  dateStart: "",
  dateEnd: "",
  location: "",
  athletesLabel: "",
  disciplines: [],
  description: "",
  heroImage: "",
  galleryImages: [],
  documents: [],
  programme: [],
  participants: [],
  results: [],
});

const toEditable = (raw: ContentItem): EditableCompetition => ({
  id: raw.id,
  title: (raw.title as string) || "",
  type: (raw.type as string) || TYPES[0],
  status: (raw.status as Status) || "upcoming",
  dateStart: (raw.dateStart as string) || "",
  dateEnd: (raw.dateEnd as string) || "",
  location: (raw.location as string) || "",
  athletesLabel: (raw.athletesLabel as string) || "",
  disciplines: (raw.disciplines as string[]) || [],
  description: (raw.description as string) || "",
  heroImage: (raw.heroImage as string) || "",
  galleryImages: ((raw.galleryImages as string[]) || []).map(contentUrl),
  documents: (raw.documents as AttachedDoc[]) || [],
  programme: (raw.programme as ProgrammeItem[]) || [],
  participants: (raw.participants as Participant[]) || [],
  results: (raw.results as ResultRow[]) || [],
});

const AdminCompetitions = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<EditableCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<EditableCompetition>(emptyComp());
  const [isNew, setIsNew] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListContent("competitions");
      setItems(data.map(toEditable));
    } catch (error) {
      toast({ title: "Chargement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = items.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => {
    setDraft(emptyComp());
    setIsNew(true);
    setDialogOpen(true);
  };
  const openEdit = (c: EditableCompetition) => {
    setDraft(JSON.parse(JSON.stringify(c)));
    setIsNew(false);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteContent("competitions", id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Compétition supprimée" });
    } catch (error) {
      toast({ title: "Suppression impossible", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      toast({ title: "Le titre est requis", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const payload = { ...draft, id: undefined };
      const saved = isNew
        ? await adminCreateContent("competitions", payload)
        : await adminUpdateContent("competitions", draft.id, payload);
      setItems((prev) => (isNew ? [toEditable(saved), ...prev] : prev.map((c) => (c.id === saved.id ? toEditable(saved) : c))));
      setDialogOpen(false);
      toast({ title: isNew ? "Compétition créée" : "Compétition modifiée", description: "Publiée sur le site." });
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof EditableCompetition>(k: K, v: EditableCompetition[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const toggleDiscipline = (d: string) => {
    setDraft((dr) => ({
      ...dr,
      disciplines: dr.disciplines.includes(d) ? dr.disciplines.filter((x) => x !== d) : [...dr.disciplines, d],
    }));
  };

  // Gallery
  const addGalleryFiles = async (files: FileList | null) => {
    if (!files) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadMediaFile(file);
      if (url) urls.push(url);
    }
    update("galleryImages", [...draft.galleryImages, ...urls]);
  };
  const removeGallery = (i: number) => update("galleryImages", draft.galleryImages.filter((_, idx) => idx !== i));

  // Documents
  const addDocs = (files: FileList | null) => {
    if (!files) return;
    const docs: AttachedDoc[] = Array.from(files).map((f) => ({
      name: f.name,
      type: f.type || f.name.split(".").pop() || "file",
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    update("documents", [...draft.documents, ...docs]);
  };
  const removeDoc = (i: number) => update("documents", draft.documents.filter((_, idx) => idx !== i));

  // Programme
  const addProg = () => update("programme", [...draft.programme, { id: `p${Date.now()}`, time: "", title: "", detail: "" }]);
  const updateProg = (id: string, k: keyof ProgrammeItem, v: string) =>
    update("programme", draft.programme.map((p) => (p.id === id ? { ...p, [k]: v } : p)));
  const removeProg = (id: string) => update("programme", draft.programme.filter((p) => p.id !== id));

  // Participants
  const addPart = () => update("participants", [...draft.participants, { id: `pt${Date.now()}`, name: "", club: "", category: "" }]);
  const updatePart = (id: string, k: keyof Participant, v: string) =>
    update("participants", draft.participants.map((p) => (p.id === id ? { ...p, [k]: v } : p)));
  const removePart = (id: string) => update("participants", draft.participants.filter((p) => p.id !== id));

  // Results
  const addRes = () => update("results", [...draft.results, { id: `r${Date.now()}`, position: "", athlete: "", club: "", score: "" }]);
  const updateRes = (id: string, k: keyof ResultRow, v: string) =>
    update("results", draft.results.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const removeRes = (id: string) => update("results", draft.results.filter((r) => r.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Compétitions"
        description="Gérez les compétitions affichées sur le site (page liste et page détail)"
        stats={[
          { label: "Total", value: items.length },
          { label: "À venir", value: items.filter((i) => i.status === "upcoming").length, color: "text-yellow-600" },
          { label: "Ouvertes", value: items.filter((i) => i.status === "open").length, color: "text-blue-600" },
          { label: "Clôturées", value: items.filter((i) => i.status === "closed").length, color: "text-green-600" },
        ]}
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle compétition
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Nouvelle compétition" : "Modifier la compétition"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-2">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="programme">Programme</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="results">Résultats</TabsTrigger>
            </TabsList>

            {/* GENERAL */}
            <TabsContent value="general" className="space-y-4 pt-4">
              <ImageUploadField value={draft.heroImage} onChange={(v) => update("heroImage", v)} label="Image principale (bannière)" />

              <div className="space-y-2">
                <Label>Titre</Label>
                <Input value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex: Championnat National 2026" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={draft.type} onValueChange={(v) => update("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={draft.status} onValueChange={(v: Status) => update("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">À venir</SelectItem>
                      <SelectItem value="open">Inscriptions ouvertes</SelectItem>
                      <SelectItem value="closed">Inscriptions clôturées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input type="date" value={draft.dateStart} onChange={(e) => update("dateStart", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Input type="date" value={draft.dateEnd} onChange={(e) => update("dateEnd", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input value={draft.location} onChange={(e) => update("location", e.target.value)} placeholder="Ex: Tunis" />
                </div>
                <div className="space-y-2">
                  <Label>Athlètes attendus (libellé)</Label>
                  <Input value={draft.athletesLabel} onChange={(e) => update("athletesLabel", e.target.value)} placeholder="Ex: 200+" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Disciplines</Label>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map((d) => {
                    const on = draft.disciplines.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* DESCRIPTION + GALLERY */}
            <TabsContent value="description" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Description (séparer les paragraphes par une ligne vide)</Label>
                <Textarea
                  rows={8}
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Présentez la compétition, son contexte, ses enjeux..."
                />
              </div>

              <div className="space-y-2">
                <Label>Galerie photo</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {draft.galleryImages.map((g, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                      <img src={contentUrl(g)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGallery(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-muted">
                    <Upload className="w-5 h-5 mb-1" />
                    Ajouter
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void addGalleryFiles(e.target.files); e.target.value = ""; }} />
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* PROGRAMME */}
            <TabsContent value="programme" className="space-y-3 pt-4">
              {draft.programme.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-start border border-border rounded-lg p-3">
                  <Input className="col-span-2" placeholder="Heure" value={p.time} onChange={(e) => updateProg(p.id, "time", e.target.value)} />
                  <Input className="col-span-4" placeholder="Titre" value={p.title} onChange={(e) => updateProg(p.id, "title", e.target.value)} />
                  <Input className="col-span-5" placeholder="Détail / Lieu" value={p.detail} onChange={(e) => updateProg(p.id, "detail", e.target.value)} />
                  <Button variant="ghost" size="icon" className="col-span-1 text-destructive" onClick={() => removeProg(p.id)}>
                    <Trash2 className="w-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addProg}>
                <Plus className="w-4 h-4 mr-1" /> Ajouter un créneau
              </Button>
            </TabsContent>

            {/* DOCS */}
            <TabsContent value="docs" className="space-y-3 pt-4">
              <label className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted w-fit">
                <Upload className="w-4 h-4" /> Joindre des documents (PDF, Word...)
                <input type="file" multiple className="hidden" onChange={(e) => addDocs(e.target.files)} />
              </label>
              <div className="space-y-2">
                {draft.documents.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.type} · {d.size}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeDoc(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {draft.documents.length === 0 && <p className="text-xs text-muted-foreground">Aucun document</p>}
              </div>
            </TabsContent>

            {/* PARTICIPANTS */}
            <TabsContent value="participants" className="space-y-3 pt-4">
              {draft.participants.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-start border border-border rounded-lg p-3">
                  <Input className="col-span-4" placeholder="Nom" value={p.name} onChange={(e) => updatePart(p.id, "name", e.target.value)} />
                  <Input className="col-span-4" placeholder="Club" value={p.club} onChange={(e) => updatePart(p.id, "club", e.target.value)} />
                  <Input className="col-span-3" placeholder="Catégorie" value={p.category} onChange={(e) => updatePart(p.id, "category", e.target.value)} />
                  <Button variant="ghost" size="icon" className="col-span-1 text-destructive" onClick={() => removePart(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addPart}>
                <Plus className="w-4 h-4 mr-1" /> Ajouter un participant
              </Button>
            </TabsContent>

            {/* RESULTS */}
            <TabsContent value="results" className="space-y-3 pt-4">
              {draft.results.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 items-start border border-border rounded-lg p-3">
                  <Input className="col-span-2" placeholder="Position" value={r.position} onChange={(e) => updateRes(r.id, "position", e.target.value)} />
                  <Input className="col-span-4" placeholder="Athlète" value={r.athlete} onChange={(e) => updateRes(r.id, "athlete", e.target.value)} />
                  <Input className="col-span-3" placeholder="Club" value={r.club} onChange={(e) => updateRes(r.id, "club", e.target.value)} />
                  <Input className="col-span-2" placeholder="Score" value={r.score} onChange={(e) => updateRes(r.id, "score", e.target.value)} />
                  <Button variant="ghost" size="icon" className="col-span-1 text-destructive" onClick={() => removeRes(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addRes}>
                <Plus className="w-4 h-4 mr-1" /> Ajouter un résultat
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Médias</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-14 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                          {item.heroImage ? (
                            <img src={contentUrl(item.heroImage)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.type}</TableCell>
                      <TableCell className="text-xs">{item.dateStart} → {item.dateEnd}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[item.status].cls}`}>
                          {statusLabels[item.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.galleryImages.length} 📷 · {item.documents.length} 📄
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun résultat</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompetitions;
