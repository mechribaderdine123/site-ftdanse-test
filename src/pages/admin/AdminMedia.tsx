import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Upload } from "lucide-react";

const mockMedia = [
  { id: 1, name: "Championnat National 2024", type: "album", count: 24, date: "Mars 2024" },
  { id: 2, name: "Open de Rabat — Photos", type: "album", count: 18, date: "Avril 2024" },
  { id: 3, name: "Stage International", type: "video", count: 3, date: "Fév 2024" },
  { id: 4, name: "Gala de Fin d'Année", type: "album", count: 42, date: "Déc 2023" },
];

export default function AdminMedia() {
  const [search, setSearch] = useState("");
  const filtered = mockMedia.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Médiathèque</h1>
          <p className="text-sm text-muted-foreground">Gérez les photos et vidéos</p>
        </div>
        <div className="flex gap-2 self-start">
          <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" /> Importer</Button>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nouvel album</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m) => (
          <Card key={m.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <span className="text-4xl">{m.type === "video" ? "🎬" : "📷"}</span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm truncate">{m.name}</h3>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{m.count} {m.type === "video" ? "vidéos" : "photos"}</span>
                <span>{m.date}</span>
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Aucun média trouvé</p>
      )}
    </div>
  );
}
