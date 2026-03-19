import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Users, ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LangContext";
import { Badge } from "@/components/ui/badge";

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

const CompetitionsPage = () => {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");

  const competitions: Competition[] = [
    {
      id: 1, date: "15", month: "MARS", year: "2026",
      title: t("cp.c1.title"), location: t("cp.c1.loc"), athletes: "200+",
      status: "open", disciplines: [t("cp.classique"), t("cp.contemporain")],
    },
    {
      id: 2, date: "28", month: "AVR", year: "2026",
      title: t("cp.c2.title"), location: t("cp.c2.loc"), athletes: "350+",
      status: "closed", disciplines: [t("cp.hiphop"), t("cp.jazz"), t("cp.contemporain")],
    },
    {
      id: 3, date: "12", month: "MAI", year: "2026",
      title: t("cp.c3.title"), location: t("cp.c3.loc"), athletes: "150+",
      status: "closed", disciplines: [t("cp.breaking"), t("cp.hiphop"), t("cp.freestyle")],
    },
    {
      id: 4, date: "08", month: "JUN", year: "2026",
      title: t("cp.c4.title"), location: t("cp.c4.loc"), athletes: "500+",
      status: "upcoming", disciplines: [t("cp.allDisc")],
    },
    {
      id: 5, date: "20", month: "JUL", year: "2026",
      title: t("cp.c5.title"), location: t("cp.c5.loc"), athletes: "300+",
      status: "upcoming", disciplines: [t("cp.classique"), t("cp.jazz"), t("cp.contemporain")],
    },
    {
      id: 6, date: "08", month: "JUN", year: "2026",
      title: t("cp.c6.title"), location: t("cp.c6.loc"), athletes: "500+",
      status: "upcoming", disciplines: [t("cp.allDisc")],
    },
    {
      id: 7, date: "20", month: "JUL", year: "2026",
      title: t("cp.c7.title"), location: t("cp.c7.loc"), athletes: "300+",
      status: "upcoming", disciplines: [t("cp.classique"), t("cp.jazz"), t("cp.contemporain")],
    },
    {
      id: 8, date: "08", month: "JUN", year: "2026",
      title: t("cp.c8.title"), location: t("cp.c8.loc"), athletes: "500+",
      status: "upcoming", disciplines: [t("cp.allDisc")],
    },
  ];

  const statusConfig = {
    open: { label: t("cp.statusOpen"), className: "bg-accent text-accent-foreground" },
    closed: { label: t("cp.statusClosed"), className: "bg-green-600 text-white" },
    upcoming: { label: t("cp.statusUpcoming"), className: "bg-yellow-500 text-white" },
  };

  const filtered = competitions.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
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

            {/* Type filter */}
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-lg px-3 py-2.5 pe-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">{t("cp.allTypes")}</option>
                  <option value="championship">{t("cp.championship")}</option>
                  <option value="cup">{t("cp.cup")}</option>
                  <option value="gala">{t("cp.gala")}</option>
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
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
                <option value="hiphop">{t("cp.hiphop")}</option>
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
                <Link to={`/competitions/${comp.id}`} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  {t("cp.details")}
                </Link>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-16">{t("cp.noResults")}</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompetitionsPage;
