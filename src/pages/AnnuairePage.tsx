import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, ArrowRight, Users, User, Award, Dumbbell, Building2, MapPin, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type MemberType = "dancer" | "referee" | "coach";
type EntryType = "member" | "club";
type FilterCategory = "all" | "dancers" | "referees" | "coaches" | "clubs";

interface MemberEntry {
  type: "member";
  name: string;
  memberType: MemberType;
  disciplines: string[];
  club: string;
  city: string;
  level: string;
  licenseActive: boolean;
  org?: string;
}

interface ClubEntry {
  type: "club";
  name: string;
  city: string;
  disciplines: string[];
  members: number;
  licenseActive: boolean;
}

type Entry = MemberEntry | ClubEntry;

const membersDataByLang: Record<string, Entry[]> = {
  fr: [
    { type: "member", name: "Sara Mansouri", memberType: "dancer", disciplines: ["Classique"], club: "Club Tunis", city: "Tunis", level: "Élite", licenseActive: true },
    { type: "member", name: "Yasmine Jebali", memberType: "dancer", disciplines: ["Contemporain"], club: "Académie Sousse", city: "Sousse", level: "Élite", licenseActive: true },
    { type: "member", name: "Amina Ben Hassen", memberType: "dancer", disciplines: ["Hip-Hop"], club: "Club Sfax", city: "Sfax", level: "Avancé", licenseActive: true },
    { type: "member", name: "Karim Hadi", memberType: "dancer", disciplines: ["Breaking"], club: "Troupe Hammamet", city: "Nabeul", level: "Élite", licenseActive: true },
    { type: "member", name: "Abdallah Kaabi", memberType: "referee", disciplines: ["Classique", "Contemporain"], club: "Tunis", city: "Tunis", level: "International", licenseActive: true, org: "WDSF" },
    { type: "member", name: "Fatma Zahra", memberType: "dancer", disciplines: ["Hip-Hop"], club: "Sousse", city: "Sousse", level: "National", licenseActive: true, org: "FTDAP" },
    { type: "member", name: "Mohamed Arbi", memberType: "coach", disciplines: ["Classique", "Jazz"], club: "Club Tunis", city: "Tunis", level: "Expert", licenseActive: true, org: "WDSF Coach" },
    { type: "member", name: "Leila Mansouri", memberType: "coach", disciplines: ["Contemporain"], club: "Académie Sousse", city: "Sousse", level: "Premier", licenseActive: true, org: "FTDAP Coach" },
    { type: "club", name: "Club Tunis Danse", city: "Tunis", disciplines: ["Classique", "Jazz", "Contemporain"], members: 85, licenseActive: true },
    { type: "club", name: "Académie Sousse Danse", city: "Sousse", disciplines: ["Classique", "Contemporain", "Hip-Hop"], members: 72, licenseActive: true },
    { type: "club", name: "Club Sfax Danse", city: "Sfax", disciplines: ["Hip-Hop", "Breaking"], members: 45, licenseActive: true },
    { type: "club", name: "Troupe Hammamet", city: "Nabeul", disciplines: ["Jazz", "Contemporain"], members: 38, licenseActive: true },
  ],
  en: [
    { type: "member", name: "Sara Mansouri", memberType: "dancer", disciplines: ["Classical"], club: "Tunis Club", city: "Tunis", level: "Elite", licenseActive: true },
    { type: "member", name: "Yasmine Jebali", memberType: "dancer", disciplines: ["Contemporary"], club: "Sousse Academy", city: "Sousse", level: "Elite", licenseActive: true },
    { type: "member", name: "Amina Ben Hassen", memberType: "dancer", disciplines: ["Hip-Hop"], club: "Sfax Club", city: "Sfax", level: "Advanced", licenseActive: true },
    { type: "member", name: "Karim Hadi", memberType: "dancer", disciplines: ["Breaking"], club: "Hammamet Troupe", city: "Nabeul", level: "Elite", licenseActive: true },
    { type: "member", name: "Abdallah Kaabi", memberType: "referee", disciplines: ["Classical", "Contemporary"], club: "Tunis", city: "Tunis", level: "International", licenseActive: true, org: "WDSF" },
    { type: "member", name: "Fatma Zahra", memberType: "dancer", disciplines: ["Hip-Hop"], club: "Sousse", city: "Sousse", level: "National", licenseActive: true, org: "FTDAP" },
    { type: "member", name: "Mohamed Arbi", memberType: "coach", disciplines: ["Classical", "Jazz"], club: "Tunis Club", city: "Tunis", level: "Expert", licenseActive: true, org: "WDSF Coach" },
    { type: "member", name: "Leila Mansouri", memberType: "coach", disciplines: ["Contemporary"], club: "Sousse Academy", city: "Sousse", level: "Premier", licenseActive: true, org: "FTDAP Coach" },
    { type: "club", name: "Tunis Dance Club", city: "Tunis", disciplines: ["Classical", "Jazz", "Contemporary"], members: 85, licenseActive: true },
    { type: "club", name: "Sousse Dance Academy", city: "Sousse", disciplines: ["Classical", "Contemporary", "Hip-Hop"], members: 72, licenseActive: true },
    { type: "club", name: "Sfax Dance Club", city: "Sfax", disciplines: ["Hip-Hop", "Breaking"], members: 45, licenseActive: true },
    { type: "club", name: "Hammamet Troupe", city: "Nabeul", disciplines: ["Jazz", "Contemporary"], members: 38, licenseActive: true },
  ],
  ar: [
    { type: "member", name: "سارة المنصوري", memberType: "dancer", disciplines: ["كلاسيكي"], club: "نادي تونس", city: "تونس", level: "نخبة", licenseActive: true },
    { type: "member", name: "ياسمين الجبالي", memberType: "dancer", disciplines: ["معاصر"], club: "أكاديمية سوسة", city: "سوسة", level: "نخبة", licenseActive: true },
    { type: "member", name: "أمينة بن حسن", memberType: "dancer", disciplines: ["هيب هوب"], club: "نادي صفاقس", city: "صفاقس", level: "متقدم", licenseActive: true },
    { type: "member", name: "كريم الهادي", memberType: "dancer", disciplines: ["بريكنغ"], club: "فرقة الحمامات", city: "نابل", level: "نخبة", licenseActive: true },
    { type: "member", name: "عبد الله الكعبي", memberType: "referee", disciplines: ["كلاسيكي", "معاصر"], club: "تونس", city: "تونس", level: "دولي", licenseActive: true, org: "WDSF" },
    { type: "member", name: "فاطمة الزهراء", memberType: "dancer", disciplines: ["هيب هوب"], club: "سوسة", city: "سوسة", level: "وطني", licenseActive: true, org: "FTDAP" },
    { type: "member", name: "محمد العربي", memberType: "coach", disciplines: ["كلاسيكي", "جاز"], club: "نادي تونس", city: "تونس", level: "خبير", licenseActive: true, org: "مدرب WDSF" },
    { type: "member", name: "ليلى المنصوري", memberType: "coach", disciplines: ["معاصر"], club: "أكاديمية سوسة", city: "سوسة", level: "أول", licenseActive: true, org: "مدرب FTDAP" },
    { type: "club", name: "نادي تونس للرقص", city: "تونس", disciplines: ["كلاسيكي", "جاز", "معاصر"], members: 85, licenseActive: true },
    { type: "club", name: "أكاديمية سوسة للرقص", city: "سوسة", disciplines: ["كلاسيكي", "معاصر", "هيب هوب"], members: 72, licenseActive: true },
    { type: "club", name: "نادي صفاقس للرقص", city: "صفاقس", disciplines: ["هيب هوب", "بريكنغ"], members: 45, licenseActive: true },
    { type: "club", name: "فرقة الحمامات", city: "نابل", disciplines: ["جاز", "معاصر"], members: 38, licenseActive: true },
  ],
};

