import { useState } from "react";
import { Menu, X, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/hooks/useAuth";
import logoFtdap from "@/assets/logo-ftdap.png";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLang();

  const session = user
    ? {
        kind: user.accountType === "club" ? ("club" as const) : ("individual" as const),
        fullName: user.fullName || user.email,
      }
    : null;

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
      <div className="container mx-auto flex items-center justify-between h-14 md:h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoFtdap} alt="FTDAP Logo" className="h-8 md:h-10 w-auto" />
        </Link>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative text-sm text-primary hover:text-primary transition-colors pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          {session ? (
            <Link
              to="/member"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted transition-colors"
            >
              {session.kind === "club" ? (
                <Building2 className="w-4 h-4 text-violet-600" />
              ) : (
                <User className="w-4 h-4 text-blue-600" />
              )}
              <span className="max-w-[120px] truncate">{session.fullName}</span>
            </Link>
          ) : (
            <Link to="/member/login" className="btn-primary text-sm py-2 px-4">
              {t("nav.join")}
            </Link>
          )}
        </div>

        <button
          className="lg:hidden text-primary p-2 -mr-2 active:scale-95 transition-transform"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sheet Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[280px] bg-white p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <img src={logoFtdap} alt="FTDAP Logo" className="h-8 w-auto" />
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-5 py-3 text-sm text-primary font-medium hover:bg-muted hover:text-accent transition-colors border-b border-border/40 last:border-0"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            {session ? (
              <Link
                to="/member"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm font-medium text-primary hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
              >
                {session.kind === "club" ? (
                  <Building2 className="w-4 h-4 text-violet-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
                <span className="truncate">{session.fullName}</span>
              </Link>
            ) : (
              <Link
                to="/member/login"
                className="btn-primary text-sm py-3 px-4 block text-center rounded-xl"
                onClick={() => setOpen(false)}
              >
                {t("nav.join")}
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
