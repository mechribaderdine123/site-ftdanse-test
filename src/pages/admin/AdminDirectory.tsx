import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";

interface DirectoryEntry {
  id: number;
  type: "member" | "club";
  name: string;
  city: string;
  discipline: string;
  role?: string;
  memberCount?: number;
  licenseActive: boolean;
}

const initialData: DirectoryEntry[] = [
  { id: 1, type: "member", name: "Ahmed Ben Ali", city: "Tunis", discipline: "Breakdance", role: "Danseur", licenseActive: true },
  { id: 2, type: "member", name: "Yasmine Hamdi", city: "Sousse", discipline: "Salsa", role: "Arbitre", licenseActive: true },
  { id: 3, type: "club", name: "Club Elite Dance", city: "Tunis", discipline: "Multi-disciplines", memberCount: 45, licenseActive: true },
  { id: 4, type: "member", name: "Sami Trabelsi", city: "Sfax", discipline: "Hip-Hop", role: "Coach", licenseActive: false },
  { id: 5, type: "club", name: "Dance Academy", city: "Hammamet", discipline: "Ballet, Jazz", memberCount: 30, licenseActive: true },
];

const AdminDirectory = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<DirectoryEntry[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<DirectoryEntry | null>(null);
  const { toast } = useToast();

  const filtered = items.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Entrée supprimée" });
  };

  const handleSave = () => {
    setDialogOpen(false);
    toast({ title: editItem ? "Entrée modifiée" : "Entrée créée" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de l'Annuaire"
        description="Membres, clubs et licences de la fédération"
        stats={[
          { label: "Total", value: items.length },
          { label: "Membres", value: items.filter(i => i.type === "member").length, color: "text-blue-600" },
          { label: "Clubs", value: items.filter(i => i.type === "club").length, color: "text-violet-600" },
          { label: "Licences actives", value: items.filter(i => i.licenseActive).length, color: "text-emerald-600" },
        ]}
        actions={
          <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle entrée
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Modifier l'entrée" : "Nouvelle entrée"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select defaultValue={editItem?.type || "member"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membre</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Nom</Label><Input defaultValue={editItem?.name || ""} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ville</Label><Input defaultValue={editItem?.city || ""} /></div>
              <div className="space-y-2"><Label>Discipline</Label><Input defaultValue={editItem?.discipline || ""} /></div>
            </div>
            <div className="space-y-2"><Label>Rôle / Nombre de membres</Label><Input defaultValue={editItem?.role || editItem?.memberCount?.toString() || ""} /></div>
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
                <TableHead>Type</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Rôle/Membres</TableHead>
                <TableHead>Licence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.type === "club" ? <Building2 className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.city}</TableCell>
                  <TableCell>{item.discipline}</TableCell>
                  <TableCell>{item.type === "club" ? `${item.memberCount} membres` : item.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.licenseActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.licenseActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
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

export default AdminDirectory;
