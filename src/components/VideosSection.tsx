import { Play } from "lucide-react";
import heroBg from "@/assets/hero-dance.jpg";
import { useLang } from "@/contexts/LangContext";

const VideosSection = () => {
  const { t } = useLang();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title">{t("videos.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src={heroBg} alt={t("videos.main")} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center group-hover:bg-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <Play className="w-7 h-7 text-accent-foreground ms-1" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center group cursor-pointer">
                <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={heroBg} alt={`${t("videos.performance")} ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                    {t("videos.performance")} {i}
                  </h4>
                  <p className="text-xs text-muted-foreground">2:30</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideosSection;
