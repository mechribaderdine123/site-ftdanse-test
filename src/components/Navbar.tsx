import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { Lang } from "@/lib/translations";

const langLabels: Record<Lang, string> = { fr: "FR", en: "EN", ar: "عر" };

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, lang, setLang } = useLang();

  const navLinks = [
    { label: t("nav.home"), href: "#" },
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
        <a href="#" className="text-xl font-bold text-primary-foreground tracking-tight">
          <span className="text-accent">●</span> FTDAP
        </a>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors px-2 py-1 rounded-md border border-primary-foreground/20"
            >
              <Globe className="w-4 h-4" />
              {langLabels[lang]}
            </button>
            {langOpen && (
              <div className="absolute top-full mt-1 end-0 bg-card rounded-lg shadow-lg border border-border py-1 min-w-[100px] z-50">
                {(Object.keys(langLabels) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`block w-full text-start px-4 py-2 text-sm transition-colors ${
                      l === lang ? "text-accent font-semibold bg-muted" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {l === "fr" ? "Français" : l === "en" ? "English" : "العربية"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/contact" className="btn-primary text-sm py-2 px-4">
            {t("nav.join")}
          </Link>
        </div>

        <button
          className="lg:hidden text-primary-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-primary border-t border-primary-foreground/10 pb-4">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                to={link.href}
                className="block px-6 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="block px-6 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground"
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
                    : "border-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground"
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
