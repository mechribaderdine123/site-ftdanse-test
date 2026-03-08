import { Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Column 1: FTDAP Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs">
                FT
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary-foreground">FTDAP</h3>
                <p className="text-[10px] text-primary-foreground/50">{t("footer.subtitle")}</p>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/60 leading-relaxed">{t("footer.desc")}</p>
          </div>

          {/* Column 2: Liens Rapides */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground uppercase tracking-wider">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-xs text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("nav.home")}</a></li>
              <li><a href="/about" className="hover:text-primary-foreground transition-colors">{t("nav.about")}</a></li>
              <li><a href="#styles" className="hover:text-primary-foreground transition-colors">{t("nav.styles")}</a></li>
              <li><a href="#competitions" className="hover:text-primary-foreground transition-colors">{t("nav.competitions")}</a></li>
              <li><a href="#news" className="hover:text-primary-foreground transition-colors">{t("nav.news")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.results")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.directory")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.documents")}</a></li>
            </ul>
          </div>

          {/* Column 3: Disciplines */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground uppercase tracking-wider">{t("footer.disciplines")}</h4>
            <ul className="space-y-2 text-xs text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.classique")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Jazz</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Hip-Hop</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.contemporain")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.worldDance")}</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground uppercase tracking-wider">{t("footer.contactUs")}</h4>
            <ul className="space-y-3 text-xs text-primary-foreground/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                {t("footer.address")}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                +216 71 265 640
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                contact@ftdap.org.tn
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <span className="text-primary-foreground text-xs font-bold">f</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <span className="text-primary-foreground text-xs font-bold">in</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-primary-foreground/40">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
