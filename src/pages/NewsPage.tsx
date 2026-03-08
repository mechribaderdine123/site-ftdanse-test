import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { newsData } from "@/data/newsData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const NewsPage = () => {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const filteredNews = newsData.filter((item) => {
    const matchSearch = t(item.titleKey).toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.category === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-16 bg-primary">
        <div className="container mx-auto px-4 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("np.back")}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            {t("np.title")}
          </h1>
          <p className="text-primary-foreground/70 max-w-xl text-sm leading-relaxed">
            {t("np.subtitle")}
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("np.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="ps-9 pe-8 py-2 text-sm border border-input rounded-lg bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">{t("np.allTypes")}</option>
                <option value="competition">{t("np.competition")}</option>
                <option value="event">{t("np.event")}</option>
              </select>
            </div>

            {/* Discipline Filter */}
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">{t("np.allDisciplines")}</option>
              <option value="breakdance">Breakdance</option>
              <option value="hiphop">Hip-Hop</option>
              <option value="contemporary">{t("footer.contemporain")}</option>
            </select>

            {/* Date Start */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 justify-start text-start font-normal text-sm gap-2",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : t("np.dateStart")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {/* Date End */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 justify-start text-start font-normal text-sm gap-2",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : t("np.dateEnd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {filteredNews.map((item) => (
              <Link to={`/news/${item.id}`} key={item.id} className="block">
                <motion.div
                  className="bg-card rounded-xl border border-border overflow-hidden card-hover group h-full"
                  variants={fadeUp}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.image}
                      alt={t(item.titleKey)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 start-3 px-3 py-1 text-[11px] font-semibold rounded-md text-accent-foreground bg-accent">
                      {item.category === "competition" ? t("np.competition") : t("np.event")}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                    <h3 className="font-bold text-primary text-sm leading-snug mb-2">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                      {t(item.descKey)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-accent text-xs font-semibold group-hover:gap-2 transition-all">
                      {t("np.readMore")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {filteredNews.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {t("np.noResults")}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;
