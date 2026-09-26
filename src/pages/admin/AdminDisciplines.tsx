import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, X, Save, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListContent, adminCreateContent, adminUpdateContent, adminDeleteContent,
  uploadMediaFile, contentUrl, type ContentItem,
} from "@/lib/contentApi";

interface DisciplineItem extends ContentItem {
  slug: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  gallery: string[];
  origin?: string;
  characteristics?: string[];
}

const AdminDisciplines = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<DisciplineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<DisciplineItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [open, setOpen] = useState(false);
  const heroRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListContent("disciplines");
      setItems(data.map((raw) => ({
        ...(raw as unknown as DisciplineItem),
        image: contentUrl((raw.image as string) || ""),
        gallery: ((raw.gallery as string[]) || []).map(contentUrl),
      })));
    } catch (error) {
      toast({ title: "Chargement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const blank = (): DisciplineItem => ({
    id: 0,
    slug: "",
    name: "",
    shortDesc: "",
    longDesc: "",
    image: "",
    gallery: [],
    origin: "",
    characteristics: [],
  });

  const openNew = () => {
    setEditing(blank());
    setIsNew(true);
    setOpen(true);
  };

  const openEdit = (d: DisciplineItem) => {
    setEditing({ ...d, characteristics: [...(d.characteristics || [])], gallery: [...d.gallery] });
    setIsNew(false);
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.slug) {
      toast({ title: "Champs requis", description: "Nom et identifiant sont requis", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const payload = { ...editing, id: undefined };
      const saved = isNew
        ? await adminCreateContent("disciplines", payload)
        : await adminUpdateContent("disciplines", editing.id, payload);
      const mapped: DisciplineItem = {
        ...(saved as unknown as DisciplineItem),
        image: contentUrl((saved.image as string) || ""),
        gallery: ((saved.gallery as string[]) || []).map(contentUrl),
      };
      setItems((prev) =>
        isNew ? [...prev, mapped] : prev.map((i) => (i.id === mapped.id ? mapped : i))
      );
      setOpen(false);
      toast({ title: "Enregistré", description: `${editing.name} publié sur le site` });
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await adminDeleteContent("disciplines", id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Supprimé" });
    } catch (error) {
      toast({ title: "Suppression impossible", description: (error as Error).message, variant: "destructive" });
    }
  };

  const uploadHero = async (f: File | null) => {
    if (!f || !editing) return;
    const url = await uploadMediaFile(f);
    if (url) setEditing({ ...editing, image: url });
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files || !editing) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadMediaFile(file);
      if (url) urls.push(url);
    }
    setEditing({ ...editing, gallery: [...editing.gallery, ...urls] });
  };

  const removeGalleryImg = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, gallery: editing.gallery.filter((_, i) => i !== idx) });
  };

  const updateChar = (idx: number, val: string) => {
    if (!editing) return;
    const next = [...(editing.characteristics || [])];
    next[idx] = val;
    setEditing({ ...editing, characteristics: next });
  };
  const addChar = () => editing && setEditing({ ...editing, characteristics: [...(editing.characteristics || []), ""] });
  const removeChar = (idx: number) =>
    editing && setEditing({ ...editing, characteristics: (editing.characteristics || []).filter((_, i) => i !== idx) });

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Styles de Danse"
        description="Gérer les disciplines affichées sur le site (description, image, galerie)."
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un style
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {d.image ? (
                <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <Badge className="absolute top-2 left-2" variant="secondary">
                {d.gallery.length} 📷
              </Badge>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-xs text-muted-foreground">/{d.slug}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{d.shortDesc}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(d)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Modifier
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-10">Aucun style — ajoutez le premier.</p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Nouveau style" : "Modifier le style"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="gallery">Galerie</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nom du style</Label>
                    <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Identifiant URL (slug)</Label>
                    <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="ex: hiphop" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Origine</Label>
                  <Input value={editing.origin || ""} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Image principale</Label>
                  {editing.image && (
                    <img src={editing.image} alt="" className="w-full h-40 object-cover rounded-md border" />
                  )}
                  <input ref={heroRef} type="file" accept="image/*" hidden onChange={(e) => { void uploadHero(e.target.files?.[0] || null); e.target.value = ""; }} />
                  <Button type="button" variant="outline" size="sm" onClick={() => heroRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Uploader
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label>Description courte</Label>
                  <Textarea
                    rows={2}
                    value={editing.shortDesc}
                    onChange={(e) => setEditing({ ...editing, shortDesc: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description détaillée</Label>
                  <Textarea
                    rows={6}
                    value={editing.longDesc}
                    onChange={(e) => setEditing({ ...editing, longDesc: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Caractéristiques</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addChar}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
                    </Button>
                  </div>
                  {(editing.characteristics || []).map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={c} onChange={(e) => updateChar(i, e.target.value)} />
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeChar(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-4 pt-4">
                <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void uploadGallery(e.target.files); e.target.value = ""; }} />
                <Button type="button" variant="outline" onClick={() => galleryRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Ajouter des images
                </Button>
                <div className="grid grid-cols-3 gap-3">
                  {editing.gallery.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-full aspect-square object-cover rounded-md border" />
                      <button
                        onClick={() => removeGalleryImg(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {editing.gallery.length === 0 && (
                    <p className="col-span-3 text-sm text-muted-foreground text-center py-6">
                      Aucune image dans la galerie
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDisciplines;
