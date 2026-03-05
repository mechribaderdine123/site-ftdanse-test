import { motion } from "framer-motion";
import breakdanceImg from "@/assets/style-breakdance.jpg";
import hiphopImg from "@/assets/style-hiphop.jpg";
import contemporainImg from "@/assets/style-contemporain.jpg";

const styles = [
  { img: breakdanceImg, name: "Break Dance" },
  { img: hiphopImg, name: "Hip-Hop" },
  { img: contemporainImg, name: "Contemporain" },
];

const DanceStylesSection = () => {
  return (
    <section id="styles" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">Explorez</span>
          <h2 className="section-title mt-2">Styles de Danse pour Tous</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {styles.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer card-hover aspect-[3/4]"
            >
              <img
                src={s.img}
                alt={s.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold text-primary-foreground">{s.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="#" className="btn-primary inline-block">
            Découvrir Tous les Styles
          </a>
        </div>
      </div>
    </section>
  );
};

export default DanceStylesSection;
