import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { useContent, contentUrl } from "@/lib/contentApi";
import {
  Target, Eye, Flag, Clock, TrendingUp, Star,
  User, Users, FileText, DollarSign, Briefcase,
  Landmark, Building2, Globe2, Award
} from "lucide-react";

import heroDanceImg from "@/assets/hero-dance.jpg";
import danceAboutImg from "@/assets/dance-about.jpg";
import styleBreakdanceImg from "@/assets/style-breakdance.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AboutPage = () => {
  const { t } = useLang();
  const { items } = useContent<{
    id: number;
    heroImage?: string;
    heroTitle1?: string;
    heroTitle2?: string;
    heroDesc?: string;
    pratiquesImage?: string;
    pratiquesTitle1?: string;
    pratiquesTitle2?: string;
    pratiquesDesc?: string;
    bureau?: { id: string; name: string; role: string; date: string }[];
    timeline?: { id: string; year: string; title: string; desc: string }[];
  }>("about");
  const about = items[0];
  const heroImg = about?.heroImage ? contentUrl(about.heroImage) : heroDanceImg;
  const pratiquesImg = about?.pratiquesImage ? contentUrl(about.pratiquesImage) : danceAboutImg;
  const heroTitle1 = about?.heroTitle1 || t("ap.intro.title1");
  const heroTitle2 = about?.heroTitle2 || t("ap.intro.title2");
  const heroDesc = about?.heroDesc || t("ap.intro.desc");
  const pratiquesTitle1 = about?.pratiquesTitle1 || t("ap.pratiques.title1");
  const pratiquesTitle2 = about?.pratiquesTitle2 || t("ap.pratiques.title2");
  const pratiquesDesc = about?.pratiquesDesc || t("ap.pratiques.desc");
  const bureauFallback = [
    { icon: User, key: "president" },
    { icon: Users, key: "vice" },
    { icon: FileText, key: "secretary" },
    { icon: DollarSign, key: "treasurer" },
    { icon: Briefcase, key: "technical" },
  ];
  const bureauEntries = (about?.bureau && about.bureau.length > 0
    ? about.bureau.map((b, i) => ({ icon: bureauFallback[i]?.icon || User, key: b.id, name: b.name, role: b.role, date: b.date }))
    : bureauFallback.map(({ icon, key }) => ({ icon, key, name: t(`ap.bureau.${key}.name`), role: t(`ap.bureau.${key}.role`), date: t(`ap.bureau.${key}.date`) })));

  const missionCards = [
    { icon: Target, key: "mission" },
    { icon: Eye, key: "vision" },
    { icon: Flag, key: "objectifs" },
  ];

  const timeline = [
    { icon: Clock, year: "1989", key: "creation" },
    { icon: TrendingUp, year: "2008–2020", key: "evolution" },
    { icon: Star, year: "2020–2024", key: "moments" },
  ];

  const commissions = [
    "arbitrage", "formation", "competitions",
    "discipline", "medical", "communication",
  ];

  const partners = [
    { icon: Landmark, key: "partner1" },
    { icon: Building2, key: "partner2" },
    { icon: Landmark, key: "partner3" },
    { icon: Building2, key: "partner4" },
    { icon: Landmark, key: "partner5" },
    { icon: Building2, key: "partner6" },
  ];

  const affiliations = [
    { icon: Landmark, key: "affil1" },
    { icon: Building2, key: "affil2" },
    { icon: Globe2, key: "affil3" },
    { icon: Award, key: "affil4" },
    { icon: Globe2, key: "affil5" },
    { icon: Award, key: "affil6" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero Row 1: Single large image + intro text */}
      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-2 gap-10 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <img
              src={heroImg}
              alt="Dance performance"
              className="rounded-2xl w-full h-72 md:h-80 object-cover"
            />
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight mb-4">
                {heroTitle1}{" "}
                <span className="italic text-accent">{heroTitle2}</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {heroDesc}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Row 2: Image + pratiques */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-2 gap-10 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <img
              src={pratiquesImg}
              alt="Dance group"
              className="rounded-2xl w-full h-72 md:h-80 object-cover"
            />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                {pratiquesTitle1}{" "}
                <span className="italic text-accent">{pratiquesTitle2}</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
                {pratiquesDesc}
              </p>
              <div className="flex flex-wrap gap-2">
                {["Breakdance", "Hip-Hop", "Contemporain", "Jazz", "Classique", "Danse Sportive"].map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision / Objectifs */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {missionCards.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl p-6"
              >
                <div className="w-12 h-12 mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-base font-bold text-accent mb-2">
                  {t(`ap.${key}.title`)}
                </h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  {t(`ap.${key}.desc`)}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Historique (Timeline) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title">{t("ap.history.title")}</h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2 rtl:left-auto rtl:right-6 rtl:md:right-1/2 rtl:md:translate-x-1/2" />

            {timeline.map(({ icon: Icon, year, key }, i) => (
              <motion.div
                key={key}
                className={`relative flex items-start mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="absolute left-6 md:left-1/2 w-12 h-12 -translate-x-1/2 rounded-full bg-accent flex items-center justify-center z-10 rtl:left-auto rtl:right-6 rtl:md:right-1/2 rtl:translate-x-1/2">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>

                <div
                  className={`ml-20 md:ml-0 rtl:ml-0 rtl:mr-20 rtl:md:mr-0 md:w-[calc(50%-2rem)] ${
                    i % 2 === 0
                      ? "md:pr-8 md:text-right rtl:md:pr-0 rtl:md:pl-8 rtl:md:text-left"
                      : "md:pl-8 md:text-left rtl:md:pl-0 rtl:md:pr-8 rtl:md:text-right"
                  }`}
                >
                  <span className="text-sm font-bold text-accent">{year}</span>
                  <h3 className="text-lg font-bold text-primary mt-1">
                    {t(`ap.timeline.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t(`ap.timeline.${key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bureau Fédéral */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title">{t("ap.bureau.title")}</h2>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {/* Top row: 3 members */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {bureauEntries.slice(0, 3).map(({ icon: Icon, key, name, role, date }) => (
                <div
                  key={key}
                  className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 card-hover"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">{name}</h4>
                    <p className="text-accent text-xs font-semibold mt-0.5">{role}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{date}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Bottom row: 2 members centered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {bureauEntries.slice(3).map(({ icon: Icon, key, name, role, date }) => (
                <div
                  key={key}
                  className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 card-hover"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">{name}</h4>
                    <p className="text-accent text-xs font-semibold mt-0.5">{role}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Commissions */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title text-2xl">{t("ap.commissions.title")}</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {commissions.map((key) => (
              <div
                key={key}
                className="bg-card rounded-lg border border-border py-3 px-5 text-center card-hover"
              >
                <span className="font-medium text-primary text-sm">
                  {t(`ap.commission.${key}`)}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partenaires */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title text-accent">{t("ap.partners.mainTitle")}</h2>
          </motion.div>
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-muted-foreground font-medium">{t("ap.partners.title")}</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {partners.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center text-center card-hover min-h-[120px]"
              >
                <Icon className="w-8 h-8 text-accent mb-3" />
                <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {t(`ap.${key}`)}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Affiliations Internationales */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="section-title">{t("ap.affiliations.title")}</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {affiliations.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center text-center card-hover min-h-[120px]"
              >
                <Icon className="w-8 h-8 text-accent mb-3" />
                <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {t(`ap.${key}`)}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
