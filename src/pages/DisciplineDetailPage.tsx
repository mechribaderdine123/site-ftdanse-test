import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useContent, contentUrl } from "@/lib/contentApi";
import { disciplinesData } from "@/data/disciplinesData";

interface ApiDiscipline {
  id: number;
  slug: string;
  name: string;
  shortDesc: string;
  longDesc?: string;
  image?: string;
  gallery?: string[];
  origin?: string;
  characteristics?: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const DisciplineDetailPage = () => {
  const { slug } = useParams();
  const { t, isRTL } = useLang();
  const { items } = useContent<ApiDiscipline>("disciplines");

  const usingApi = items.some((d) => typeof d.shortDesc === "string" && !d.shortDesc.startsWith("disc."));
  const apiDiscipline = items.find((d) => d.slug === slug);
  const staticDiscipline = disciplinesData.find((d) => d.slug === slug);

  const discipline: ApiDiscipline | null = usingApi && apiDiscipline
    ? {
        ...apiDiscipline,
        image: contentUrl(apiDiscipline.image || ""),
        gallery: (apiDiscipline.gallery || []).map(contentUrl),
      }
    : staticDiscipline
      ? {
          id: -1,
          slug: staticDiscipline.slug,
          name: staticDiscipline.name,
          shortDesc: staticDiscipline.shortDesc,
          longDesc: staticDiscipline.longDesc,
          image: staticDiscipline.image,
          gallery: staticDiscipline.gallery,
          origin: staticDiscipline.origin,
          characteristics: staticDiscipline.characteristics,
        }
      : null;

  if (!discipline) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{t("disc.notFound") || "Discipline introuvable"}</h1>
          <Link to="/disciplines" className="text-accent font-semibold hover:underline">{t("disc.back")}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const paragraphs = (discipline.longDesc || discipline.shortDesc || "").split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary pt-28 pb-20 overflow-hidden">
        {discipline.image && (
          <>
            <img src={discipline.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
          </>
        )}
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/disciplines" className="inline-flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-6 transition-colors">
            <Arrow className="w-4 h-4 rotate-180" />
            {t("disc.back")}
          </Link>
          <span className="block text-accent text-sm font-semibold mb-2">{t("disc.label")}</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">{discipline.name}</h1>
          <p className="text-primary-foreground/85 max-w-2xl text-sm md:text-base">{discipline.shortDesc}</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-5 text-muted-foreground leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>

          {discipline.origin && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 bg-card"
            >
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-medium text-foreground">Origine :</span> {discipline.origin}
            </motion.div>
          )}

          {(discipline.characteristics?.length ?? 0) > 0 && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-10">
              <h2 className="section-title text-xl mb-5">{t("disc.characteristics") || "Caractéristiques"}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {discipline.characteristics!.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-sm">{c}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(discipline.gallery?.length ?? 0) > 0 && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-12">
              <h2 className="section-title text-xl mb-5">Galerie</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {discipline.gallery!.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden aspect-[4/3] group">
                    <img src={img} alt={`${discipline.name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DisciplineDetailPage;
