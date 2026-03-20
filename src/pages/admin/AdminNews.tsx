import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { newsData } from "@/data/newsData";

export default function AdminNews() {
  const [search, setSearch] = useState("");
  const filtered = newsData.filter((n) =>
    n.titleKey.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Actualités</h1>
          <p className="text-sm text-muted-foreground">Gérez les articles et événements</p>
        </div>
        <Button className="gap-2 self-start">
          <Plus className="h-4 w-4" /> Nouvel article
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {filtered.map((news) => (
                <TableRow key={news.id}>
                  <TableCell>
                    <img src={news.image} alt="" className="w-12 h-8 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{news.titleKey}</TableCell>
                  <TableCell>
                    <Badge variant={news.category === "competition" ? "default" : "secondary"}>
                      {news.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{news.date}</TableCell>
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
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun résultat</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
