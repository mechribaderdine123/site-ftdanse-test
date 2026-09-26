import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users, Clock, CheckCircle2, XCircle, Plus, ArrowUpRight,
  Loader2, Newspaper, Trophy, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "@/lib/api";

interface DirectoryEntry {
  id: number;
  accountType: "athlete" | "coach" | "referee" | "club";
  name: string;
  city: string;
  discipline: string;
  licenseActive: boolean;
}

interface AccountRequest {
  id: number;
  accountType: "athlete" | "coach" | "referee" | "club";
  fullName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
}

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  createdAt: string;
}

interface Competition {
  id: number;
  name: string;
  date: string;
  location: string;
}

const Dashboard = () => {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [directoryData, requestsData, newsData, competitionsData] = await Promise.all([
        apiRequest<DirectoryEntry[]>("/api/directory").catch(() => []),
        apiRequest<AccountRequest[]>("/api/admin/account-requests").catch(() => []),
        apiRequest<NewsItem[]>("/api/admin/news").catch(() => []),
        apiRequest<Competition[]>("/api/admin/competitions").catch(() => []),
      ]);
      setEntries(directoryData || []);
      setRequests(requestsData || []);
      setNews(newsData || []);
      setCompetitions(competitionsData || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const approvedCount = entries.filter((e) => e.licenseActive).length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedRequests = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

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

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Profils approuvés</p>
                  <p className="text-3xl font-bold">{approvedCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-700">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Demandes en attente</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-700">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Demandes approuvées</p>
                  <p className="text-3xl font-bold">{approvedRequests}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Demandes refusées</p>
                  <p className="text-3xl font-bold">{rejectedCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100 text-red-700">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actualités récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Actualités récentes ({news.length})</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/admin/news">Voir tout <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {news.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition">
                  <h4 className="text-sm font-medium truncate">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
              {news.length === 0 && (
                <p className="text-center text-muted-foreground py-6">Aucune actualité</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compétitions à venir */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Compétitions à venir ({competitions.length})</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/admin/competitions">Voir tout <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {competitions.slice(0, 5).map((comp) => (
                <div key={comp.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition">
                  <h4 className="text-sm font-medium truncate">{comp.name}</h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{new Date(comp.date).toLocaleDateString("fr-FR")}</span>
                    <span>{comp.location}</span>
                  </div>
                </div>
              ))}
              {competitions.length === 0 && (
                <p className="text-center text-muted-foreground py-6">Aucune compétition</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demandes en attente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Demandes en attente ({pendingCount})</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/admin/directory">Gérer <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.filter((r) => r.status === "pending").slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{req.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {req.accountType === "athlete" ? "Athlète" : req.accountType === "coach" ? "Coach" : req.accountType === "referee" ? "Arbitre" : "Club"}
                </Badge>
              </div>
            ))}
            {pendingCount === 0 && (
              <p className="text-center text-muted-foreground py-6">Aucune demande en attente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
