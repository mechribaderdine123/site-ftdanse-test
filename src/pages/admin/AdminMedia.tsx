import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, ImageIcon, Video, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListContent, adminCreateContent, adminDeleteContent,
  uploadMediaFiles, contentUrl, type ContentItem,
} from "@/lib/contentApi";

interface MediaItem extends ContentItem {
  type: "photo" | "video";
  title: string;
  src: string;
  event: string;
  date: string;
}

const AdminMedia = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [form, setForm] = useState({ type: "photo" as "photo" | "video", title: "", src: "", event: "", date: "" });
  const { toast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListContent("media");
      setItems(data.map((raw) => ({
        ...(raw as unknown as MediaItem),
        src: contentUrl((raw.src as string) || ""),
      })));
    } catch (error) {
      toast({ title: "Chargement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = items.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.event.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || m.type === filter;
    return matchSearch && matchType;
  });

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteContent("media", id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Média supprimé" });
    } catch (error) {
      toast({ title: "Suppression impossible", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      const urls = await uploadMediaFiles(Array.from(files));
      if (urls.length) setForm((f) => ({ ...f, src: urls[0] }));
    } catch {
      toast({ title: "Téléversement impossible", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.src) {
      toast({ title: "Titre et fichier requis", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const saved = await adminCreateContent("media", { ...form });
      setItems((prev) => [{ ...(saved as unknown as MediaItem), src: contentUrl(saved.src as string) }, ...prev]);
      setDialogOpen(false);
      setForm({ type: "photo", title: "", src: "", event: "", date: "" });
      toast({ title: "Média ajouté", description: "Publié dans la médiathèque." });
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const photos = filtered.filter((m) => m.type === "photo");
  const videos = filtered.filter((m) => m.type === "video");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de la Médiathèque"
        description="Photos et vidéos des événements de la fédération"
        stats={[
          { label: "Total médias", value: items.length },
          { label: "Photos", value: items.filter(i => i.type === "photo").length, color: "text-pink-600" },
          { label: "Vidéos", value: items.filter(i => i.type === "video").length, color: "text-blue-600" },
          { label: "Événements", value: new Set(items.map(i => i.event)).size, color: "text-emerald-600" },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Ajouter un média
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Ajouter un média</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du média" />
            </div>
            <div className="space-y-2"><Label>Type</Label>
              <div className="flex gap-2">
                <Button variant={form.type === "photo" ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, type: "photo" })}>
                  <ImageIcon className="mr-1 h-4 w-4" /> Photo
                </Button>
                <Button variant={form.type === "video" ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, type: "video" })}>
                  <Video className="mr-1 h-4 w-4" /> Vidéo (URL embed)
                </Button>
              </div>
            </div>
            {form.type === "video" ? (
              <div className="space-y-2">
                <Label>URL de la vidéo (embed)</Label>
                <Input value={form.src} onChange={(e) => setForm({ ...form, src: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Fichier</Label>
                <label className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground cursor-pointer hover:bg-muted/50 block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }} />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{form.src ? "Fichier sélectionné — cliquez pour changer" : "Glissez vos fichiers ici ou cliquez pour parcourir"}</p>
                    </>
                  )}
                </label>
                {form.src && <img src={contentUrl(form.src)} alt="" className="w-full h-32 object-cover rounded-lg" />}
              </div>
            )}
            <div className="space-y-2">
              <Label>Événement</Label>
              <Input value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} placeholder="Nom de l'événement" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={saving || uploading}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1">
          {(["all", "photo", "video"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? "Tout" : f === "photo" ? "Photos" : "Vidéos"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {photos.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Photos ({photos.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden">
                      <img src={item.src} alt={item.title} className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <div className="flex-1">
                          <p className="text-white text-xs font-medium truncate">{item.title}</p>
                          <p className="text-white/70 text-xs">{item.event}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white h-8 w-8" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {videos.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Video className="h-5 w-5" /> Vidéos ({videos.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((item) => (
                    <div key={item.id} className="relative rounded-lg overflow-hidden border">
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.event} • {item.date}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Aucun média trouvé
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMedia;
