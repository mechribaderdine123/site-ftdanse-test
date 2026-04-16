import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Trophy, Users, Image, Medal, TrendingUp } from "lucide-react";
import { newsData } from "@/data/newsData";

const stats = [
  { title: "Actualités", value: newsData.length, icon: Newspaper, color: "text-blue-600 bg-blue-100" },
  { title: "Compétitions", value: 5, icon: Trophy, color: "text-amber-600 bg-amber-100" },
  { title: "Résultats", value: 12, icon: Medal, color: "text-green-600 bg-green-100" },
  { title: "Membres", value: 24, icon: Users, color: "text-purple-600 bg-purple-100" },
  { title: "Médias", value: 36, icon: Image, color: "text-pink-600 bg-pink-100" },
  { title: "Visiteurs ce mois", value: "1.2K", icon: TrendingUp, color: "text-emerald-600 bg-emerald-100" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tableau de bord</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre site</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Nouvelle actualité publiée", time: "Il y a 2 heures" },
              { action: "Résultats de compétition ajoutés", time: "Il y a 5 heures" },
              { action: "Nouveau membre inscrit", time: "Hier" },
              { action: "Photos ajoutées à la médiathèque", time: "Il y a 2 jours" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{item.action}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
