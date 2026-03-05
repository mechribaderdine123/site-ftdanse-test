import { motion } from "framer-motion";
import heroBg from "@/assets/hero-dance.jpg";
import { useLang } from "@/contexts/LangContext";

const HeroSection = () => {
  const { t } = useLang();

  const stats = [
    { value: "25+", label: t("hero.stat1") },
    { value: "500+", label: t("hero.stat2") },
    { value: "6", label: t("hero.stat3") },
    { value: "80+", label: t("hero.stat4") },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-end overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/30" />
      <div className="relative container mx-auto px-4 pb-16 pt-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
          <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-primary-foreground leading-tight mb-4">
            {t("hero.title1")}<br />
            {t("hero.title2")}<br />
            <span className="text-accent">{t("hero.title3")}</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-md">{t("hero.desc")}</p>
          <div className="flex gap-4 mb-12">
            <a href="#contact" className="btn-primary">{t("hero.cta")}</a>
            <a href="#about" className="btn-outline-white">{t("hero.more")}</a>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-xl">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-xs text-primary-foreground/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
