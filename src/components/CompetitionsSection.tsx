import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

const competitions = [
  { date: "15", month: "MAR", title: "Championnat Régional – Tunis", location: "Cité de la Culture, Tunis", color: "bg-accent" },
  { date: "22", month: "AVR", title: "Coupe de Tunisie de Hip-Hop", location: "Palais des Sports, Sousse", color: "bg-primary" },
  { date: "08", month: "MAI", title: "Open International de Breakdance", location: "Salle Omnisports, Sfax", color: "bg-accent" },
  { date: "15", month: "JUN", title: "Gala Compétitif National", location: "Théâtre Municipal, Tunis", color: "bg-primary" },
  { date: "22", month: "JUL", title: "Festival International de Danse", location: "Amphithéâtre, El Jem", color: "bg-accent" },
];

const CompetitionsSection = () => {
  return (
    <section id="competitions" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <span className="section-label">Calendrier</span>
        <h2 className="section-title mt-2 mb-2">Prochaines Compétitions</h2>
        <p className="text-muted-foreground mb-10 max-w-lg">
          Retrouvez les dates clés de la saison et ne manquez aucun événement.
        </p>

        <div className="space-y-3">
          {competitions.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-accent/30 transition-colors group"
            >
              <div className={`${c.color} text-primary-foreground w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0`}>
                <span className="text-lg font-bold leading-none">{c.date}</span>
                <span className="text-[10px] uppercase">{c.month}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">{c.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {c.location}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompetitionsSection;
