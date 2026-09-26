import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, ArrowLeft } from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VerifyResult {
  valid: boolean;
  active?: boolean;
  licenseNumber?: string;
  fullName?: string;
  accountType?: string;
  city?: string | null;
  discipline?: string | null;
  clubName?: string | null;
  season?: string | null;
  checkedAt?: string;
  error?: string;
}

const typeLabels: Record<string, string> = {
  athlete: "Athlète", coach: "Coach", referee: "Arbitre", club: "Club",
};

const VerifyPage = () => {
  const { license = "" } = useParams();
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState("loading");
      try {
        const response = await fetch(`/api/verify/${encodeURIComponent(license)}`);
        const data = (await response.json().catch(() => null)) as VerifyResult | null;
        if (cancelled) return;
        setResult(data);
        setState("done");
      } catch {
        if (!cancelled) setState("error");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [license]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Vérification de licence</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Résultat officiel pour le numéro <span className="font-mono font-semibold">{license}</span>
          </p>

          {state === "loading" && (
            <Card>
              <CardContent className="py-14 flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Vérification en cours…</p>
              </CardContent>
            </Card>
          )}

          {state === "error" && (
            <Card className="border-red-200">
              <CardContent className="py-14 flex flex-col items-center gap-3 text-center">
                <ShieldQuestion className="h-12 w-12 text-red-500" />
                <p className="font-semibold">Service de vérification indisponible</p>
                <p className="text-sm text-muted-foreground">Réessayez plus tard.</p>
              </CardContent>
            </Card>
          )}

          {state === "done" && (!result || !result.valid) && (
            <Card className="border-red-200 bg-red-50/40">
              <CardContent className="py-14 flex flex-col items-center gap-3 text-center">
                <ShieldAlert className="h-12 w-12 text-red-500" />
                <p className="font-semibold">Licence introuvable</p>
                <p className="text-sm text-muted-foreground">
                  Aucune licence FTDAP ne correspond à ce numéro. Vérifiez le code scanné.
                </p>
              </CardContent>
            </Card>
          )}

          {state === "done" && result?.valid && (
            <Card className={result.active ? "border-green-200 bg-green-50/40" : "border-yellow-200 bg-yellow-50/40"}>
              <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
                {result.active ? (
                  <ShieldCheck className="h-14 w-14 text-green-600" />
                ) : (
                  <ShieldAlert className="h-14 w-14 text-yellow-600" />
                )}
                <div>
                  <p className="font-mono text-lg font-bold text-primary">{result.licenseNumber}</p>
                  <Badge className={result.active ? "bg-green-100 text-green-700 mt-2" : "bg-yellow-100 text-yellow-700 mt-2"}>
                    {result.active ? "Licence active" : "En attente de validation"}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-lg">{result.fullName}</p>
                  <p className="text-muted-foreground">{typeLabels[result.accountType || ""] || result.accountType}</p>
                  {result.clubName && <p className="text-muted-foreground">Club : {result.clubName}</p>}
                  {result.discipline && <p className="text-muted-foreground">Discipline : {result.discipline}</p>}
                  {result.city && <p className="text-muted-foreground">Ville : {result.city}</p>}
                  {result.season && <p className="text-muted-foreground">Saison : {result.season}</p>}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Vérifié le {new Date(result.checkedAt || Date.now()).toLocaleString("fr-FR")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VerifyPage;
