import { useState } from "react";
import {
  User, Building2, Users, FileText, Clock, Plus, Eye, Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClubMember, UploadedDoc } from "@/data/clubMembersStore";

export const DocumentsTabs = ({
  clubMembers,
}: {
  clubMembers: ClubMember[];
}) => {
  const [tab, setTab] = useState<"club" | "members">("club");
  const [q, setQ] = useState("");
  const [season, setSeason] = useState<string>("all");
  const [docsMember, setDocsMember] = useState<ClubMember | null>(null);

  const seasons = Array.from(
    new Set(clubMembers.map((m) => m.season).filter(Boolean) as string[])
  ).sort();

  const filtered = clubMembers.filter((m) => {
    const term = q.trim().toLowerCase();
    const matchTerm =
      !term ||
      m.fullName.toLowerCase().includes(term) ||
      m.id.toLowerCase().includes(term);
    const matchSeason = season === "all" || m.season === season;
    return matchTerm && matchSeason;
  });

  const clubDocs = [
    { name: "Statuts du club.pdf", status: "Validé" },
    { name: "Récépissé de dépôt.pdf", status: "Validé" },
    { name: "Liste des dirigeants.pdf", status: "Validé" },
    { name: "PV de l'AG.pdf", status: "En attente" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === "club" ? "default" : "outline"}
            onClick={() => setTab("club")}
            size="sm"
          >
            <Building2 className="w-4 h-4 mr-2" /> Documents du club
          </Button>
          <Button
            variant={tab === "members" ? "default" : "outline"}
            onClick={() => setTab("members")}
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" /> Documents des membres
          </Button>
        </div>

        {tab === "club" ? (
          <div className="space-y-2">
            {clubDocs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border border-border rounded-lg"
              >
                <FileText className="w-5 h-5 text-accent" />
                <span className="flex-1 text-sm font-medium">{doc.name}</span>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" /> {doc.status}
                </Badge>
                <Button variant="ghost" size="sm">Télécharger</Button>
              </div>
            ))}
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un document
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                placeholder="Rechercher par ID ou nom..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="md:max-w-sm"
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                <option value="all">Toutes les saisons</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Aucun membre trouvé.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Saison</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => {
                    const count = Object.values(m.documents).filter(Boolean).length;
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-xs">{m.id}</TableCell>
                        <TableCell className="font-medium">{m.fullName}</TableCell>
                        <TableCell>{m.season || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <FileText className="w-3 h-3" /> {count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocsMember(m)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Documents
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={!!docsMember} onOpenChange={(o) => !o && setDocsMember(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Documents — {docsMember?.fullName}{" "}
              <span className="text-xs font-mono text-muted-foreground">({docsMember?.id})</span>
            </DialogTitle>
          </DialogHeader>
          {docsMember && (
            <MemberDocsList member={docsMember} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Documents-only list with preview + print
const MemberDocsList = ({ member }: { member: ClubMember }) => {
  const entries: { key: string; label: string; doc?: UploadedDoc }[] = [
    { key: "cin", label: "CIN", doc: member.documents.cin },
    { key: "birthExtract", label: "Extrait de naissance", doc: member.documents.birthExtract },
    { key: "parentalAuth", label: "Autorisation parentale", doc: member.documents.parentalAuth },
    { key: "photo", label: "Photo", doc: member.documents.photo },
    { key: "receipt", label: "Reçu de paiement", doc: member.payment.receipt },
  ].filter((e) => e.doc);

  const printDoc = (doc: UploadedDoc) => {
    if (!doc.dataUrl) {
      window.alert("Aperçu indisponible pour ce document.");
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const isPdf = doc.dataUrl.startsWith("data:application/pdf");
    const html = isPdf
      ? `<html><body style="margin:0"><iframe src="${doc.dataUrl}" style="border:0;width:100vw;height:100vh"></iframe></body></html>`
      : `<html><head><title>${doc.name}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center"><img src="${doc.dataUrl}" style="max-width:100%;max-height:100vh" onload="setTimeout(()=>{window.focus();window.print();},200)"/></body></html>`;
    const d = iframe.contentWindow?.document;
    if (!d) return;
    d.open();
    d.write(html);
    d.close();
    if (isPdf) {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 400);
    }
    setTimeout(() => document.body.removeChild(iframe), 60000);
  };

  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        Aucun document fourni.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <div
          key={e.key}
          className="flex items-center gap-3 p-3 border border-border rounded-lg"
        >
          <FileText className="w-5 h-5 text-accent" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{e.label}</div>
            <div className="text-xs text-muted-foreground truncate">{e.doc?.name}</div>
          </div>
          {e.doc?.dataUrl && (
            <a
              href={e.doc.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline"
            >
              Aperçu
            </a>
          )}
          <Button size="sm" variant="outline" onClick={() => e.doc && printDoc(e.doc)}>
            <Printer className="w-4 h-4 mr-1" /> Imprimer
          </Button>
        </div>
      ))}
    </div>
  );
};
