import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Medal } from "lucide-react";

const mockResults = [
  { id: 1, competition: "Championnat National 2024", discipline: "Standard", winner: "Youssef & Sara", date: "16 Mars 2024" },
  { id: 2, competition: "Open de Rabat", discipline: "Latin", winner: "Karim & Nadia", date: "20 Avril 2024" },
  { id: 3, competition: "Coupe du Maroc 2023", discipline: "10 Danses", winner: "Omar & Fatima", date: "10 Déc 2023" },
];

export default function AdminResults() {
  const [search, setSearch] = useState("");
  const filtered = mockResults.filter((r) =>
    r.competition.toLowerCase().includes(search.toLowerCase()) ||
    r.winner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Résultats</h1>
          <p className="text-sm text-muted-foreground">Gérez les résultats des compétitions</p>
        </div>
        <Button className="gap-2 self-start"><Plus className="h-4 w-4" /> Ajouter un résultat</Button>
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
                <TableHead>Compétition</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Vainqueur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.competition}</TableCell>
                  <TableCell>{r.discipline}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Medal className="h-4 w-4 text-amber-500" /> {r.winner}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
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
