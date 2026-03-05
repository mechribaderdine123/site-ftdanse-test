import { Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold text-primary-foreground mb-4">
              <span className="text-accent">●</span> FTDAP
            </h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("nav.home")}</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">{t("nav.about")}</a></li>
              <li><a href="#news" className="hover:text-primary-foreground transition-colors">{t("nav.news")}</a></li>
              <li><a href="#competitions" className="hover:text-primary-foreground transition-colors">{t("nav.competitions")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground">{t("footer.resources")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.clubs")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.refereeing")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.regulations")}</a></li>
              <li><a href="#styles" className="hover:text-primary-foreground transition-colors">{t("nav.styles")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                contact@ftdap.tn
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                +216 71 000 000
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                {t("footer.address")}
              </li>
            </ul>
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
