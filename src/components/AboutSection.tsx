import { motion } from "framer-motion";
import { Users, Trophy, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import aboutImg from "@/assets/dance-about.jpg";
import { useLang } from "@/contexts/LangContext";

const AboutSection = () => {
  const { t } = useLang();

  const features = [
    { icon: Users, title: t("about.feat1.title"), desc: t("about.feat1.desc") },
    { icon: Trophy, title: t("about.feat2.title"), desc: t("about.feat2.desc") },
    { icon: Globe, title: t("about.feat3.title"), desc: t("about.feat3.desc") },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-label">{t("about.label")}</span>
            <h2 className="section-title mt-2 mb-6">{t("about.title")}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">{t("about.desc")}</p>
            <Link to="/about" className="btn-primary inline-block">{t("about.cta")}</Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <img src={aboutImg} alt="Dance performance" className="rounded-2xl w-full h-64 object-cover mb-6" />
            <div className="grid gap-4">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4 p-4 bg-muted rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
