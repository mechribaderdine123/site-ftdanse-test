import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, X, Save, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { disciplinesData, type DisciplineItem } from "@/data/disciplinesData";

const AdminDisciplines = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<DisciplineItem[]>(disciplinesData);
  const [editing, setEditing] = useState<DisciplineItem | null>(null);
  const [open, setOpen] = useState(false);
  const heroRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const blank = (): DisciplineItem => ({
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
    setOpen(true);
  };

  const openEdit = (d: DisciplineItem) => {
    setEditing({ ...d, characteristics: [...(d.characteristics || [])], gallery: [...d.gallery] });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name || !editing.slug) {
      toast({ title: "Champs requis", description: "Nom et identifiant sont requis", variant: "destructive" });
      return;
    }
    const exists = items.some((i) => i.slug === editing.slug);
    setItems((prev) =>
      exists ? prev.map((i) => (i.slug === editing.slug ? editing : i)) : [...prev, editing]
    );
    setOpen(false);
    toast({ title: "Enregistré", description: `${editing.name} mis à jour` });
  };

  const remove = (slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
    toast({ title: "Supprimé" });
  };

  const onHero = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && editing) setEditing({ ...editing, image: URL.createObjectURL(f) });
  };

  const onGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!editing) return;
    const urls = files.map((f) => URL.createObjectURL(f));
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
          <Card key={d.slug} className="overflow-hidden">
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
                <Button size="sm" variant="ghost" onClick={() => remove(d.slug)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing && items.some((i) => i.slug === editing.slug) ? "Modifier le style" : "Nouveau style"}
            </DialogTitle>
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
                  <input ref={heroRef} type="file" accept="image/*" hidden onChange={onHero} />
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
                <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={onGallery} />
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
            <Button onClick={save}>
              <Save className="w-4 h-4 mr-2" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDisciplines;