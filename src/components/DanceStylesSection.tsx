import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import breakdanceImg from "@/assets/style-breakdance.jpg";
import hiphopImg from "@/assets/style-hiphop.jpg";
import contemporainImg from "@/assets/style-contemporain.jpg";
import { useLang } from "@/contexts/LangContext";

const DanceStylesSection = () => {
  const { t, isRTL } = useLang();

  const styles = [
    { img: breakdanceImg, nameKey: "disc.breakdance.title", descKey: "disc.breakdance.desc" },
    { img: hiphopImg, nameKey: "disc.hiphop.title", descKey: "disc.hiphop.desc" },
    { img: contemporainImg, nameKey: "disc.contemporary.title", descKey: "disc.contemporary.desc" },
  ];

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="styles" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">{t("styles.label")}</span>
          <h2 className="section-title mt-2">{t("styles.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {styles.map((s, i) => (
            <motion.div
              key={s.nameKey}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-[3/4]"
            >
              <img src={s.img} alt={t(s.nameKey)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/90 via-accent/40 to-transparent" />
              <div className="absolute bottom-0 start-0 end-0 p-5 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-primary-foreground">{t(s.nameKey)}</h3>
                <p className="text-primary-foreground/80 text-xs leading-relaxed line-clamp-3">
                  {t(s.descKey)}
                </p>
                <span className="inline-flex items-center gap-1 text-primary-foreground text-xs font-semibold mt-1 group-hover:gap-2 transition-all">
                  {t("disc.discover")} <Arrow className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/disciplines" className="btn-primary inline-block">{t("styles.cta")}</Link>
        </div>
      </div>
    </section>
  );
};

export default DanceStylesSection;