const AnnuairePage = () => {
  const { t, isRTL } = useLang();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterCategory>("all");

  const filters: { key: FilterCategory; labelKey: string; icon: typeof Users }[] = [
    { key: "all", labelKey: "ann.filter.all", icon: Users },
    { key: "dancers", labelKey: "ann.filter.dancers", icon: User },
    { key: "referees", labelKey: "ann.filter.referees", icon: Award },
    { key: "coaches", labelKey: "ann.filter.coaches", icon: Dumbbell },
    { key: "clubs", labelKey: "ann.filter.clubs", icon: Building2 },
  ];

  const filtered = membersData.filter((entry) => {
    const matchSearch = entry.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.city.toLowerCase().includes(search.toLowerCase()) ||
      entry.disciplines.some(d => d.toLowerCase().includes(search.toLowerCase()));

    if (filter === "all") return matchSearch;
    if (filter === "clubs") return entry.type === "club" && matchSearch;
    if (filter === "dancers") return entry.type === "member" && (entry as MemberEntry).memberType === "dancer" && matchSearch;
    if (filter === "referees") return entry.type === "member" && (entry as MemberEntry).memberType === "referee" && matchSearch;
    if (filter === "coaches") return entry.type === "member" && (entry as MemberEntry).memberType === "coach" && matchSearch;
    return matchSearch;
  });

  const getMemberIcon = (entry: Entry) => {
    if (entry.type === "club") return <Building2 className="w-6 h-6 text-muted-foreground" />;
    return <User className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
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

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.name + i}
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
                    <p className="text-accent text-xs font-medium">{entry.disciplines.join(", ")}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {entry.type === "member" && (
                    <>
                      <p>{(entry as MemberEntry).club}</p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {entry.city}
                      </p>
                      {(entry as MemberEntry).org && (
                        <p>{(entry as MemberEntry).org}</p>
                      )}
                    </>
                  )}
                  {entry.type === "club" && (
                    <>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {entry.city}
                      </p>
                      <p>{(entry as ClubEntry).members} {t("ann.members")}</p>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2">
                  {entry.type === "member" ? (
                    <span className="text-[11px] border border-border rounded-md px-2.5 py-1 text-muted-foreground">
                      {(entry as MemberEntry).level}
                    </span>
                  ) : (
                    <span />
                  )}
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnnuairePage;
