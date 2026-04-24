import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "@/contexts/LangContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import CompetitionsPage from "./pages/CompetitionsPage";
import CompetitionDetailPage from "./pages/CompetitionDetailPage";
import ResultsPage from "./pages/ResultsPage";
import DisciplinesPage from "./pages/DisciplinesPage";
import AnnuairePage from "./pages/AnnuairePage";
import MediathequePage from "./pages/MediathequePage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminNews from "./pages/admin/AdminNews";
import AdminCompetitions from "./pages/admin/AdminCompetitions";
import AdminResults from "./pages/admin/AdminResults";
import AdminDirectory from "./pages/admin/AdminDirectory";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminAbout from "./pages/admin/AdminAbout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LangProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/disciplines" element={<DisciplinesPage />} />
              <Route path="/annuaire" element={<AnnuairePage />} />
              <Route path="/mediatheque" element={<MediathequePage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="competitions" element={<AdminCompetitions />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="directory" element={<AdminDirectory />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="about" element={<AdminAbout />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LangProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
