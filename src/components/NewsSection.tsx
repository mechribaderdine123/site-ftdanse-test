import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { useContent, contentUrl } from "@/lib/contentApi";

interface ApiNews {
  id: number;
  title?: string;
  titleKey?: string;
  description?: string;
  descKey?: string;
  date?: string;
  image?: string;
  category?: string;
}

const NewsSection = () => {
  const { t } = useLang();
  const { items, isFallback } = useContent<ApiNews>("news");

  // Static fallback items carry translation keys; API rows carry real text.
  const articles = items.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title || (item.titleKey ? t(item.titleKey) : ""),
    desc: item.description || (item.descKey ? t(item.descKey) : ""),
    date: item.date || "",
    image: contentUrl(item.image || ""),
  }));

  return (
    <section id="news" className="py-14 md:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <span className="section-label">{t("news.label")}</span>
            <h2 className="section-title mt-2">{t("news.title")}</h2>
          </div>
          <Link to="/news" className="hidden md:flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            {t("news.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {isFallback && (
          <p className="text-xs text-muted-foreground mb-4">Articles d'exemple — publiez vos actualités depuis l'administration.</p>
        )}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {articles.map((a) => (
            <motion.article key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-card rounded-xl md:rounded-2xl overflow-hidden card-hover shadow-sm">
              {a.image ? (
                <img src={a.image} alt={a.title} className="w-full h-40 md:h-48 object-cover" />
              ) : (
                <div className="w-full h-40 md:h-48 bg-muted" />
              )}
              <div className="p-4 md:p-5">
                <span className="text-xs text-muted-foreground">{a.date}</span>
                <h3 className="font-bold text-sm md:text-base mt-1 mb-1.5 md:mb-2 text-foreground line-clamp-2">{a.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3">{a.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
        {articles.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucune actualité pour le moment.</p>
        )}
        {/* Mobile "View All" */}
        <div className="md:hidden text-center mt-6">
          <Link to="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            {t("news.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
