import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, MapPin, Trophy, Medal, Upload, FileText, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  adminListContent, adminCreateContent, adminUpdateContent, adminDeleteContent,
  type ContentItem,
} from "@/lib/contentApi";

interface Participant { rank: number; name: string; club: string; }
interface AttachedDoc { name: string; type: string; size: string; url?: string; }
interface EventResult extends ContentItem {
  eventName: string;
  date: string;
  place: string;
  type: "national" | "international" | "training";
  discipline: string;
  source: "competition" | "result";
  participants: Participant[];
  documents: AttachedDoc[];
}
interface RankingRow extends ContentItem {
  name: string; club: string; points: number; gold: number; silver: number; bronze: number;
}

const RANKING_KEY = "__ranking";

const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;

const AdminResults = () => {
  const [events, setEvents] = useState<EventResult[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventResult | null>(null);
  const [draft, setDraft] = useState<EventResult | null>(null);
  const [rankDialogOpen, setRankDialogOpen] = useState(false);
  const [editRank, setEditRank] = useState<RankingRow | null>(null);
  const [rankDraft, setRankDraft] = useState<RankingRow | null>(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const rows = await adminListContent("results");
      const storedRanking = (rows.find((r) => (r as ContentItem & { kind?: string }).kind === "ranking")?.rows as RankingRow[]) || [];
      setRanking(storedRanking.map((r) => ({ ...r })));
      setEvents(rows.filter((r) => (r as ContentItem & { kind?: string }).kind !== "ranking") as unknown as EventResult[]);
    } catch (error) {
      toast({ title: "Chargement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveRanking = async (next: RankingRow[]) => {
    const previous = ranking;
    setRanking(next);
    try {
      const existing = await adminListContent("results");
      const rankingRow = existing.find((r) => (r as ContentItem & { kind?: string }).kind === "ranking");
      const payload = { kind: "ranking", rows: next };
      if (rankingRow) await adminUpdateContent("results", rankingRow.id, payload);
      else await adminCreateContent("results", payload);
    } catch (error) {
      setRanking(previous);
      toast({ title: "Enregistrement impossible", description: (error as Error).message, variant: "destructive" });
    }
  };

  const openEventDialog = (item: EventResult | null) => {
    setEditEvent(item);
    setDraft(item ? { ...item, participants: [...item.participants], documents: [...item.documents] } : {
      id: 0, eventName: "", date: "", place: "", type: "national", discipline: "classique",
      source: "competition", participants: [], documents: [],
    });
    setEventDialogOpen(true);
  };

  const saveEvent = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      const { id, ...payload } = draft;
      const saved = id
        ? await adminUpdateContent("results", id, payload)
        : await adminCreateContent("results", payload);
      setEvents((prev) => (id ? prev.map((e) => (e.id === saved.id ? (saved as unknown as EventResult) : e)) : [...prev, saved as unknown as EventResult]));
      setEventDialogOpen(false);
      toast({ title: editEvent ? "Résultat modifié" : "Résultat ajouté", description: "Publié sur le site." });
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await adminDeleteContent("results", id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Supprimé" });
    } catch (error) {
      toast({ title: "Suppression impossible", description: (error as Error).message, variant: "destructive" });
    }
  };

  const addParticipant = () => draft && setDraft({ ...draft, participants: [...draft.participants, { rank: draft.participants.length + 1, name: "", club: "" }] });
  const updateParticipant = (i: number, field: keyof Participant, val: string | number) =>
    draft && setDraft({ ...draft, participants: draft.participants.map((p, idx) => idx === i ? { ...p, [field]: val } : p) });
  const removeParticipant = (i: number) => draft && setDraft({ ...draft, participants: draft.participants.filter((_, idx) => idx !== i) });

  const handleDocs = (files: FileList | null) => {
    if (!files || !draft) return;
    const docs = Array.from(files).map(f => ({ name: f.name, type: f.type || "file", size: formatBytes(f.size) }));
    setDraft({ ...draft, documents: [...draft.documents, ...docs] });
  };
  const removeDoc = (i: number) => draft && setDraft({ ...draft, documents: draft.documents.filter((_, idx) => idx !== i) });

  const openRankDialog = (item: RankingRow | null) => {
    setEditRank(item);
    setRankDraft(item ? { ...item } : { id: 0, name: "", club: "", points: 0, gold: 0, silver: 0, bronze: 0 });
    setRankDialogOpen(true);
  };
  const saveRank = async () => {
    if (!rankDraft) return;
    const next = editRank
      ? ranking.map((r) => (r.id === rankDraft.id ? rankDraft : r))
      : [...ranking, rankDraft];
    await saveRanking(next);
    setRankDialogOpen(false);
    toast({ title: editRank ? "Athlète modifié" : "Athlète ajouté" });
  };
  const deleteRank = async (id: number) => {
    await saveRanking(ranking.filter((r) => r.id !== id));
    toast({ title: "Supprimé" });
  };

  const filteredEvents = events.filter(e => e.eventName.toLowerCase().includes(search.toLowerCase()));
  const sortedRanking = [...ranking].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Résultats"
        description="Gérez les résultats par compétition et le classement général des athlètes"
        stats={[
          { label: "Événements", value: events.length },
          { label: "Issus compétitions", value: events.filter(e => e.source === "competition").length, color: "text-blue-600" },
          { label: "Athlètes classés", value: ranking.length, color: "text-emerald-600" },
          { label: "Médailles d'or", value: ranking.reduce((s, r) => s + r.gold, 0), color: "text-yellow-600" },
        ]}
      />

      <Tabs defaultValue="competitions" className="w-full">
        <TabsList>
          <TabsTrigger value="competitions"><Trophy className="mr-2 h-4 w-4" />Résultats par compétition</TabsTrigger>
          <TabsTrigger value="ranking"><Medal className="mr-2 h-4 w-4" />Classement général</TabsTrigger>
        </TabsList>

        {/* TAB 1: Compétitions */}
        <TabsContent value="competitions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un événement..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={() => openEventDialog(null)}>
                <Plus className="mr-2 h-4 w-4" /> Nouveau résultat
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Événement</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead>Discipline</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-center">Classement</TableHead>
                        <TableHead className="text-center">Docs</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.eventName}</TableCell>
                          <TableCell>{e.date}</TableCell>
                          <TableCell className="text-muted-foreground"><MapPin className="inline w-3 h-3 mr-1" />{e.place}</TableCell>
                          <TableCell className="capitalize">{e.discipline}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.source === "competition" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {e.source === "competition" ? "Compétition" : "Résultat seul"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{e.participants.length}</TableCell>
                          <TableCell className="text-center">{e.documents.length}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEventDialog(e)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteEvent(e.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredEvents.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun résultat</p>}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Classement général */}
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <p className="text-sm text-muted-foreground">Classement cumulé des athlètes (trié par points)</p>
              <Button onClick={() => openRankDialog(null)}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un athlète
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rang</TableHead>
                    <TableHead>Athlète</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead className="text-center">🥇 Or</TableHead>
                    <TableHead className="text-center">🥈 Argent</TableHead>
                    <TableHead className="text-center">🥉 Bronze</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRanking.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-bold">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.club}</TableCell>
                      <TableCell className="text-center">{r.gold}</TableCell>
                      <TableCell className="text-center">{r.silver}</TableCell>
                      <TableCell className="text-center">{r.bronze}</TableCell>
                      <TableCell className="text-center font-bold">{r.points}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openRankDialog(r)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteRank(r.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedRanking.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun athlète classé</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editEvent ? "Modifier le résultat" : "Nouveau résultat"}</DialogTitle></DialogHeader>
          {draft && (
            <Tabs defaultValue="general" className="py-2">
              <TabsList>
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="ranking">Classement ({draft.participants.length})</TabsTrigger>
                <TabsTrigger value="docs">Documents ({draft.documents.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Nom de l'événement</Label><Input value={draft.eventName} onChange={(e) => setDraft({ ...draft, eventName: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Lieu</Label><Input value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventResult["type"] })}>
                      <option value="national">National</option>
                      <option value="international">International</option>
                      <option value="training">Stage</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={draft.discipline} onChange={(e) => setDraft({ ...draft, discipline: e.target.value })}>
                      <option value="classique">Classique</option>
                      <option value="contemporain">Contemporain</option>
                      <option value="hiphop">Hip-Hop</option>
                      <option value="jazz">Jazz</option>
                      <option value="breaking">Breaking</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value as EventResult["source"] })}>
                      <option value="competition">Lié à une compétition</option>
                      <option value="result">Résultat seul</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 « Lié à une compétition » : le résultat apparaît aussi dans la fiche compétition. « Résultat seul » : géré uniquement depuis la page Résultats.
                </p>
              </TabsContent>

              <TabsContent value="ranking" className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Classement des participants</p>
                  <Button size="sm" variant="outline" onClick={addParticipant}><Plus className="mr-1 h-3 w-3" />Ajouter</Button>
                </div>
                {draft.participants.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-2" type="number" min={1} value={p.rank} onChange={(e) => updateParticipant(i, "rank", Number(e.target.value))} placeholder="Rang" />
                    <Input className="col-span-5" value={p.name} onChange={(e) => updateParticipant(i, "name", e.target.value)} placeholder="Nom" />
                    <Input className="col-span-4" value={p.club} onChange={(e) => updateParticipant(i, "club", e.target.value)} placeholder="Club" />
                    <Button variant="ghost" size="icon" className="text-destructive col-span-1" onClick={() => removeParticipant(i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                {draft.participants.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Aucun participant</p>}
              </TabsContent>

              <TabsContent value="docs" className="space-y-3 pt-4">
                <Label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-6 hover:bg-muted/50">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Téléverser des documents (PDF, Word...)</span>
                  <input type="file" multiple className="hidden" onChange={(e) => handleDocs(e.target.files)} />
                </Label>
                {draft.documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{d.name}</span><span className="text-xs text-muted-foreground">({d.size})</span></div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeDoc(i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveEvent} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ranking dialog */}
      <Dialog open={rankDialogOpen} onOpenChange={setRankDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editRank ? "Modifier l'athlète" : "Nouvel athlète"}</DialogTitle></DialogHeader>
          {rankDraft && (
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Nom</Label><Input value={rankDraft.name} onChange={(e) => setRankDraft({ ...rankDraft, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Club</Label><Input value={rankDraft.club} onChange={(e) => setRankDraft({ ...rankDraft, club: e.target.value })} /></div>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2"><Label>🥇 Or</Label><Input type="number" min={0} value={rankDraft.gold} onChange={(e) => setRankDraft({ ...rankDraft, gold: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>🥈 Argent</Label><Input type="number" min={0} value={rankDraft.silver} onChange={(e) => setRankDraft({ ...rankDraft, silver: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>🥉 Bronze</Label><Input type="number" min={0} value={rankDraft.bronze} onChange={(e) => setRankDraft({ ...rankDraft, bronze: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Points</Label><Input type="number" min={0} value={rankDraft.points} onChange={(e) => setRankDraft({ ...rankDraft, points: Number(e.target.value) })} /></div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRankDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveRank}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResults;
