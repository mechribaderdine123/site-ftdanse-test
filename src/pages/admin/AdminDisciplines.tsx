import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockDisciplines = [
  { id: 1, name: "Standard", dances: "Valse, Tango, Quickstep, Foxtrot, Valse Viennoise", status: "active" },
  { id: 2, name: "Latin", dances: "Cha-cha, Samba, Rumba, Paso Doble, Jive", status: "active" },
  { id: 3, name: "10 Danses", dances: "Combinaison Standard + Latin", status: "active" },
  { id: 4, name: "Rock & Boogie", dances: "Rock'n'Roll, Boogie Woogie", status: "inactive" },
];

export default function AdminDisciplines() {
  const [search, setSearch] = useState("");
  const filtered = mockDisciplines.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Disciplines</h1>
          <p className="text-sm text-muted-foreground">Gérez les styles de danse</p>
        </div>
        <Button className="gap-2 self-start"><Plus className="h-4 w-4" /> Nouvelle discipline</Button>
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
                <TableHead>Discipline</TableHead>
                <TableHead>Danses</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{d.dances}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status === "active" ? "Active" : "Inactive"}</Badge>
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
