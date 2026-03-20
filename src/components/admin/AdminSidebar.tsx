import {
  LayoutDashboard,
  Newspaper,
  Trophy,
  Medal,
  Music,
  Users,
  Image,
  Handshake,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
import { Link } from "react-router-dom";

const mainItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard },
  { title: "Actualités", url: "/admin/news", icon: Newspaper },
  { title: "Compétitions", url: "/admin/competitions", icon: Trophy },
  { title: "Résultats", url: "/admin/results", icon: Medal },
  { title: "Disciplines", url: "/admin/disciplines", icon: Music },
  { title: "Annuaire", url: "/admin/directory", icon: Users },
  { title: "Médiathèque", url: "/admin/media", icon: Image },
  { title: "Partenaires", url: "/admin/partners", icon: Handshake },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && "Administration"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Retour au site">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                {!collapsed && <span>Retour au site</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
