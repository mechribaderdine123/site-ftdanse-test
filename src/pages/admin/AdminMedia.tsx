import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, ImageIcon, Video, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";

import gallery1 from "@/assets/gallery1.jpg";
import gallery2 from "@/assets/gallery2.jpg";
import gallery3 from "@/assets/gallery3.jpg";
import gallery4 from "@/assets/gallery4.jpg";
import gallery5 from "@/assets/gallery5.jpg";
import gallery6 from "@/assets/gallery6.jpg";

interface MediaItem {
  id: number;
  type: "photo" | "video";
  title: string;
  src: string;
  event: string;
  date: string;
}

const initialMedia: MediaItem[] = [
  { id: 1, type: "photo", title: "Championnat National - Photo 1", src: gallery1, event: "Championnat National", date: "2025-03-15" },
  { id: 2, type: "photo", title: "Championnat National - Photo 2", src: gallery2, event: "Championnat National", date: "2025-03-15" },
  { id: 3, type: "photo", title: "Coupe de Tunisie - Photo 1", src: gallery3, event: "Coupe de Tunisie", date: "2025-01-20" },
  { id: 4, type: "photo", title: "Festival de Danse - Photo 1", src: gallery4, event: "Festival de Danse", date: "2025-02-28" },
  { id: 5, type: "photo", title: "Festival de Danse - Photo 2", src: gallery5, event: "Festival de Danse", date: "2025-02-28" },
  { id: 6, type: "photo", title: "Open International - Photo 1", src: gallery6, event: "Open International", date: "2025-06-10" },
  { id: 7, type: "video", title: "Finale Breakdance", src: "https://www.youtube.com/embed/dQw4w9WgXcQ", event: "Championnat National", date: "2025-03-15" },
];

const AdminMedia = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const { toast } = useToast();

  const filtered = items.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.event.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || m.type === filter;
    return matchSearch && matchType;
  });

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Média supprimé" });
  };

  const handleSave = () => {
    setDialogOpen(false);
    toast({ title: "Média ajouté" });
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
            <div className="space-y-2"><Label>Titre</Label><Input placeholder="Titre du média" /></div>
            <div className="space-y-2"><Label>Type</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><ImageIcon className="mr-1 h-4 w-4" /> Photo</Button>
                <Button variant="outline" size="sm"><Video className="mr-1 h-4 w-4" /> Vidéo</Button>
              </div>
            </div>
            <div className="space-y-2"><Label>Événement</Label><Input placeholder="Nom de l'événement" /></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Glissez vos fichiers ici ou cliquez pour parcourir</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
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
    </div>
  );
};

export default AdminMedia;
