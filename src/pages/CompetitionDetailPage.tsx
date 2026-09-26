import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users, Loader2, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LangContext";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useContent, contentUrl } from "@/lib/contentApi";

interface ProgrammeItem { time: string; title: string; detail: string; }
interface ResultRow { position: string; athlete: string; club: string; score: string; }
interface AttachedDoc { name: string; type?: string; size?: string; url?: string; }

interface ApiCompetition {
  id: number;
  title: string;
  type?: string;
  status?: "open" | "closed" | "upcoming";
  dateStart: string;
  dateEnd?: string;
  location: string;
  athletesLabel?: string;
  disciplines: string[];
  description?: string;
  heroImage?: string;
  galleryImages?: string[];
  documents?: AttachedDoc[];
  programme?: ProgrammeItem[];
  results?: ResultRow[];
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const CompetitionDetailPage = () => {
  const { id } = useParams();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("description");

  const { items, isFallback } = useContent<ApiCompetition>("competitions");
  const comp = items.find((c) => c.id === Number(id)) || null;

  if (isFallback) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <p className="text-muted-foreground text-lg">{t("cd.notFound")}</p>
          <Link to="/competitions" className="text-primary underline mt-4 inline-block">{t("cd.backToList")}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!comp) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Navbar />
        <div className="container mx-auto px-4 py-32 flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{t("cd.notFound")}</p>
          <Link to="/competitions" className="text-primary underline">{t("cd.backToList")}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    open: t("cp.statusOpen"),
    closed: t("cp.statusClosed"),
    upcoming: t("cp.statusUpcoming"),
  };

  const paragraphs = (comp.description || "").split("\n\n").filter(Boolean);
  const hasProgramme = (comp.programme?.length ?? 0) > 0;
  const hasDocs = (comp.documents?.length ?? 0) > 0;
  const hasResults = (comp.results?.length ?? 0) > 0;
  const hasMedia = (comp.galleryImages?.length ?? 0) > 0;

  const tabs = [
    { key: "description", label: t("cd.tabDesc") },
    ...(hasProgramme ? [{ key: "programme", label: t("cd.tabProgramme") }] : []),
    ...(hasDocs ? [{ key: "documents", label: `${t("cd.tabDocs")} (${comp.documents!.length})` }] : []),
    ...(hasResults ? [{ key: "results", label: t("cd.tabResults") }] : []),
    ...(hasMedia ? [{ key: "media", label: t("cd.tabMedia") }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative bg-primary pt-24 pb-16 overflow-hidden">
        {comp.heroImage && (
          <>
            <img src={contentUrl(comp.heroImage)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
          </>
        )}
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/competitions"
            className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("cd.backToList")}
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {comp.type && (
              <Badge className="bg-accent text-accent-foreground font-semibold text-xs px-3 py-1">
                {comp.type}
              </Badge>
            )}
            {comp.status && (
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs px-3 py-1 border-0">
                {statusLabels[comp.status]}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            {comp.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-primary-foreground/70 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(comp.dateStart)}{comp.dateEnd ? ` — ${formatDate(comp.dateEnd)}` : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {comp.location}
            </span>
            {comp.athletesLabel && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {comp.athletesLabel} {t("cp.athletes")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-0 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {activeTab === "description" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl"
            >
              <div className="space-y-4 mb-10">
                {paragraphs.length > 0 ? paragraphs.map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {p}
                  </p>
                )) : (
                  <p className="text-muted-foreground text-sm">{t("cd.comingSoon")}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-xl p-5">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{t("cd.dates")}</p>
                  <p className="text-sm font-semibold text-foreground">{formatDate(comp.dateStart)}</p>
                  {comp.dateEnd && <p className="text-sm font-semibold text-foreground">— {formatDate(comp.dateEnd)}</p>}
                </div>
                <div className="border border-border rounded-xl p-5">
                  <MapPin className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{t("cd.lieu")}</p>
                  <p className="text-sm font-semibold text-foreground">{comp.location}</p>
                </div>
                <div className="border border-border rounded-xl p-5">
                  <Users className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{t("cd.participants")}</p>
                  <p className="text-sm font-semibold text-foreground">{comp.athletesLabel || "—"} {t("cd.inscrits")}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "programme" && hasProgramme && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-3">
              {comp.programme!.map((p, i) => (
                <div key={i} className="flex items-start gap-4 border border-border rounded-xl p-4 bg-card">
                  <span className="font-mono text-sm font-bold text-primary w-16 shrink-0">{p.time}</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{p.title}</p>
                    {p.detail && <p className="text-xs text-muted-foreground mt-0.5">{p.detail}</p>}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "documents" && hasDocs && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-3">
              {comp.documents!.map((doc, i) => (
                <a
                  key={i}
                  href={contentUrl(doc.url || "#")}
                  download
                  className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type || "PDF"}{doc.size ? ` — ${doc.size}` : ""}</p>
                  </div>
                </a>
              ))}
            </motion.div>
          )}

          {activeTab === "results" && hasResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl rounded-xl border border-border overflow-hidden bg-card">
              <div className="bg-primary px-6 py-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary-foreground" />
                <h3 className="text-lg font-bold text-primary-foreground">{t("cd.tabResults")}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20 text-center font-bold">#</TableHead>
                    <TableHead className="font-bold">{t("res.name")}</TableHead>
                    <TableHead className="font-bold">{t("res.club")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comp.results!.map((r, i) => (
                    <TableRow key={i} className={i < 3 ? "bg-muted/30" : ""}>
                      <TableCell className="text-center font-bold">{r.position}</TableCell>
                      <TableCell className="font-medium text-foreground">{r.athlete}</TableCell>
                      <TableCell className="text-muted-foreground">{r.club}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}

          {activeTab === "media" && hasMedia && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {comp.galleryImages!.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-[4/3] group">
                  <img src={contentUrl(img)} alt={`${comp.title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompetitionDetailPage;
