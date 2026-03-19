import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, MapPin, ChevronDown, ArrowLeft } from "lucide-react";
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

interface EventResult {
  eventName: string;
  date: string;
  place: string;
  participants: { rank: number; name: string; club: string }[];
}

const ResultsPage = () => {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<"competitions" | "ranking">("competitions");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");

  const eventsData: Record<string, EventResult[]> = {
    fr: [
      {
        eventName: "Championnat National de Danse Classique",
        date: "8 juin 2026",
        place: "Tunis, Cité de la Culture",
        participants: [
          { rank: 1, name: "Amira Ben Ali", club: "Club Étoile de Tunis" },
          { rank: 2, name: "Sami Trabelsi", club: "Académie de Danse Sfax" },
          { rank: 3, name: "Leila Hamdi", club: "Dance Academy Sousse" },
          { rank: 4, name: "Youssef Karim", club: "Club Étoile de Tunis" },
          { rank: 5, name: "Nour El Houda", club: "Studio Danse Nabeul" },
          { rank: 6, name: "Rami Jebali", club: "Académie de Danse Sfax" },
          { rank: 7, name: "Salma Mansour", club: "Dance Academy Sousse" },
        ],
      },
      {
        eventName: "Coupe de Tunisie Hip-Hop",
        date: "15 mai 2026",
        place: "Sfax, Salle Omnisports",
        participants: [
          { rank: 1, name: "Karim Bouazizi", club: "Urban Crew Tunis" },
          { rank: 2, name: "Mohamed Ferjani", club: "Street Dance Sfax" },
          { rank: 3, name: "Ines Chaabane", club: "Dance Factory Sousse" },
          { rank: 4, name: "Ahmed Dridi", club: "Urban Crew Tunis" },
          { rank: 5, name: "Fatma Zouari", club: "Street Dance Sfax" },
          { rank: 6, name: "Hatem Saidi", club: "Dance Factory Sousse" },
          { rank: 7, name: "Rim Gharbi", club: "Urban Crew Tunis" },
        ],
      },
      {
        eventName: "Gala International de Danse Contemporaine",
        date: "22 avril 2026",
        place: "Hammamet, Théâtre Municipal",
        participants: [
          { rank: 1, name: "Sara Mejri", club: "Compagnie Danse Libre" },
          { rank: 2, name: "Omar Selmi", club: "Troupe Nationale" },
          { rank: 3, name: "Myriam Aouadi", club: "Studio Modern Tunis" },
          { rank: 4, name: "Bilel Nasri", club: "Compagnie Danse Libre" },
          { rank: 5, name: "Hana Khelifi", club: "Troupe Nationale" },
          { rank: 6, name: "Wael Bargaoui", club: "Studio Modern Tunis" },
          { rank: 7, name: "Asma Cherif", club: "Compagnie Danse Libre" },
        ],
      },
    ],
    en: [
      {
        eventName: "National Classical Dance Championship",
        date: "June 8, 2026",
        place: "Tunis, City of Culture",
        participants: [
          { rank: 1, name: "Amira Ben Ali", club: "Tunis Star Club" },
          { rank: 2, name: "Sami Trabelsi", club: "Sfax Dance Academy" },
          { rank: 3, name: "Leila Hamdi", club: "Sousse Dance Academy" },
          { rank: 4, name: "Youssef Karim", club: "Tunis Star Club" },
          { rank: 5, name: "Nour El Houda", club: "Nabeul Dance Studio" },
          { rank: 6, name: "Rami Jebali", club: "Sfax Dance Academy" },
          { rank: 7, name: "Salma Mansour", club: "Sousse Dance Academy" },
        ],
      },
      {
        eventName: "Tunisia Hip-Hop Cup",
        date: "May 15, 2026",
        place: "Sfax, Sports Hall",
        participants: [
          { rank: 1, name: "Karim Bouazizi", club: "Urban Crew Tunis" },
          { rank: 2, name: "Mohamed Ferjani", club: "Street Dance Sfax" },
          { rank: 3, name: "Ines Chaabane", club: "Sousse Dance Factory" },
          { rank: 4, name: "Ahmed Dridi", club: "Urban Crew Tunis" },
          { rank: 5, name: "Fatma Zouari", club: "Street Dance Sfax" },
          { rank: 6, name: "Hatem Saidi", club: "Sousse Dance Factory" },
          { rank: 7, name: "Rim Gharbi", club: "Urban Crew Tunis" },
        ],
      },
      {
        eventName: "International Contemporary Dance Gala",
        date: "April 22, 2026",
        place: "Hammamet, Municipal Theater",
        participants: [
          { rank: 1, name: "Sara Mejri", club: "Free Dance Company" },
          { rank: 2, name: "Omar Selmi", club: "National Troupe" },
          { rank: 3, name: "Myriam Aouadi", club: "Modern Studio Tunis" },
          { rank: 4, name: "Bilel Nasri", club: "Free Dance Company" },
          { rank: 5, name: "Hana Khelifi", club: "National Troupe" },
          { rank: 6, name: "Wael Bargaoui", club: "Modern Studio Tunis" },
          { rank: 7, name: "Asma Cherif", club: "Free Dance Company" },
        ],
      },
    ],
    ar: [
      {
        eventName: "البطولة الوطنية للرقص الكلاسيكي",
        date: "8 جوان 2026",
        place: "تونس، مدينة الثقافة",
        participants: [
          { rank: 1, name: "أميرة بن علي", club: "نادي نجم تونس" },
          { rank: 2, name: "سامي الطرابلسي", club: "أكاديمية الرقص صفاقس" },
          { rank: 3, name: "ليلى حمدي", club: "أكاديمية الرقص سوسة" },
          { rank: 4, name: "يوسف كريم", club: "نادي نجم تونس" },
          { rank: 5, name: "نور الهدى", club: "استوديو الرقص نابل" },
          { rank: 6, name: "رامي الجبالي", club: "أكاديمية الرقص صفاقس" },
          { rank: 7, name: "سلمى منصور", club: "أكاديمية الرقص سوسة" },
        ],
      },
      {
        eventName: "كأس تونس للهيب هوب",
        date: "15 ماي 2026",
        place: "صفاقس، القاعة الرياضية",
        participants: [
          { rank: 1, name: "كريم بوعزيزي", club: "فريق أوربن تونس" },
          { rank: 2, name: "محمد الفرجاني", club: "ستريت دانس صفاقس" },
          { rank: 3, name: "إيناس الشعباني", club: "مصنع الرقص سوسة" },
          { rank: 4, name: "أحمد الدريدي", club: "فريق أوربن تونس" },
          { rank: 5, name: "فاطمة الزواري", club: "ستريت دانس صفاقس" },
          { rank: 6, name: "حاتم السعيدي", club: "مصنع الرقص سوسة" },
          { rank: 7, name: "ريم الغربي", club: "فريق أوربن تونس" },
        ],
      },
      {
        eventName: "حفل الرقص المعاصر الدولي",
        date: "22 أفريل 2026",
        place: "الحمامات، المسرح البلدي",
        participants: [
          { rank: 1, name: "سارة المجري", club: "فرقة الرقص الحر" },
          { rank: 2, name: "عمر السالمي", club: "الفرقة الوطنية" },
          { rank: 3, name: "مريم العوادي", club: "استوديو مودرن تونس" },
          { rank: 4, name: "بلال النصري", club: "فرقة الرقص الحر" },
          { rank: 5, name: "هناء الخليفي", club: "الفرقة الوطنية" },
          { rank: 6, name: "وائل البرقاوي", club: "استوديو مودرن تونس" },
          { rank: 7, name: "أسماء الشريف", club: "فرقة الرقص الحر" },
        ],
      },
    ],
  };

  const events = eventsData[lang] || eventsData.fr;

  const filteredEvents = events.filter((e) =>
    e.eventName.toLowerCase().includes(search.toLowerCase())
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

      {/* Filters */}
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
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-lg px-3 py-2.5 pe-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">{t("res.allTypes")}</option>
                  <option value="national">{t("res.national")}</option>
                  <option value="international">{t("res.international")}</option>
                  <option value="training">{t("res.training")}</option>
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <select
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="appearance-none bg-background border border-border rounded-lg px-3 py-2.5 pe-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">{t("res.allDisciplines")}</option>
                <option value="classique">{t("cp.classique")}</option>
                <option value="contemporain">{t("cp.contemporain")}</option>
                <option value="hiphop">{t("cp.hiphop")}</option>
                <option value="jazz">{t("cp.jazz")}</option>
                <option value="breaking">{t("cp.breaking")}</option>
              </select>
              <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <input
              type="date"
              className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="date"
              className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {/* Results Tables */}
      {activeTab === "competitions" && (
        <section className="py-10">
          <div className="container mx-auto px-4 space-y-8">
            {filteredEvents.map((event, i) => (
              <motion.div
                key={i}
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
                  <button className="flex items-center gap-2 bg-card text-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                    <Download className="w-4 h-4" />
                    {t("res.downloadPdf")}
                  </button>
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
            {(() => {
              const rankingData: Record<string, { name: string; club: string; points: number; gold: number; silver: number; bronze: number }[]> = {
                fr: [
                  { name: "Amira Ben Ali", club: "Club Étoile de Tunis", points: 2850, gold: 5, silver: 2, bronze: 1 },
                  { name: "Karim Bouazizi", club: "Urban Crew Tunis", points: 2720, gold: 4, silver: 3, bronze: 2 },
                  { name: "Sara Mejri", club: "Compagnie Danse Libre", points: 2680, gold: 4, silver: 2, bronze: 3 },
                  { name: "Sami Trabelsi", club: "Académie de Danse Sfax", points: 2510, gold: 3, silver: 4, bronze: 1 },
                  { name: "Leila Hamdi", club: "Dance Academy Sousse", points: 2340, gold: 3, silver: 2, bronze: 3 },
                  { name: "Omar Selmi", club: "Troupe Nationale", points: 2180, gold: 2, silver: 3, bronze: 4 },
                  { name: "Mohamed Ferjani", club: "Street Dance Sfax", points: 2050, gold: 2, silver: 2, bronze: 3 },
                  { name: "Ines Chaabane", club: "Dance Factory Sousse", points: 1920, gold: 1, silver: 4, bronze: 2 },
                  { name: "Nour El Houda", club: "Studio Danse Nabeul", points: 1870, gold: 1, silver: 3, bronze: 3 },
                  { name: "Myriam Aouadi", club: "Studio Modern Tunis", points: 1750, gold: 1, silver: 2, bronze: 4 },
                  { name: "Youssef Karim", club: "Club Étoile de Tunis", points: 1680, gold: 1, silver: 2, bronze: 2 },
                  { name: "Rami Jebali", club: "Académie de Danse Sfax", points: 1540, gold: 1, silver: 1, bronze: 3 },
                  { name: "Ahmed Dridi", club: "Urban Crew Tunis", points: 1420, gold: 0, silver: 3, bronze: 2 },
                  { name: "Fatma Zouari", club: "Street Dance Sfax", points: 1310, gold: 0, silver: 2, bronze: 4 },
                  { name: "Salma Mansour", club: "Dance Academy Sousse", points: 1200, gold: 0, silver: 2, bronze: 2 },
                ],
                en: [
                  { name: "Amira Ben Ali", club: "Tunis Star Club", points: 2850, gold: 5, silver: 2, bronze: 1 },
                  { name: "Karim Bouazizi", club: "Urban Crew Tunis", points: 2720, gold: 4, silver: 3, bronze: 2 },
                  { name: "Sara Mejri", club: "Free Dance Company", points: 2680, gold: 4, silver: 2, bronze: 3 },
                  { name: "Sami Trabelsi", club: "Sfax Dance Academy", points: 2510, gold: 3, silver: 4, bronze: 1 },
                  { name: "Leila Hamdi", club: "Sousse Dance Academy", points: 2340, gold: 3, silver: 2, bronze: 3 },
                  { name: "Omar Selmi", club: "National Troupe", points: 2180, gold: 2, silver: 3, bronze: 4 },
                  { name: "Mohamed Ferjani", club: "Street Dance Sfax", points: 2050, gold: 2, silver: 2, bronze: 3 },
                  { name: "Ines Chaabane", club: "Sousse Dance Factory", points: 1920, gold: 1, silver: 4, bronze: 2 },
                  { name: "Nour El Houda", club: "Nabeul Dance Studio", points: 1870, gold: 1, silver: 3, bronze: 3 },
                  { name: "Myriam Aouadi", club: "Modern Studio Tunis", points: 1750, gold: 1, silver: 2, bronze: 4 },
                  { name: "Youssef Karim", club: "Tunis Star Club", points: 1680, gold: 1, silver: 2, bronze: 2 },
                  { name: "Rami Jebali", club: "Sfax Dance Academy", points: 1540, gold: 1, silver: 1, bronze: 3 },
                  { name: "Ahmed Dridi", club: "Urban Crew Tunis", points: 1420, gold: 0, silver: 3, bronze: 2 },
                  { name: "Fatma Zouari", club: "Street Dance Sfax", points: 1310, gold: 0, silver: 2, bronze: 4 },
                  { name: "Salma Mansour", club: "Sousse Dance Academy", points: 1200, gold: 0, silver: 2, bronze: 2 },
                ],
                ar: [
                  { name: "أميرة بن علي", club: "نادي نجم تونس", points: 2850, gold: 5, silver: 2, bronze: 1 },
                  { name: "كريم بوعزيزي", club: "فريق أوربن تونس", points: 2720, gold: 4, silver: 3, bronze: 2 },
                  { name: "سارة المجري", club: "فرقة الرقص الحر", points: 2680, gold: 4, silver: 2, bronze: 3 },
                  { name: "سامي الطرابلسي", club: "أكاديمية الرقص صفاقس", points: 2510, gold: 3, silver: 4, bronze: 1 },
                  { name: "ليلى حمدي", club: "أكاديمية الرقص سوسة", points: 2340, gold: 3, silver: 2, bronze: 3 },
                  { name: "عمر السالمي", club: "الفرقة الوطنية", points: 2180, gold: 2, silver: 3, bronze: 4 },
                  { name: "محمد الفرجاني", club: "ستريت دانس صفاقس", points: 2050, gold: 2, silver: 2, bronze: 3 },
                  { name: "إيناس الشعباني", club: "مصنع الرقص سوسة", points: 1920, gold: 1, silver: 4, bronze: 2 },
                  { name: "نور الهدى", club: "استوديو الرقص نابل", points: 1870, gold: 1, silver: 3, bronze: 3 },
                  { name: "مريم العوادي", club: "استوديو مودرن تونس", points: 1750, gold: 1, silver: 2, bronze: 4 },
                  { name: "يوسف كريم", club: "نادي نجم تونس", points: 1680, gold: 1, silver: 2, bronze: 2 },
                  { name: "رامي الجبالي", club: "أكاديمية الرقص صفاقس", points: 1540, gold: 1, silver: 1, bronze: 3 },
                  { name: "أحمد الدريدي", club: "فريق أوربن تونس", points: 1420, gold: 0, silver: 3, bronze: 2 },
                  { name: "فاطمة الزواري", club: "ستريت دانس صفاقس", points: 1310, gold: 0, silver: 2, bronze: 4 },
                  { name: "سلمى منصور", club: "أكاديمية الرقص سوسة", points: 1200, gold: 0, silver: 2, bronze: 2 },
                ],
              };
              const ranking = rankingData[lang] || rankingData.fr;

              return (
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
                        <TableRow key={idx} className={idx < 3 ? "bg-muted/30" : ""}>
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
                </motion.div>
              );
            })()}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ResultsPage;
