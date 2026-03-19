import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LangContext";
import { Badge } from "@/components/ui/badge";

interface CompetitionDetail {
  id: number;
  date: string;
  dateEnd: string;
  month: string;
  year: string;
  title: string;
  location: string;
  athletes: string;
  status: "open" | "closed" | "upcoming";
  disciplines: string[];
  type: string;
  description: string[];
  participants: number;
}

const CompetitionDetailPage = () => {
  const { id } = useParams();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("description");

  const competitions: CompetitionDetail[] = [
    {
      id: 1, date: "15 mars 2026", dateEnd: "20 mars 2026", month: "MARS", year: "2026",
      title: t("cp.c1.title"), location: t("cp.c1.loc"), athletes: "200+",
      status: "open", disciplines: [t("cp.classique"), t("cp.contemporain")],
      type: t("cd.typeNational"), description: [t("cd.desc1.p1"), t("cd.desc1.p2")], participants: 6,
    },
    {
      id: 2, date: "28 avril 2026", dateEnd: "30 avril 2026", month: "AVR", year: "2026",
      title: t("cp.c2.title"), location: t("cp.c2.loc"), athletes: "350+",
      status: "closed", disciplines: [t("cp.hiphop"), t("cp.jazz"), t("cp.contemporain")],
      type: t("cd.typeCup"), description: [t("cd.desc2.p1"), t("cd.desc2.p2")], participants: 12,
    },
    {
      id: 3, date: "12 mai 2026", dateEnd: "13 mai 2026", month: "MAI", year: "2026",
      title: t("cp.c3.title"), location: t("cp.c3.loc"), athletes: "150+",
      status: "closed", disciplines: [t("cp.breaking"), t("cp.hiphop"), t("cp.freestyle")],
      type: t("cd.typeBattle"), description: [t("cd.desc3.p1"), t("cd.desc3.p2")], participants: 8,
    },
    {
      id: 4, date: "08 juin 2026", dateEnd: "12 juin 2026", month: "JUN", year: "2026",
      title: t("cp.c4.title"), location: t("cp.c4.loc"), athletes: "500+",
      status: "upcoming", disciplines: [t("cp.allDisc")],
      type: t("cd.typeNational"), description: [t("cd.desc4.p1"), t("cd.desc4.p2")], participants: 24,
    },
    {
      id: 5, date: "20 juillet 2026", dateEnd: "22 juillet 2026", month: "JUL", year: "2026",
      title: t("cp.c5.title"), location: t("cp.c5.loc"), athletes: "300+",
      status: "upcoming", disciplines: [t("cp.classique"), t("cp.jazz"), t("cp.contemporain")],
      type: t("cd.typeGala"), description: [t("cd.desc5.p1"), t("cd.desc5.p2")], participants: 15,
    },
    {
      id: 6, date: "08 juin 2026", dateEnd: "12 juin 2026", month: "JUN", year: "2026",
      title: t("cp.c6.title"), location: t("cp.c6.loc"), athletes: "500+",
      status: "upcoming", disciplines: [t("cp.allDisc")],
      type: t("cd.typeNational"), description: [t("cd.desc4.p1"), t("cd.desc4.p2")], participants: 18,
    },
    {
      id: 7, date: "20 juillet 2026", dateEnd: "22 juillet 2026", month: "JUL", year: "2026",
      title: t("cp.c7.title"), location: t("cp.c7.loc"), athletes: "300+",
      status: "upcoming", disciplines: [t("cp.classique"), t("cp.jazz"), t("cp.contemporain")],
      type: t("cd.typeGala"), description: [t("cd.desc5.p1"), t("cd.desc5.p2")], participants: 10,
    },
    {
      id: 8, date: "08 juin 2026", dateEnd: "12 juin 2026", month: "JUN", year: "2026",
      title: t("cp.c8.title"), location: t("cp.c8.loc"), athletes: "500+",
      status: "upcoming", disciplines: [t("cp.allDisc")],
      type: t("cd.typeNational"), description: [t("cd.desc4.p1"), t("cd.desc4.p2")], participants: 20,
    },
  ];

  const comp = competitions.find((c) => c.id === Number(id));

  if (!comp) {
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

  const tabs = [
    { key: "description", label: t("cd.tabDesc") },
    { key: "programme", label: t("cd.tabProgramme") },
    { key: "documents", label: `${t("cd.tabDocs")} (4)` },
    { key: "participants", label: `${t("cd.tabParticipants")} (${comp.participants})` },
    { key: "results", label: t("cd.tabResults") },
    { key: "media", label: t("cd.tabMedia") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner with background */}
      <section className="relative bg-primary pt-24 pb-16 overflow-hidden">
        {/* Decorative background image overlay */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute top-0 end-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-to-l from-accent/30 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/competitions"
            className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("cd.backToList")}
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-accent text-accent-foreground font-semibold text-xs px-3 py-1">
              {comp.type}
            </Badge>
            {comp.disciplines.slice(0, 1).map((d, i) => (
              <Badge key={i} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs px-3 py-1 border-0">
                {d}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            {comp.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-5 text-primary-foreground/70 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {comp.date} — {comp.dateEnd}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {comp.location}
            </span>
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
              {/* Description paragraphs */}
              <div className="space-y-4 mb-10">
                {comp.description.map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {p}
                  </p>
                ))}
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Dates card */}
                <div className="border border-border rounded-xl p-5">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{t("cd.dates")}</p>
                  <p className="text-sm font-semibold text-foreground">{comp.date}</p>
                  <p className="text-sm font-semibold text-foreground">— {comp.dateEnd}</p>
                </div>

                {/* Location card */}
                <div className="border border-border rounded-xl p-5">
                  <MapPin className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{t("cd.lieu")}</p>
                  <p className="text-sm font-semibold text-foreground">{comp.location}</p>
                </div>

                {/* Participants card */}
                <div className="border border-border rounded-xl p-5">
                  <Users className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{t("cd.participants")}</p>
                  <p className="text-sm font-semibold text-foreground">{comp.participants} {t("cd.inscrits")}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "programme" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="text-muted-foreground text-sm">{t("cd.comingSoon")}</p>
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="text-muted-foreground text-sm">{t("cd.comingSoon")}</p>
            </motion.div>
          )}

          {activeTab === "participants" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="text-muted-foreground text-sm">{t("cd.comingSoon")}</p>
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="text-muted-foreground text-sm">{t("cd.comingSoon")}</p>
            </motion.div>
          )}

          {activeTab === "media" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="text-muted-foreground text-sm">{t("cd.comingSoon")}</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompetitionDetailPage;
