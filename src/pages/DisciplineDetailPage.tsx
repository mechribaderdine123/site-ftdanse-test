import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { disciplinesData } from "@/data/disciplinesData";

const DisciplineDetailPage = () => {
  const { slug } = useParams();
  const discipline = disciplinesData.find((d) => d.slug === slug);

  if (!discipline) return <Navigate to="/disciplines" replace />;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${discipline.image})` }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/disciplines"
            className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux disciplines
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
            {discipline.name}
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl">{discipline.shortDesc}</p>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="section-title mb-4">À propos de ce style</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {discipline.longDesc}
            </p>
          </div>
          <aside className="space-y-4">
            {discipline.origin && (
              <div className="rounded-xl border border-border p-5 bg-card">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <MapPin className="w-4 h-4 text-accent" /> Origine
                </div>
                <p className="text-sm text-muted-foreground">{discipline.origin}</p>
              </div>
            )}
            {discipline.characteristics && discipline.characteristics.length > 0 && (
              <div className="rounded-xl border border-border p-5 bg-card">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Sparkles className="w-4 h-4 text-accent" /> Caractéristiques
                </div>
                <ul className="flex flex-wrap gap-2">
                  {discipline.characteristics.map((c) => (
                    <li
                      key={c}
                      className="text-xs px-3 py-1 rounded-full bg-muted text-foreground/80"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Galerie */}
      {discipline.gallery.length > 0 && (
        <section className="py-12 md:py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="section-title mb-6 text-center">Galerie</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {discipline.gallery.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl overflow-hidden aspect-[4/3]"
                >
                  <img
                    src={img}
                    alt={`${discipline.name} ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default DisciplineDetailPage;