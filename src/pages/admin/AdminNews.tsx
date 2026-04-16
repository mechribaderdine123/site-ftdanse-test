import { useState } from "react";
import { newsData, type NewsItem } from "@/data/newsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminNews = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<NewsItem[]>([...newsData]);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const filtered = items.filter((n) =>
    n.titleKey.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Actualité supprimée", description: "L'article a été supprimé avec succès." });
  };

  const handleEdit = (item: NewsItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    setDialogOpen(false);
    toast({ title: editItem ? "Actualité modifiée" : "Actualité créée", description: "Les changements ont été enregistrés." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Actualités</h2>
          <p className="text-muted-foreground">{items.length} articles au total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input placeholder="Titre de l'article" defaultValue={editItem?.titleKey || ""} />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select defaultValue={editItem?.category || "event"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competition">Compétition</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" defaultValue="" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Description de l'article" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea placeholder="Contenu complet de l'article" rows={5} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{item.titleKey}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.category === "competition" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {item.category === "competition" ? "Compétition" : "Événement"}
                    </span>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
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
