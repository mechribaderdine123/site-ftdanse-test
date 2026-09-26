import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Image, Video, ArrowLeft, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useContent, contentUrl } from "@/lib/contentApi";

interface ApiMediaEvent {
  id: number;
  title: string;
  date?: string;
  discipline?: string;
  eventType?: string;
  eventName?: string;
  photos: string[];
  videos: string[];
}

const disciplines = ["all", "breakdance", "contemporain", "hiphop", "classique"];
const eventTypes = ["all", "comp_nat", "comp_int", "formations"];

const MediathequePage = () => {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [discFilter, setDiscFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTabs, setActiveTabs] = useState<Record<number, "photos" | "videos">>({});

  const { items: rawItems, isFallback } = useContent("media");
  const events: ApiMediaEvent[] = rawItems.map((raw) => {
    const item = raw as unknown as Omit<ApiMediaEvent, "id"> & { id: number };
    return {
      ...item,
      title: item.title || "",
      photos: (item.photos || []).map(contentUrl),
      videos: item.videos || [],
    };
  });

  const years = ["all", ...Array.from(new Set(events.map((e) => e.date).filter(Boolean) as string[]))];

  const filtered = events.filter((ev) => {
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase());
    const matchDisc = discFilter === "all" || ev.discipline === discFilter;
    const matchYear = yearFilter === "all" || ev.date === yearFilter;
    const matchType = typeFilter === "all" || ev.eventType === typeFilter;
    return matchSearch && matchDisc && matchYear && matchType;
  });

  const getTab = (idx: number) => activeTabs[idx] || "photos";
  const setTab = (idx: number, tab: "photos" | "videos") =>
    setActiveTabs((prev) => ({ ...prev, [idx]: tab }));

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="pt-16 bg-primary">
        <div className="container mx-auto px-4 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("media.back")}
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground">
            {t("media.title")}
          </h1>
          <p className="text-primary-foreground/70 mt-2 max-w-xl text-sm">
            {t("media.desc")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("media.search")}
              className="w-full ps-9 pe-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="relative">
            <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={discFilter}
              onChange={(e) => setDiscFilter(e.target.value)}
              className="appearance-none text-sm rounded-lg border border-border bg-background text-foreground ps-9 pe-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {t(`media.disc.${d}`)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <CalendarIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="appearance-none text-sm rounded-lg border border-border bg-background text-foreground ps-9 pe-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "all" ? t("media.year.all") : y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none text-sm rounded-lg border border-border bg-background text-foreground ps-9 pe-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              {eventTypes.map((t2) => (
                <option key={t2} value={t2}>
                  {t(`media.type.${t2}`)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {isFallback && (
            <span className="text-xs text-muted-foreground">Données d'exemple — publiez vos médias depuis l'administration.</span>
          )}
        </div>
      </section>

      {/* Events */}
      <section className="py-12">
        <div className="container mx-auto px-4 space-y-14">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-10">{t("media.noResults")}</p>
          )}

          {filtered.map((ev, idx) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              {/* Event Title */}
              <div className="bg-primary rounded-lg px-5 py-3 mb-4 inline-block">
                <h2 className="text-lg font-bold text-primary-foreground">
                  {ev.title}
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setTab(idx, "photos")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    getTab(idx) === "photos"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  {t("media.photos")}
                </button>
                <button
                  onClick={() => setTab(idx, "videos")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    getTab(idx) === "videos"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  {t("media.videos")}
                </button>
              </div>

              {/* Content */}
              {getTab(idx) === "photos" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ev.photos.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="rounded-xl overflow-hidden aspect-[4/3] group"
                    >
                      <img
                        src={img}
                        alt={`${ev.title} - ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {ev.videos.length > 0 ? (
                    ev.videos.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                          src={url}
                          className="w-full h-full"
                          allowFullScreen
                          title={`${ev.title} video ${i + 1}`}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm col-span-2 py-6 text-center">
                      {t("media.noVideos")}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MediathequePage;
