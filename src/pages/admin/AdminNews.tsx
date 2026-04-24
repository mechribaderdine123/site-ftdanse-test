import { useState, useRef } from "react";
import { newsData, type NewsItem } from "@/data/newsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, Upload, X, FileText, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";

interface AttachedDoc {
  name: string;
  type: string;
  size: string;
}

interface EditableNews {
  id: number;
  image: string;
  category: "competition" | "event";
  date: string;
  title: string;
  description: string;
  body: string;
  galleryImages: string[];
  documents: AttachedDoc[];
}

const toEditable = (n: NewsItem): EditableNews => ({
  id: n.id,
  image: n.image,
  category: n.category,
  date: n.date,
  title: n.titleKey,
  description: n.descKey,
  body: n.bodyKey,
  galleryImages: [...n.galleryImages],
  documents: [],
});

const emptyNews = (): EditableNews => ({
  id: Date.now(),
  image: "",
  category: "event",
  date: new Date().toISOString().slice(0, 10),
  title: "",
  description: "",
  body: "",
  galleryImages: [],
  documents: [],
});

// Single image picker
const ImageField = ({ value, onChange, label, ratio = "aspect-video" }: { value: string; onChange: (v: string) => void; label: string; ratio?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className={`relative ${ratio} w-full rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center`}>
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange("")} className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full">
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Upload className="h-8 w-8" />
            <span className="text-xs">Cliquer pour téléverser</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {value && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Remplacer l'image
        </Button>
      )}
    </div>
  );
};

const AdminNews = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<EditableNews[]>(newsData.map(toEditable));
  const [editItem, setEditItem] = useState<EditableNews | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = items.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Actualité supprimée", description: "L'article a été supprimé avec succès." });
  };

  const handleEdit = (item: EditableNews) => {
    setEditItem({ ...item, galleryImages: [...item.galleryImages], documents: [...item.documents] });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditItem(emptyNews());
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editItem) return;
    setItems((prev) => {
      const exists = prev.some((p) => p.id === editItem.id);
      return exists ? prev.map((p) => (p.id === editItem.id ? editItem : p)) : [editItem, ...prev];
    });
    setDialogOpen(false);
    toast({ title: "Enregistré", description: "Les changements ont été enregistrés." });
  };

  const update = <K extends keyof EditableNews>(key: K, val: EditableNews[K]) => {
    setEditItem((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const addGalleryImages = (files: FileList | null) => {
    if (!files || !editItem) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    update("galleryImages", [...editItem.galleryImages, ...urls]);
  };

  const removeGalleryImage = (idx: number) => {
    if (!editItem) return;
    update("galleryImages", editItem.galleryImages.filter((_, i) => i !== idx));
  };

  const addDocuments = (files: FileList | null) => {
    if (!files || !editItem) return;
    const newDocs: AttachedDoc[] = Array.from(files).map((f) => ({
      name: f.name,
      type: f.name.split(".").pop()?.toUpperCase() || "FILE",
      size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(f.size / 1024)} Ko`,
    }));
    update("documents", [...editItem.documents, ...newDocs]);
  };

  const removeDocument = (idx: number) => {
    if (!editItem) return;
    update("documents", editItem.documents.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Actualités"
        description="Créez, modifiez et publiez les articles du site"
        stats={[
          { label: "Articles", value: items.length },
          { label: "Compétitions", value: items.filter(i => i.category === "competition").length, color: "text-blue-600" },
          { label: "Événements", value: items.filter(i => i.category === "event").length, color: "text-emerald-600" },
          { label: "Ce mois", value: items.length },
        ]}
        actions={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Nouvel article
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem && items.some(i => i.id === editItem.id) ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <Tabs defaultValue="general" className="mt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="gallery">Galerie ({editItem.galleryImages.length})</TabsTrigger>
                <TabsTrigger value="docs">Documents ({editItem.documents.length})</TabsTrigger>
              </TabsList>

              {/* GENERAL */}
              <TabsContent value="general" className="space-y-4 pt-4">
                <ImageField value={editItem.image} onChange={(v) => update("image", v)} label="Image principale (héro)" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={editItem.category} onValueChange={(v) => update("category", v as "competition" | "event")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="competition">Compétition</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input value={editItem.date} onChange={(e) => update("date", e.target.value)} placeholder="ex: 23 Sept 2023" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input value={editItem.title} onChange={(e) => update("title", e.target.value)} placeholder="Titre de l'article" />
                </div>
              </TabsContent>

              {/* CONTENT */}
              <TabsContent value="content" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Description courte</Label>
                  <Textarea value={editItem.description} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="Résumé affiché sur les cartes" />
                </div>
                <div className="space-y-2">
                  <Label>Contenu complet</Label>
                  <Textarea value={editItem.body} onChange={(e) => update("body", e.target.value)} rows={10} placeholder="Texte de l'article (séparez les paragraphes par une ligne vide)" />
                </div>
              </TabsContent>

              {/* GALLERY */}
              <TabsContent value="gallery" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Images affichées sous le texte de l'article</p>
                  <Button type="button" size="sm" onClick={() => galleryInputRef.current?.click()}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter des images
                  </Button>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addGalleryImages(e.target.files); e.target.value = ""; }} />
                </div>
                {editItem.galleryImages.length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-lg py-12 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune image dans la galerie</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {editItem.galleryImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                        <img src={img} alt={`Galerie ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* DOCUMENTS */}
              <TabsContent value="docs" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Documents téléchargeables (PDF, Word, Excel...)</p>
                  <Button type="button" size="sm" onClick={() => docInputRef.current?.click()}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                  <input ref={docInputRef} type="file" multiple className="hidden" onChange={(e) => { addDocuments(e.target.files); e.target.value = ""; }} />
                </div>
                {editItem.documents.length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-lg py-12 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun document joint</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editItem.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 border border-border rounded-lg p-3">
                        <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} — {doc.size}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDocument(i)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Médias</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.category === "competition" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {item.category === "competition" ? "Compétition" : "Événement"}
                    </span>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {item.galleryImages.length}</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {item.documents.length}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun résultat trouvé</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNews;
