import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Trophy, Users, Image, Medal, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Actualités", value: 9, icon: Newspaper, href: "/admin/news", color: "text-blue-600" },
  { label: "Compétitions", value: 5, icon: Trophy, href: "/admin/competitions", color: "text-amber-600" },
  { label: "Résultats", value: 12, icon: Medal, href: "/admin/results", color: "text-emerald-600" },
  { label: "Membres", value: 48, icon: Users, href: "/admin/directory", color: "text-violet-600" },
  { label: "Médias", value: 36, icon: Image, href: "/admin/media", color: "text-rose-600" },
  { label: "Partenaires", value: 6, icon: Handshake, href: "/admin/partners", color: "text-teal-600" },
];

const recentActivity = [
  { action: "Nouvel article publié", detail: "Championnat National 2024", time: "Il y a 2h" },
  { action: "Compétition mise à jour", detail: "Open de Casablanca", time: "Il y a 5h" },
  { action: "Nouveau membre inscrit", detail: "Ahmed Benali", time: "Il y a 1 jour" },
  { action: "Résultat ajouté", detail: "Coupe du Maroc — Standard", time: "Il y a 2 jours" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue d'ensemble de votre site
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-2xl font-bold tabular-nums">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.action}</p>
                  <p className="text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Ajouter un article", href: "/admin/news" },
              { label: "Créer une compétition", href: "/admin/competitions" },
              { label: "Ajouter un résultat", href: "/admin/results" },
              { label: "Ajouter un membre", href: "/admin/directory" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center justify-center p-3 rounded-lg border border-border text-sm font-medium text-primary hover:bg-muted transition-colors active:scale-[0.97]"
              >
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
