import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.news"), href: "/news" },
    { label: t("nav.competitions"), href: "/competitions" },
    { label: t("nav.results"), href: "/results" },
    { label: t("nav.styles"), href: "/disciplines" },
    { label: t("nav.annuaire"), href: "/annuaire" },
    { label: t("nav.mediatheque"), href: "/mediatheque" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  return (
    <nav className="fixed top-[36px] left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="text-xl font-bold text-primary tracking-tight">
          <span className="text-accent">●</span> FTDAP
        </a>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-sm text-primary hover:text-primary transition-colors pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm text-primary hover:text-primary transition-colors pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            )
          )}
        </div>
        <div className="hidden lg:flex items-center gap-3">

          <Link to="/contact" className="btn-primary text-sm py-2 px-4">
            {t("nav.join")}
          </Link>
        </div>

        <button
          className="lg:hidden text-primary"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-primary/10 pb-4">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                to={link.href}
                className="block px-6 py-2 text-sm text-primary hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="block px-6 py-2 text-sm text-primary hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <div className="px-6 pt-3 flex items-center gap-2">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  l === lang
                    ? "bg-accent border-accent text-accent-foreground"
                    : "border-primary/20 text-primary/70 hover:text-primary"
                }`}
              >
                {l === "fr" ? "FR" : l === "en" ? "EN" : "عر"}
              </button>
            ))}
          </div>
          <div className="px-6 pt-2">
            <Link to="/contact" className="btn-primary text-sm py-2 px-4 inline-block" onClick={() => setOpen(false)}>
              {t("nav.join")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
