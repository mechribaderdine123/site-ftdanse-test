import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Medal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Result {
  id: number;
  event: string;
  date: string;
  participant: string;
  rank: number;
  discipline: string;
  points: number;
}

const initialResults: Result[] = [
  { id: 1, event: "Championnat National 2025", date: "2025-03-15", participant: "Ahmed Ben Ali", rank: 1, discipline: "Breakdance", points: 100 },
  { id: 2, event: "Championnat National 2025", date: "2025-03-15", participant: "Sami Trabelsi", rank: 2, discipline: "Breakdance", points: 85 },
  { id: 3, event: "Coupe de Tunisie", date: "2025-01-20", participant: "Yasmine Hamdi", rank: 1, discipline: "Salsa", points: 100 },
  { id: 4, event: "Coupe de Tunisie", date: "2025-01-20", participant: "Nour Souissi", rank: 3, discipline: "Salsa", points: 70 },
];

const rankBadge = (rank: number) => {
  const cls = rank === 1 ? "bg-yellow-100 text-yellow-800" : rank === 2 ? "bg-gray-100 text-gray-700" : rank === 3 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{rank}</span>;
};

const AdminResults = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Result[]>(initialResults);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Result | null>(null);
  const { toast } = useToast();

  const filtered = items.filter((r) =>
    r.event.toLowerCase().includes(search.toLowerCase()) ||
    r.participant.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Résultat supprimé" });
  };

  const handleSave = () => {
    setDialogOpen(false);
    toast({ title: editItem ? "Résultat modifié" : "Résultat ajouté" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Résultats</h2>
          <p className="text-muted-foreground">{items.length} résultats au total</p>
        </div>
        <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Modifier le résultat" : "Nouveau résultat"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Événement</Label><Input defaultValue={editItem?.event || ""} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={editItem?.date || ""} /></div>
              <div className="space-y-2"><Label>Discipline</Label><Input defaultValue={editItem?.discipline || ""} /></div>
            </div>
            <div className="space-y-2"><Label>Participant</Label><Input defaultValue={editItem?.participant || ""} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Classement</Label><Input type="number" min={1} defaultValue={editItem?.rank || 1} /></div>
              <div className="space-y-2"><Label>Points</Label><Input type="number" defaultValue={editItem?.points || 0} /></div>
            </div>
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
                <TableHead>Rang</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{rankBadge(item.rank)}</TableCell>
                  <TableCell className="font-medium">{item.participant}</TableCell>
                  <TableCell>{item.event}</TableCell>
                  <TableCell>{item.discipline}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.points}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditItem(item); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default AdminResults;
