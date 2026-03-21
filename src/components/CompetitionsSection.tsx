import { motion } from "framer-motion";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";

const CompetitionsSection = () => {
  const { t } = useLang();

  const competitions = [
    {
      date: "15", month: t("comp.month.mar"), year: "2024",
      title: t("comp.1"),
      location: t("comp.1.loc"),
      athletes: t("comp.athletes200"),
      status: t("comp.status.open"),
      statusColor: "bg-green-500",
      disciplines: [t("comp.disc.classique"), t("comp.disc.contemporain")],
    },
    {
      date: "28", month: t("comp.month.apr"), year: "2024",
      title: t("comp.2"),
      location: t("comp.2.loc"),
      athletes: t("comp.athletes350"),
      status: t("comp.status.soon"),
      statusColor: "bg-accent",
      disciplines: [t("comp.disc.hiphop"), t("comp.disc.jazz"), t("comp.disc.contemporain")],
    },
    {
      date: "12", month: t("comp.month.may"), year: "2024",
      title: t("comp.3"),
      location: t("comp.3.loc"),
      athletes: t("comp.athletes150"),
      status: t("comp.status.soon"),
      statusColor: "bg-accent",
      disciplines: [t("comp.disc.breaking"), t("comp.disc.hiphop"), t("comp.disc.freestyle")],
    },
    {
      date: "08", month: t("comp.month.jun"), year: "2024",
      title: t("comp.4"),
      location: t("comp.4.loc"),
      athletes: t("comp.athletes500"),
      status: t("comp.status.upcoming"),
      statusColor: "bg-primary",
      disciplines: [t("comp.disc.all")],
    },
    {
      date: "20", month: t("comp.month.jul"), year: "2024",
      title: t("comp.5"),
      location: t("comp.5.loc"),
      athletes: t("comp.athletes300"),
      status: t("comp.status.upcoming"),
      statusColor: "bg-primary",
      disciplines: [t("comp.disc.classique"), t("comp.disc.jazz"), t("comp.disc.contemporain")],
    },
  ];

  return (
    <section id="competitions" className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-10">
          <div>
            <span className="section-label">{t("comp.label")}</span>
            <h2 className="section-title mt-2 mb-2">{t("comp.title")}</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg">{t("comp.desc")}</p>
          </div>
          <Link
            to="/competitions"
            className="flex items-center gap-2 text-accent font-semibold text-sm mt-4 md:mt-0 hover:underline"
          >
            {t("comp.fullCalendar")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {competitions.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 md:p-5 bg-card rounded-xl md:rounded-2xl border border-border hover:shadow-lg transition-all group"
            >
              {/* Date badge + Status (mobile) */}
              <div className="flex items-center gap-3 sm:block">
                <div className="bg-primary text-primary-foreground w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg sm:text-xl font-bold leading-none">{c.date}</span>
                  <span className="text-[10px] uppercase tracking-wide">{c.month}</span>
                  <span className="text-[9px] opacity-70">{c.year}</span>
                </div>
                {/* Status visible on mobile next to date */}
                <div className="sm:hidden flex-1">
                  <h4 className="font-bold text-sm text-foreground leading-snug">{c.title}</h4>
                  <span className={`${c.statusColor} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1`}>
                    ● {c.status}
                  </span>
                </div>
              </div>

              {/* Content - desktop */}
              <div className="flex-1 min-w-0 hidden sm:block">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 className="font-bold text-foreground">{c.title}</h4>
                  <span className={`${c.statusColor} text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full`}>
                    ● {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {c.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {c.athletes}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {c.disciplines.map((d) => (
                    <span key={d} className="text-[11px] text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mobile-only meta */}
              <div className="sm:hidden space-y-1.5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {c.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {c.athletes}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {c.disciplines.map((d) => (
                    <span key={d} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details button */}
              <Link
                to="/competitions"
                className="shrink-0 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <Users className="w-4 h-4" /> {t("comp.detailsBtn")}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompetitionsSection;
