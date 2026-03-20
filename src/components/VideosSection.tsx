import { Play } from "lucide-react";
import heroBg from "@/assets/hero-dance.jpg";
import { useLang } from "@/contexts/LangContext";

const VideosSection = () => {
  const { t } = useLang();

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="section-title">{t("videos.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 relative rounded-xl md:rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src={heroBg} alt={t("videos.main")} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center group-hover:bg-primary/50 transition-colors">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center">
                <Play className="w-5 h-5 md:w-7 md:h-7 text-accent-foreground ms-0.5 md:ms-1" />
              </div>
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center group cursor-pointer shrink-0 min-w-[200px] md:min-w-0">
                <div className="relative w-24 md:w-28 h-14 md:h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={heroBg} alt={`${t("videos.performance")} ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
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
