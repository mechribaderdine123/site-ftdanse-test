import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Newspaper, Trophy, Users, Image, Medal, TrendingUp,
  ArrowUpRight, Plus, Calendar, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { newsData } from "@/data/newsData";

const stats = [
  { title: "Actualités", value: newsData.length, change: "+2 ce mois", icon: Newspaper, color: "from-blue-500 to-blue-600", url: "/admin/news" },
  { title: "Compétitions", value: 5, change: "+1 à venir", icon: Trophy, color: "from-amber-500 to-orange-600", url: "/admin/competitions" },
  { title: "Résultats", value: 12, change: "Mis à jour", icon: Medal, color: "from-emerald-500 to-green-600", url: "/admin/results" },
  { title: "Membres", value: 24, change: "+3 ce mois", icon: Users, color: "from-violet-500 to-purple-600", url: "/admin/directory" },
  { title: "Médias", value: 36, change: "+5 cette semaine", icon: Image, color: "from-pink-500 to-rose-600", url: "/admin/media" },
  { title: "Visiteurs ce mois", value: "1.2K", change: "+12% vs dernier", icon: TrendingUp, color: "from-cyan-500 to-teal-600", url: "/admin" },
];

const recentActivity = [
  { action: "Nouvelle actualité publiée", detail: "Championnat National 2025", time: "Il y a 2h", icon: Newspaper, color: "text-blue-600 bg-blue-100" },
  { action: "Résultats ajoutés", detail: "Coupe de Tunisie", time: "Il y a 5h", icon: Medal, color: "text-emerald-600 bg-emerald-100" },
  { action: "Nouveau membre", detail: "Yasmine Hamdi", time: "Hier", icon: Users, color: "text-violet-600 bg-violet-100" },
  { action: "Photos ajoutées", detail: "Festival de Danse (5)", time: "Il y a 2j", icon: Image, color: "text-pink-600 bg-pink-100" },
  { action: "Compétition créée", detail: "Open International", time: "Il y a 3j", icon: Trophy, color: "text-amber-600 bg-amber-100" },
];

const upcomingEvents = [
  { title: "Championnat National 2025", date: "15 Mars", location: "Tunis" },
  { title: "Open International", date: "10 Juin", location: "Hammamet" },
  { title: "Festival de Danse", date: "28 Fév", location: "Sfax" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme FTDAP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/news"><Plus className="mr-2 h-4 w-4" /> Article</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/competitions"><Plus className="mr-2 h-4 w-4" /> Compétition</Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.url}>
            <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-3`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Activité récente</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              Voir tout <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Événements à venir</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground shrink-0">
                    <span className="text-xs font-medium uppercase">{event.date.split(" ")[1]}</span>
                    <span className="text-base font-bold leading-none">{event.date.split(" ")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link to="/admin/competitions">Gérer les compétitions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
