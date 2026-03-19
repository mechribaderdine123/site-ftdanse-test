import { motion } from "framer-motion";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";

const CompetitionsSection = () => {
  const { t } = useLang();

  const competitions = [
    {
      date: "15", month: "MARS", year: "2024",
      title: "Championnat Régional - Tunis",
      location: "Salle Omnisports El Menzah",
      athletes: "200+ athlètes",
      status: "Inscriptions ouvertes",
      statusColor: "bg-green-500",
      disciplines: ["Classique", "Contemporain"],
    },
    {
      date: "28", month: "AVR", year: "2024",
      title: "Coupe de Tunisie – Demi-finales",
      location: "Centre Culturel de Sousse",
      athletes: "350+ athlètes",
      status: "Bientôt",
      statusColor: "bg-accent",
      disciplines: ["Hip-Hop", "Jazz", "Contemporain"],
    },
    {
      date: "12", month: "MAI", year: "2024",
      title: "Battle Urbaine Nationale",
      location: "Cité de la Culture, Tunis",
      athletes: "150+ danseurs",
      status: "Bientôt",
      statusColor: "bg-accent",
      disciplines: ["Breaking", "Hip-Hop", "Freestyle"],
    },
    {
      date: "08", month: "JUIN", year: "2024",
      title: "Finale Championnat National",
      location: "Palais des Sports, Ben Arous",
      athletes: "500+ athlètes",
      status: "À venir",
      statusColor: "bg-primary",
      disciplines: ["Toutes disciplines"],
    },
    {
      date: "20", month: "JUIL", year: "2024",
      title: "Gala International de Danse",
      location: "Théâtre Municipal de Tunis",
      athletes: "300+ artistes",
      status: "À venir",
      statusColor: "bg-primary",
      disciplines: ["Classique", "Jazz", "Contemporain"],
    },
  ];

  return (
    <section id="competitions" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <span className="section-label">{t("comp.label")}</span>
            <h2 className="section-title mt-2 mb-2">{t("comp.title")}</h2>
            <p className="text-muted-foreground max-w-lg">{t("comp.desc")}</p>
          </div>
          <Link
            to="/competitions"
            className="flex items-center gap-2 text-accent font-semibold text-sm mt-4 md:mt-0 hover:underline"
          >
            Calendrier complet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {competitions.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-5 p-5 bg-card rounded-2xl border border-border hover:shadow-lg transition-all group"
            >
              {/* Date badge */}
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-bold leading-none">{c.date}</span>
                <span className="text-[10px] uppercase tracking-wide">{c.month}</span>
                <span className="text-[9px] opacity-70">{c.year}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
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

              {/* Details button */}
              <Link
                to="/competitions"
                className="shrink-0 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Users className="w-4 h-4" /> Détails
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompetitionsSection;
