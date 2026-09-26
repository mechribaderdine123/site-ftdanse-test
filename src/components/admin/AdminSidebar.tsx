import {
  LayoutDashboard,
  Newspaper,
  Trophy,
  Medal,
  Users,
  Image,
  LogOut,
  ArrowLeft,
  Info,
  Music2,
  BadgeCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import logoFtdap from "@/assets/logo-ftdap.png";

const menuItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard },
  { title: "Page À propos", url: "/admin/about", icon: Info },
  { title: "Actualités", url: "/admin/news", icon: Newspaper },
  { title: "Compétitions", url: "/admin/competitions", icon: Trophy },
  { title: "Résultats", url: "/admin/results", icon: Medal },
  { title: "Styles de Danse", url: "/admin/disciplines", icon: Music2 },
  { title: "Annuaire & Validations", url: "/admin/directory", icon: Users },
  { title: "Médiathèque", url: "/admin/media", icon: Image },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

  // Compteur de validations en attente (badge sur l'entrée Annuaire).
  const [validationsCount, setValidationsCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ approvalStatus?: string }[]>("/api/admin/license-requests").catch(() => []),
      apiRequest<{ status?: string }[]>("/api/admin/activation-requests").catch(() => []),
      apiRequest<{ status?: string }[]>("/api/admin/club-member-renewals").catch(() => []),
      apiRequest<{ status?: string }[]>("/api/admin/license-renewals").catch(() => []),
    ])
      .then(([clubLicenses, activations, memberRenewals, individualRenewals]) => {
        if (cancelled) return;
        setValidationsCount(
          clubLicenses.filter((r) => r.approvalStatus === "pending").length +
          activations.filter((r) => r.status === "pending").length +
          memberRenewals.filter((r) => r.status === "pending").length +
          individualRenewals.filter((r) => r.status === "submitted").length,
        );
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center px-3 py-4 min-w-0">
            {/* Logo paysage (209x60) : ratio préservé, sur pastille blanche pour
                rester lisible sur le fond bleu foncé de la sidebar. */}
            <div className="shrink-0 rounded-lg bg-white px-2 py-1.5 flex items-center justify-center">
              <img
                src={logoFtdap}
                alt="FTDAP"
                className={`object-contain ${collapsed ? "h-6 max-w-8" : "h-8 w-auto max-w-[150px]"}`}
              />
            </div>
          </div>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && item.url === "/admin/directory" && validationsCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium">
                          {validationsCount}
                        </span>
                      )}
                      {collapsed && item.url === "/admin/directory" && validationsCount > 0 && (
                        <BadgeCheck className="absolute top-1 right-1 w-3 h-3 text-destructive" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && (
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au site
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Déconnexion"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
