import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockCompetitions = [
  { id: 1, title: "Championnat National 2024", date: "15-16 Mars 2024", location: "Casablanca", status: "upcoming", disciplines: ["Standard", "Latin"] },
  { id: 2, title: "Open de Rabat", date: "20 Avril 2024", location: "Rabat", status: "open", disciplines: ["Latin"] },
  { id: 3, title: "Coupe du Maroc 2023", date: "10 Déc 2023", location: "Marrakech", status: "completed", disciplines: ["Standard", "10 Danses"] },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  upcoming: { label: "À venir", variant: "secondary" },
  open: { label: "Inscriptions ouvertes", variant: "default" },
  completed: { label: "Terminée", variant: "outline" },
};

export default function AdminCompetitions() {
  const [search, setSearch] = useState("");
  const filtered = mockCompetitions.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Compétitions</h1>
          <p className="text-sm text-muted-foreground">Gérez les compétitions et événements</p>
        </div>
        <Button className="gap-2 self-start"><Plus className="h-4 w-4" /> Nouvelle compétition</Button>
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
                <TableHead>Titre</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Disciplines</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell className="font-medium">{comp.title}</TableCell>
                  <TableCell className="text-muted-foreground">{comp.date}</TableCell>
                  <TableCell>{comp.location}</TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[comp.status]?.variant}>{statusLabels[comp.status]?.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{comp.disciplines.join(", ")}</TableCell>
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
