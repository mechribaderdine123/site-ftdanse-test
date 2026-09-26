import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div dir="ltr" className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-background/80 backdrop-blur sticky top-0 z-10 px-4 md:px-6 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
              <div className="hidden md:block">
                <h1 className="text-base font-semibold text-foreground leading-tight">Administration FTDAP</h1>
                <p className="text-xs text-muted-foreground">Panneau de gestion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Recherche globale..." className="pl-9 h-9 bg-muted/50 border-0" />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {user.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
