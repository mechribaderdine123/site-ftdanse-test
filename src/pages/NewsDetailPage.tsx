import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Image, FileText, Download } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { newsData } from "@/data/newsData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const documents = [
  { name: "Plan_Strategique_2026-2030.pdf", type: "PDF", size: "2.4 Mo" },
  { name: "Synthese_Plan_Strategique.pdf", type: "PDF", size: "580 Ko" },
  { name: "Budget_Previsionnel.xlsx", type: "XLSX", size: "1.1 Mo" },
];

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const article = newsData.find((n) => n.id === Number(id));

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{t("nd.notFound")}</h1>
          <Link to="/news" className="text-accent font-semibold hover:underline">
            {t("nd.backToNews")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-16 bg-primary">
        <div className="container mx-auto px-4 py-10">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nd.backToNews")}
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 text-[11px] font-semibold rounded-md bg-accent text-accent-foreground">
              {article.category === "competition" ? t("np.competition") : t("np.event")}
            </span>
            <span className="flex items-center gap-1.5 text-primary-foreground/60 text-sm">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground max-w-2xl leading-tight">
            {t(article.titleKey)}
          </h1>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="prose-sm md:prose text-muted-foreground leading-relaxed space-y-6"
          >
            {t(article.bodyKey).split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </motion.div>

          {/* Photo Gallery */}
          <motion.div
            className="mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary mb-5">
              <Image className="w-5 h-5" />
              {t("nd.gallery")}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {article.galleryImages.map((img, i) => (
                <div key={i} className="group">
                  <img
                    src={img}
                    alt={`${t(article.titleKey)} - ${i + 1}`}
                    className="rounded-xl w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    {t(`nd.caption${i + 1}`)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Attached Documents */}
          <motion.div
            className="mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary mb-5">
              <FileText className="w-5 h-5" />
              {t("nd.documents")}
            </h2>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} — {doc.size}</p>
                  </div>
                  <button className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
