import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import news1 from "@/assets/news1.jpg";
import news2 from "@/assets/news2.jpg";
import news3 from "@/assets/news3.jpg";
import { useLang } from "@/contexts/LangContext";

const NewsSection = () => {
  const { t } = useLang();

  const articles = [
    { img: news1, date: t("news.article1.date"), title: t("news.article1.title"), desc: t("news.article1.desc") },
    { img: news2, date: t("news.article2.date"), title: t("news.article2.title"), desc: t("news.article2.desc") },
    { img: news3, date: t("news.article3.date"), title: t("news.article3.title"), desc: t("news.article3.desc") },
  ];

  return (
    <section id="news" className="py-14 md:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <span className="section-label">{t("news.label")}</span>
            <h2 className="section-title mt-2">{t("news.title")}</h2>
          </div>
          <a href="#" className="hidden md:flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            {t("news.viewAll")} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {articles.map((a, i) => (
            <motion.article key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-card rounded-xl md:rounded-2xl overflow-hidden card-hover shadow-sm">
              <img src={a.img} alt={a.title} className="w-full h-40 md:h-48 object-cover" />
              <div className="p-4 md:p-5">
                <span className="text-xs text-muted-foreground">{a.date}</span>
                <h3 className="font-bold text-sm md:text-base mt-1 mb-1.5 md:mb-2 text-foreground">{a.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3">{a.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
        {/* Mobile "View All" */}
        <div className="md:hidden text-center mt-6">
          <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            {t("news.viewAll")} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
