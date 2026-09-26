import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, ArrowRight, Users, User, Award, Dumbbell, Building2, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api";

type FilterCategory = "all" | "athletes" | "referees" | "coaches" | "clubs";

interface DirectoryEntry {
  id: number;
  accountType: "athlete" | "coach" | "referee" | "club";
  name: string;
  city: string;
  discipline: string;
  email?: string;
  phone?: string;
  clubName?: string;
  licenseActive: boolean;
  memberCount?: number;
}

const AnnuairePage = () => {
  const { t, isRTL, lang } = useLang();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<DirectoryEntry[]>("/api/directory");
      setEntries(data || []);
    } catch (error) {
      console.error("Failed to load directory:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filters: { key: FilterCategory; labelKey: string; icon: typeof Users }[] = [
    { key: "all", labelKey: "ann.filter.all", icon: Users },
    { key: "athletes", labelKey: "ann.filter.dancers", icon: User },
    { key: "referees", labelKey: "ann.filter.referees", icon: Award },
    { key: "coaches", labelKey: "ann.filter.coaches", icon: Dumbbell },
    { key: "clubs", labelKey: "ann.filter.clubs", icon: Building2 },
  ];

  const filtered = entries.filter((entry) => {
    const matchSearch = 
      entry.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.city.toLowerCase().includes(search.toLowerCase()) ||
      entry.discipline.toLowerCase().includes(search.toLowerCase()) ||
      (entry.clubName?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (filter === "all") return matchSearch;
    if (filter === "clubs") return entry.accountType === "club" && matchSearch;
    if (filter === "athletes") return entry.accountType === "athlete" && matchSearch;
    if (filter === "referees") return entry.accountType === "referee" && matchSearch;
    if (filter === "coaches") return entry.accountType === "coach" && matchSearch;
    return matchSearch;
  });

  const getMemberIcon = (entry: DirectoryEntry) => {
    if (entry.accountType === "club") return <Building2 className="w-6 h-6 text-muted-foreground" />;
    if (entry.accountType === "coach") return <Dumbbell className="w-6 h-6 text-muted-foreground" />;
    if (entry.accountType === "referee") return <Award className="w-6 h-6 text-muted-foreground" />;
    return <User className="w-6 h-6 text-muted-foreground" />;
  };

  const getTypeLabel = (accountType: string) => {
    const labels: Record<string, string> = {
      athlete: t("ann.filter.dancers"),
      coach: t("ann.filter.coaches"),
      referee: t("ann.filter.referees"),
      club: t("ann.filter.clubs"),
    };
    return labels[accountType] || accountType;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors">
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {t("ann.back")}
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">
            {t("ann.title")}
          </h1>
          <p className="text-primary-foreground/80 max-w-xl text-sm md:text-base">
            {t("ann.subtitle")}
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("ann.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-11 pe-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {filters.map((f) => {
              const Icon = f.icon;
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                    active
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-foreground border-border hover:border-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(f.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Cards Grid */}
          {!loading && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {getMemberIcon(entry)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm">{entry.name}</h3>
                        <p className="text-accent text-xs font-medium">{entry.discipline}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {entry.accountType !== "club" && (
                        <>
                          {entry.clubName && <p>{entry.clubName}</p>}
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {entry.city}
                          </p>
                        </>
                      )}
                      {entry.accountType === "club" && (
                        <>
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {entry.city}
                          </p>
                          {entry.memberCount && (
                            <p>{entry.memberCount} {t("ann.members")}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-[11px] border border-border rounded-md px-2.5 py-1 text-muted-foreground">
                        {getTypeLabel(entry.accountType)}
                      </span>
                      {entry.licenseActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> {t("ann.license")}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-12">{t("ann.empty")}</p>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnnuairePage;
