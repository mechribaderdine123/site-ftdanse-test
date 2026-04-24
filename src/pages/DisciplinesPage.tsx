import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { disciplinesData } from "@/data/disciplinesData";

const DisciplinesPage = () => {
  const { t, isRTL } = useLang();

  const disciplines = disciplinesData;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors">
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rotate-180" />}
            {t("disc.back")}
          </Link>
          <span className="block text-accent text-sm font-semibold mb-2">{t("disc.label")}</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            {t("disc.title")}
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            {t("disc.subtitle")}
          </p>
        </div>
      </section>

      {/* Disciplines Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {disciplines.map((d, i) => (
              <motion.div
                key={d.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link
                  to={`/disciplines/${d.slug}`}
                  className="relative block rounded-2xl overflow-hidden group cursor-pointer aspect-[3/4]"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/90 via-accent/40 to-transparent" />
                  <div className="absolute bottom-0 start-0 end-0 p-5 flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-primary-foreground">{d.name}</h3>
                    <p className="text-primary-foreground/80 text-xs leading-relaxed line-clamp-3">
                      {d.shortDesc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary-foreground text-xs font-semibold mt-1 group-hover:gap-2 transition-all">
                      {t("disc.discover")} <Arrow className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DisciplinesPage;
