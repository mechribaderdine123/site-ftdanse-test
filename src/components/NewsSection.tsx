import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import news1 from "@/assets/news1.jpg";
import news2 from "@/assets/news2.jpg";
import news3 from "@/assets/news3.jpg";

const articles = [
  {
    img: news1,
    date: "15 Fév 2026",
    title: "Championnat National de Break Dance 2026",
    desc: "La 8ème édition du championnat national se tiendra à Tunis avec plus de 200 participants.",
  },
  {
    img: news2,
    date: "02 Mar 2026",
    title: "Stage International de Hip-Hop à Sousse",
    desc: "Des chorégraphes internationaux animeront un stage de 3 jours ouvert à tous les niveaux.",
  },
  {
    img: news3,
    date: "20 Mar 2026",
    title: "Gala de Fin de Saison – Théâtre Municipal",
    desc: "Un spectacle regroupant tous les styles de danse pour célébrer la saison 2025-2026.",
  },
];

const NewsSection = () => {
  return (
    <section id="news" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="section-label">Actualités</span>
            <h2 className="section-title mt-2">Dernières Nouvelles</h2>
          </div>
          <a href="#" className="hidden md:flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            Tout Voir <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden card-hover shadow-sm"
            >
              <img src={a.img} alt={a.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <span className="text-xs text-muted-foreground">{a.date}</span>
                <h3 className="font-bold text-base mt-1 mb-2 text-foreground">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
