import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold text-primary-foreground mb-4">
              <span className="text-accent">●</span> FTDAP
            </h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Fédération Tunisienne de Danse et des Activités Parallèles. Promouvoir la danse sous toutes ses formes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Accueil</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">À Propos</a></li>
              <li><a href="#news" className="hover:text-primary-foreground transition-colors">Actualités</a></li>
              <li><a href="#competitions" className="hover:text-primary-foreground transition-colors">Compétitions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground">Ressources</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Clubs</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Arbitrage</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Règlements</a></li>
              <li><a href="#styles" className="hover:text-primary-foreground transition-colors">Styles de Danse</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary-foreground">Contact</h4>
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
                Cité Nationale Sportive, Tunis, Tunisie
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-primary-foreground/40">
          © 2026 FTDAP – Fédération Tunisienne de Danse et des Activités Parallèles. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
