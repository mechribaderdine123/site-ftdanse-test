import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockPartners = [
  { id: 1, name: "Ministère de la Jeunesse et du Sport", type: "institutional", website: "https://mjs.gov.ma", active: true },
  { id: 2, name: "WDSF", type: "federation", website: "https://wdsf.org", active: true },
  { id: 3, name: "DanceSport Maroc", type: "sponsor", website: "#", active: true },
  { id: 4, name: "Atlas Events", type: "sponsor", website: "#", active: false },
];

const typeLabels: Record<string, string> = {
  institutional: "Institutionnel", federation: "Fédération", sponsor: "Sponsor",
};

export default function AdminPartners() {
  const [search, setSearch] = useState("");
  const filtered = mockPartners.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Partenaires</h1>
          <p className="text-sm text-muted-foreground">Gérez les partenaires et sponsors</p>
        </div>
        <Button className="gap-2 self-start"><Plus className="h-4 w-4" /> Nouveau partenaire</Button>
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
                <TableHead>Site web</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline">{typeLabels[p.type]}</Badge></TableCell>
                  <TableCell>
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      Lien <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Actif" : "Inactif"}</Badge>
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
