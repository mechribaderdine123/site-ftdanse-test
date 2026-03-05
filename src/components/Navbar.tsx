import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Accueil", href: "#" },
  { label: "À Propos", href: "#about" },
  { label: "Actualités", href: "#news" },
  { label: "Compétitions", href: "#competitions" },
  { label: "Styles de Danse", href: "#styles" },
  { label: "Galerie", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="text-xl font-bold text-primary-foreground tracking-tight">
          <span className="text-accent">●</span> FTDAP
        </a>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="hidden lg:inline-flex btn-primary text-sm py-2 px-4"
        >
          Nous Rejoindre
        </a>
        <button
          className="lg:hidden text-primary-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-primary border-t border-primary-foreground/10 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-6 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="px-6 pt-2">
            <a href="#contact" className="btn-primary text-sm py-2 px-4 inline-block">
              Nous Rejoindre
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
