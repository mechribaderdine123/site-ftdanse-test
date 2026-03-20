import { motion } from "framer-motion";
import g1 from "@/assets/gallery1.jpg";
import g2 from "@/assets/gallery2.jpg";
import g3 from "@/assets/gallery3.jpg";
import g4 from "@/assets/gallery4.jpg";
import g5 from "@/assets/gallery5.jpg";
import g6 from "@/assets/gallery6.jpg";
import { useLang } from "@/contexts/LangContext";

const images = [g1, g2, g3, g4, g5, g6];

const GallerySection = () => {
  const { t } = useLang();

  return (
    <section id="gallery" className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="section-title">{t("gallery.title")}</h2>
          <p className="text-muted-foreground text-sm mt-2">{t("gallery.desc")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
          {images.map((img, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="rounded-lg md:rounded-xl overflow-hidden aspect-[4/3] card-hover">
              <img src={img} alt={`${t("gallery.title")} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
