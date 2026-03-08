import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Target, Eye, Flag, Clock, TrendingUp, Star,
  User, Users, FileText, DollarSign, Briefcase,
  Gavel, GraduationCap, Trophy, ShieldAlert, HeartPulse, Megaphone,
  Building2, Landmark, Globe2, Award
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

  const bureau = [
    { icon: User, key: "president" },
    { icon: Users, key: "vice" },
    { icon: FileText, key: "secretary" },
    { icon: DollarSign, key: "treasurer" },
    { icon: Briefcase, key: "technical" },
  ];

  const commissions = [
    { icon: Gavel, key: "arbitrage" },
    { icon: GraduationCap, key: "formation" },
    { icon: Trophy, key: "competitions" },
    { icon: ShieldAlert, key: "discipline" },
    { icon: HeartPulse, key: "medical" },
    { icon: Megaphone, key: "communication" },
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
    { icon: Globe2, key: "affil1" },
    { icon: Award, key: "affil2" },
    { icon: Globe2, key: "affil3" },
    { icon: Award, key: "affil4" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero / Intro Section */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Row 1: Images + Intro Text */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 items-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="grid grid-cols-2 gap-3">
              <img
                src={heroDanceImg}
                alt="Dance"
                className="rounded-xl w-full h-48 object-cover"
              />
              <img
                src={danceAboutImg}
                alt="Dance"
                className="rounded-xl w-full h-48 object-cover"
              />
            </div>
            <div>
              <p className="section-label mb-2">{t("ap.label")}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight mb-4">
                {t("ap.intro.title1")}{" "}
                <span className="italic text-accent">{t("ap.intro.title2")}</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {t("ap.intro.desc")}
              </p>
            </div>
          </motion.div>

          {/* Row 2: Pratiques */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {t("ap.pratiques.title1")}{" "}
                <span className="italic text-accent">{t("ap.pratiques.title2")}</span>
              </h2>
              <p className="text-muted-foreground mb-4">{t("ap.pratiques.desc")}</p>
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
            <img
              src={styleBreakdanceImg}
              alt="Pratiques"
              className="rounded-xl w-full h-56 object-cover"
            />
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
                className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold text-accent mb-2">
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
            <p className="section-label mb-2">{t("ap.history.label")}</p>
            <h2 className="section-title">{t("ap.history.title")}</h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute start-6 md:start-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

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
                {/* Dot */}
                <div className="absolute start-6 md:start-1/2 w-12 h-12 -translate-x-1/2 rounded-full bg-accent flex items-center justify-center z-10">
                  <Icon className="w-5 h-5 text-accent-foreground" />
                </div>

                {/* Content */}
                <div
                  className={`ms-20 md:ms-0 md:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "md:pe-8 md:text-end" : "md:ps-8"
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
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="section-label mb-2">{t("ap.bureau.label")}</p>
            <h2 className="section-title">{t("ap.bureau.title")}</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {bureau.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-card rounded-xl border border-border p-5 text-center card-hover"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-bold text-primary text-sm">
                  {t(`ap.bureau.${key}.name`)}
                </h4>
                <p className="text-accent text-xs font-semibold mt-1">
                  {t(`ap.bureau.${key}.role`)}
                </p>
                <p className="text-muted-foreground text-[11px] mt-1">
                  {t(`ap.bureau.${key}.date`)}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Commissions */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="section-label mb-2">{t("ap.commissions.label")}</p>
            <h2 className="section-title">{t("ap.commissions.title")}</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {commissions.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 card-hover"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-semibold text-primary text-sm">
                  {t(`ap.commission.${key}`)}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partenaires Institutionnels */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="section-label mb-2">{t("ap.partners.label")}</p>
            <h2 className="section-title">{t("ap.partners.title")}</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 md:grid-cols-6 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {partners.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-card rounded-xl border border-border p-4 flex flex-col items-center justify-center text-center card-hover"
              >
                <Icon className="w-8 h-8 text-primary mb-2" />
                <span className="text-xs font-medium text-muted-foreground">
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
            <p className="section-label mb-2">{t("ap.affiliations.label")}</p>
            <h2 className="section-title">{t("ap.affiliations.title")}</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {affiliations.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center text-center card-hover"
              >
                <Icon className="w-8 h-8 text-accent mb-2" />
                <span className="text-xs font-medium text-foreground">
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
