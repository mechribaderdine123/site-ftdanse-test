import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { Lang } from "@/lib/translations";

const langLabels: Record<Lang, string> = { fr: "FR", en: "EN", ar: "عر" };

const TopBar = () => {
  const { lang, setLang, t } = useLang();

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground text-xs py-2 border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <a href="tel:+21671285649" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">+(216) 71 285 649</span>
          </a>
          <a href="mailto:contact@ftdap.org.tn" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Mail className="w-3 h-3" />
            <span className="hidden sm:inline">contact@ftdap.org.tn</span>
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span className="hidden md:inline">Tunis, Tunisie</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  l === lang
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
          <span className="text-primary-foreground/50">|</span>
          <span className="text-primary-foreground/80 hidden sm:inline">{t("topbar.follow")}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
