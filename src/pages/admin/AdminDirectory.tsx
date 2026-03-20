import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockMembers = [
  { id: 1, name: "Youssef Amrani", type: "dancer", club: "Club Casablanca", license: "active" },
  { id: 2, name: "Sara Benali", type: "dancer", club: "Club Rabat", license: "active" },
  { id: 3, name: "Mohamed Tazi", type: "coach", club: "Club Marrakech", license: "expired" },
  { id: 4, name: "Nadia Idrissi", type: "referee", club: "—", license: "active" },
  { id: 5, name: "Club Atlas Danse", type: "club", club: "Fès", license: "active" },
];

const typeLabels: Record<string, string> = {
  dancer: "Danseur", coach: "Entraîneur", referee: "Arbitre", club: "Club",
};

export default function AdminDirectory() {
  const [search, setSearch] = useState("");
  const filtered = mockMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Annuaire</h1>
          <p className="text-sm text-muted-foreground">Gérez les membres, clubs et licences</p>
        </div>
        <Button className="gap-2 self-start"><Plus className="h-4 w-4" /> Ajouter un membre</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Club / Ville</TableHead>
                <TableHead>Licence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[m.type] || m.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.club}</TableCell>
                  <TableCell>
                    <Badge variant={m.license === "active" ? "default" : "destructive"}>
                      {m.license === "active" ? "Active" : "Expirée"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
