import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Image, Video, ArrowLeft, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

import g1 from "@/assets/gallery1.jpg";
import g2 from "@/assets/gallery2.jpg";
import g3 from "@/assets/gallery3.jpg";
import g4 from "@/assets/gallery4.jpg";
import g5 from "@/assets/gallery5.jpg";
import g6 from "@/assets/gallery6.jpg";
import heroDance from "@/assets/hero-dance.jpg";
import news1 from "@/assets/news1.jpg";
import news2 from "@/assets/news2.jpg";
import news3 from "@/assets/news3.jpg";
import styleBreak from "@/assets/style-breakdance.jpg";
import styleContemp from "@/assets/style-contemporain.jpg";
import styleHiphop from "@/assets/style-hiphop.jpg";
import danceAbout from "@/assets/dance-about.jpg";

interface MediaEvent {
  titleKey: string;
  date: string;
  discipline: string;
  eventType: string;
  eventNameKey: string;
  photos: string[];
  videos: string[];
}

const eventsData: MediaEvent[] = [
  {
    titleKey: "media.event1",
    date: "2025",
    discipline: "breakdance",
    eventType: "comp_nat",
    eventNameKey: "media.eventName.champNat",
    photos: [g1, g2, g3, g4, heroDance, styleBreak, g5, g6],
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
  },
  {
    titleKey: "media.event2",
    date: "2025",
    discipline: "contemporain",
    eventType: "comp_int",
    eventNameKey: "media.eventName.galaContemp",
    photos: [g5, g6, news1, news2, styleContemp, danceAbout, g1, g3],
    videos: [],
  },
  {
    titleKey: "media.event3",
    date: "2024",
    discipline: "hiphop",
    eventType: "comp_nat",
    eventNameKey: "media.eventName.compRegion",
    photos: [heroDance, news3, styleHiphop, g4, g2, news1, g6, g5],
    videos: [],
  },
  {
    titleKey: "media.event4",
    date: "2024",
    discipline: "classique",
    eventType: "formations",
    eventNameKey: "media.eventName.stageClassique",
    photos: [danceAbout, g1, g3, g5, styleContemp, news2, heroDance, g4],
    videos: [],
  },
];

const disciplines = ["all", "breakdance", "contemporain", "hiphop", "classique"];
const eventTypes = ["all", "comp_nat", "comp_int", "formations"];
const eventNames = ["all", "media.eventName.champNat", "media.eventName.galaContemp", "media.eventName.compRegion", "media.eventName.stageClassique"];
const years = ["all", "2025", "2024", "2023"];

const MediathequePage = () => {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [discFilter, setDiscFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [activeTabs, setActiveTabs] = useState<Record<number, "photos" | "videos">>({});

  const filtered = eventsData.filter((ev) => {
    const matchSearch = t(ev.titleKey).toLowerCase().includes(search.toLowerCase());
    const matchDisc = discFilter === "all" || ev.discipline === discFilter;
    const matchYear = yearFilter === "all" || ev.date === yearFilter;
    const matchType = typeFilter === "all" || ev.eventType === typeFilter;
    const matchEvent = eventFilter === "all" || ev.eventNameKey === eventFilter;
    return matchSearch && matchDisc && matchYear && matchType && matchEvent;
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

          <div className="relative">
            <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="appearance-none text-sm rounded-lg border border-border bg-background text-foreground ps-9 pe-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              {eventNames.map((en) => (
                <option key={en} value={en}>
                  {en === "all" ? t("media.event.all") : t(en)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
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
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              {/* Event Title */}
              <div className="bg-primary rounded-lg px-5 py-3 mb-4 inline-block">
                <h2 className="text-lg font-bold text-primary-foreground">
                  {t(ev.titleKey)}
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
                        alt={`${t(ev.titleKey)} - ${i + 1}`}
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
                          title={`${t(ev.titleKey)} video ${i + 1}`}
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
