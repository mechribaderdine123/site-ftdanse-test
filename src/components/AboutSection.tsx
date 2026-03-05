import { motion } from "framer-motion";
import { Users, Trophy, Globe } from "lucide-react";
import aboutImg from "@/assets/dance-about.jpg";

const features = [
  { icon: Users, title: "Communauté Unie", desc: "Plus de 500 danseurs réunis autour d'une passion commune." },
  { icon: Trophy, title: "Compétitions Nationales", desc: "Organisation de championnats et événements à travers le pays." },
  { icon: Globe, title: "Rayonnement International", desc: "Représentation de la Tunisie dans les compétitions mondiales." },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">À Propos</span>
            <h2 className="section-title mt-2 mb-6">
              La Fédération Tunisienne de Danse et des Activités Parallèles
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Fondée en 2010, la FTDAP est l'organe officiel de la danse en Tunisie. Notre mission est de promouvoir, développer et structurer la pratique de la danse sous toutes ses formes à travers le territoire national. Nous accompagnons les clubs, formons les juges et organisons les compétitions officielles.
            </p>
            <a href="#contact" className="btn-primary inline-block">
              En Savoir Plus
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <img
              src={aboutImg}
              alt="Danseur en performance"
              className="rounded-2xl w-full h-64 object-cover mb-6"
            />
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
