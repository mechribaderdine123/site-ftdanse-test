import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";

interface Competition {
  id: number;
  title: string;
  date: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed";
  disciplines: string[];
  athletes: number;
}

const initialData: Competition[] = [
  { id: 1, title: "Championnat National 2025", date: "2025-03-15", location: "Tunis", status: "upcoming", disciplines: ["Breakdance", "Hip-Hop"], athletes: 120 },
  { id: 2, title: "Coupe de Tunisie", date: "2025-01-20", location: "Sousse", status: "completed", disciplines: ["Salsa", "Bachata"], athletes: 80 },
  { id: 3, title: "Open International", date: "2025-06-10", location: "Hammamet", status: "upcoming", disciplines: ["Contemporary"], athletes: 200 },
  { id: 4, title: "Festival de Danse", date: "2025-02-28", location: "Sfax", status: "ongoing", disciplines: ["Ballet", "Jazz"], athletes: 150 },
];

const statusLabels: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "À venir", cls: "bg-blue-100 text-blue-700" },
  ongoing: { label: "En cours", cls: "bg-amber-100 text-amber-700" },
  completed: { label: "Terminée", cls: "bg-green-100 text-green-700" },
};

const AdminCompetitions = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Competition[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Competition | null>(null);
  const { toast } = useToast();

  const filtered = items.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Compétition supprimée" });
  };

  const handleSave = () => {
    setDialogOpen(false);
    toast({ title: editItem ? "Compétition modifiée" : "Compétition créée" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Compétitions"
        description="Planifiez et organisez les événements de la fédération"
        stats={[
          { label: "Total", value: items.length },
          { label: "À venir", value: items.filter(i => i.status === "upcoming").length, color: "text-blue-600" },
          { label: "En cours", value: items.filter(i => i.status === "ongoing").length, color: "text-amber-600" },
          { label: "Athlètes", value: items.reduce((s, i) => s + i.athletes, 0), color: "text-emerald-600" },
        ]}
        actions={
          <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle compétition
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Modifier la compétition" : "Nouvelle compétition"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Titre</Label><Input defaultValue={editItem?.title || ""} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={editItem?.date || ""} /></div>
              <div className="space-y-2"><Label>Lieu</Label><Input defaultValue={editItem?.location || ""} /></div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select defaultValue={editItem?.status || "upcoming"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="ongoing">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Nombre d'athlètes</Label><Input type="number" defaultValue={editItem?.athletes || 0} /></div>
            <div className="space-y-2"><Label>Disciplines (séparées par des virgules)</Label><Input defaultValue={editItem?.disciplines.join(", ") || ""} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Athlètes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[item.status].cls}`}>
                      {statusLabels[item.status].label}
                    </span>
                  </TableCell>
                  <TableCell>{item.athletes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditItem(item); setDialogOpen(true); }}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompetitions;
