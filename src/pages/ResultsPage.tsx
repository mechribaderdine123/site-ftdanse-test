import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, MapPin, ChevronDown, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LangContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useContent, contentUrl } from "@/lib/contentApi";

interface Participant {
  rank: number;
  name: string;
  club: string;
}

interface ApiEventResult {
  id: number;
  eventName: string;
  date: string;
  place: string;
  participants: Participant[];
  documents?: { name: string; url?: string }[];
}

interface ApiRankingRow {
  name: string;
  club: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
}

const ResultsPage = () => {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<"competitions" | "ranking">("competitions");
  const [search, setSearch] = useState("");

  const { items: rawItems, isFallback } = useContent("results");
  // Ranking is stored as a single item with kind:"ranking" (managed by AdminResults).
  const rankingItem = rawItems.find((r) => (r as { kind?: string }).kind === "ranking") as { rows?: ApiRankingRow[] } | undefined;
  const events = rawItems.filter((r) => (r as { kind?: string }).kind !== "ranking") as unknown as ApiEventResult[];
  const ranking = ((rankingItem?.rows as ApiRankingRow[]) || []).slice().sort((a, b) => b.points - a.points);

  const filteredEvents = events.filter((e) =>
    e.eventName?.toLowerCase().includes(search.toLowerCase())
  );

  const rankBadge = (rank: number) => {
    if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground font-bold text-sm">1</span>;
    if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground font-bold text-sm border border-border">2</span>;
    if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground font-bold text-sm">3</span>;
    return <span className="text-muted-foreground font-medium">{rank}</span>;
  };

  const tabs = [
    { key: "competitions" as const, label: t("res.tabCompetitions") },
    { key: "ranking" as const, label: t("res.tabRanking") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("res.back")}
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground italic mb-3">
            {t("res.title")}
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-sm md:text-base">
            {t("res.subtitle")}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-muted py-6">
        <div className="container mx-auto px-4 flex justify-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Search */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("res.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {isFallback && (
              <span className="text-xs text-muted-foreground">Données d'exemple — publiez les résultats depuis l'administration.</span>
            )}
          </div>
        </div>
      </section>

      {/* Results Tables */}
      {activeTab === "competitions" && (
        <section className="py-10">
          <div className="container mx-auto px-4 space-y-8">
            {filteredEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border border-border overflow-hidden bg-card"
              >
                {/* Event Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary-foreground">{event.eventName}</h3>
                    <p className="text-sm text-primary-foreground/70 flex items-center gap-2">
                      {event.date} • <MapPin className="w-3.5 h-3.5 inline" /> {event.place}
                    </p>
                  </div>
                  {(event.documents?.length ?? 0) > 0 && (
                    <a
                      href={contentUrl(event.documents![0].url || "#")}
                      download
                      className="flex items-center gap-2 bg-card text-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t("res.downloadPdf")}
                    </a>
                  )}
                </div>

                {/* Results Table */}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-24 text-center font-bold">{t("res.rank")}</TableHead>
                      <TableHead className="font-bold">{t("res.name")}</TableHead>
                      <TableHead className="font-bold">{t("res.club")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {event.participants.map((p) => (
                      <TableRow key={p.rank} className={p.rank <= 3 ? "bg-muted/30" : ""}>
                        <TableCell className="text-center">{rankBadge(p.rank)}</TableCell>
                        <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.club}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            ))}

            {filteredEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-16">{t("res.noResults")}</p>
            )}
          </div>
        </section>
      )}

      {activeTab === "ranking" && (
        <section className="py-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-border overflow-hidden bg-card"
            >
              <div className="bg-primary px-6 py-4">
                <h3 className="text-lg font-bold text-primary-foreground">{t("res.tabRanking")} — {t("res.season")}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20 text-center font-bold">#</TableHead>
                    <TableHead className="font-bold">{t("res.name")}</TableHead>
                    <TableHead className="font-bold">{t("res.club")}</TableHead>
                    <TableHead className="text-center font-bold">🥇</TableHead>
                    <TableHead className="text-center font-bold">🥈</TableHead>
                    <TableHead className="text-center font-bold">🥉</TableHead>
                    <TableHead className="text-center font-bold">{t("res.points")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, idx) => (
                    <TableRow key={`${r.name}-${idx}`} className={idx < 3 ? "bg-muted/30" : ""}>
                      <TableCell className="text-center">{rankBadge(idx + 1)}</TableCell>
                      <TableCell className="font-medium text-foreground">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.club}</TableCell>
                      <TableCell className="text-center font-semibold text-foreground">{r.gold}</TableCell>
                      <TableCell className="text-center font-semibold text-foreground">{r.silver}</TableCell>
                      <TableCell className="text-center font-semibold text-foreground">{r.bronze}</TableCell>
                      <TableCell className="text-center font-bold text-accent">{r.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {ranking.length === 0 && (
                <p className="text-center text-muted-foreground py-12">{t("res.noResults")}</p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ResultsPage;
