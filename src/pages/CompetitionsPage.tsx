import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Users, ArrowLeft, ChevronDown, CheckCircle2, Trophy, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LangContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useContent } from "@/lib/contentApi";
import { useAuth } from "@/hooks/useAuth";

interface Competition {
  id: number;
  date: string;
  month: string;
  year: string;
  title: string;
  location: string;
  athletes: string;
  status: "open" | "closed" | "upcoming";
  disciplines: string[];
}

interface ApiCompetition {
  id: number;
  title?: string;
  dateStart?: string;
  dateEnd?: string;
  location?: string;
  athletesLabel?: string;
  status?: "open" | "closed" | "upcoming";
  disciplines?: string[];
}

const MONTHS_FR = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];

const apiToCompetition = (item: ApiCompetition): Competition => {
  const start = item.dateStart ? new Date(item.dateStart) : null;
  const valid = start && !isNaN(start.getTime());
  return {
    id: item.id,
    date: valid ? String(start!.getDate()).padStart(2, "0") : "—",
    month: valid ? MONTHS_FR[start!.getMonth()] : "",
    year: valid ? String(start!.getFullYear()) : "",
    title: item.title || "Compétition",
    location: item.location || "—",
    athletes: item.athletesLabel || "—",
    status: item.status || "upcoming",
    disciplines: item.disciplines || [],
  };
};

const staticCompetitions = (): Competition[] => [
  { id: 1, date: "15", month: "MARS", year: "2026", title: "Championnat National", location: "Tunis", athletes: "200+", status: "open", disciplines: ["Classique", "Contemporain"] },
  { id: 2, date: "28", month: "AVR", year: "2026", title: "Coupe de Tunisie", location: "Sousse", athletes: "350+", status: "closed", disciplines: ["Hip-Hop", "Jazz"] },
  { id: 3, date: "12", month: "MAI", year: "2026", title: "Battle Nationale", location: "Sfax", athletes: "150+", status: "closed", disciplines: ["Breaking", "Hip-Hop"] },
  { id: 4, date: "08", month: "JUN", year: "2026", title: "Open International", location: "Tunis", athletes: "500+", status: "upcoming", disciplines: ["Multi-disciplines"] },
];

const CompetitionsPage = () => {
  const { t } = useLang();
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [joined, setJoined] = useState<number[]>([]);
  const [joinTarget, setJoinTarget] = useState<Competition | null>(null);
  const [joining, setJoining] = useState(false);

  const isClub = user?.accountType === "club" && user?.status === "approved";

  const { data: joinedData } = useQuery({
    queryKey: ["competition-joined"],
    queryFn: () => apiRequest<{ joined: number[] }>("/api/competitions-joined"),
    enabled: !!isClub,
  });
  useEffect(() => {
    if (joinedData?.joined) setJoined(joinedData.joined);
  }, [joinedData]);

  const { items: apiItems } = useContent<ApiCompetition>("competitions");
  // API rows (title key present) → mapped; fallback list keeps the site usable pre-seeding.
  const usingApi = apiItems.some((i) => "title" in i);
  const competitions: Competition[] = usingApi
    ? apiItems.map(apiToCompetition)
    : staticCompetitions();

  const confirmJoin = async () => {
    if (!joinTarget) return;
    try {
      setJoining(true);
      await apiRequest(`/api/competitions/${joinTarget.id}/join`, { method: "POST" });
      setJoined((prev) => Array.from(new Set([...prev, joinTarget.id])));
      toast({
        title: "Inscription envoyée",
        description: `Le club a rejoint « ${joinTarget.title} ». Confirmation sous 48h.`,
      });
      setJoinTarget(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Inscription impossible",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const statusConfig = {
    open: { label: t("cp.statusOpen"), className: "bg-accent text-accent-foreground" },
    closed: { label: t("cp.statusClosed"), className: "bg-green-600 text-white" },
    upcoming: { label: t("cp.statusUpcoming"), className: "bg-yellow-500 text-white" },
  };

  const filtered = competitions.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchDisc = disciplineFilter === "all" || c.disciplines.some((d) => d.toLowerCase().includes(disciplineFilter));
    return matchSearch && matchDisc;
  });

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-primary pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("cp.back")}
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground italic mb-3">
            {t("cp.title")}
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-sm md:text-base">
            {t("cp.subtitle")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-background border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("cp.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-9 pe-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Discipline filter */}
            <div className="relative">
              <select
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="appearance-none bg-background border border-border rounded-lg px-3 py-2.5 pe-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">{t("cp.allDisciplines")}</option>
                <option value="classique">{t("cp.classique")}</option>
                <option value="contemporain">{t("cp.contemporain")}</option>
                <option value="hip-hop">{t("cp.hiphop")}</option>
                <option value="jazz">{t("cp.jazz")}</option>
                <option value="breaking">{t("cp.breaking")}</option>
              </select>
              <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Date start */}
            <input
              type="date"
              className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={t("cp.dateStart")}
            />

            {/* Date end */}
            <input
              type="date"
              className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={t("cp.dateEnd")}
            />
          </div>
        </div>
      </section>

      {/* Competition Cards */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {filtered.map((comp, i) => (
              <motion.div
                key={comp.id + "-" + i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
              >
                {/* Date Badge */}
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-bold leading-none">{comp.date}</span>
                  <span className="text-[10px] uppercase font-medium">{comp.month}</span>
                  <span className="text-[9px] opacity-70">{comp.year}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground text-sm md:text-base">{comp.title}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusConfig[comp.status].className}`}>
                      {statusConfig[comp.status].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {comp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {comp.athletes} {t("cp.athletes")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.disciplines.map((d, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] px-2 py-0.5 font-normal border-border text-muted-foreground">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Details Button */}
                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <Link
                    to={`/competitions/${comp.id}`}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {t("cp.details")}
                  </Link>
                  {isClub && comp.status !== "closed" && (
                    joined.includes(comp.id) ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Inscrit
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-auto py-2 px-3 gap-1.5"
                        onClick={() => setJoinTarget(comp)}
                      >
                        <Trophy className="w-3.5 h-3.5" /> Rejoindre
                      </Button>
                    )
                  )}
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-16">{t("cp.noResults")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Join confirmation dialog */}
      <Dialog open={!!joinTarget} onOpenChange={(o) => !o && setJoinTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejoindre la compétition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Vous êtes sur le point d'inscrire <strong className="text-foreground">votre club</strong> à :
            </div>
            {joinTarget && (
              <div className="border border-border rounded-lg p-3 space-y-1">
                <p className="font-semibold text-foreground">{joinTarget.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {joinTarget.location} · {joinTarget.date} {joinTarget.month} {joinTarget.year}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Vous pourrez sélectionner les membres engagés depuis votre tableau de bord après confirmation.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJoinTarget(null)}>Annuler</Button>
              <Button onClick={confirmJoin} disabled={joining}>
                {joining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirmer l'inscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CompetitionsPage;
