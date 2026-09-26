import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";
import logoFtdap from "@/assets/logo-ftdap.png";

const ForgotPasswordPage = () => {
  // Mode dev (SMTP indisponible) : le serveur renvoie le lien directement
  // pour que le flux reste utilisable sans vrai envoi d'email.
  const [devLink, setDevLink] = useState<{ devResetUrl: string; previewUrl: string | null } | null>(null);
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"email" | "reset">(searchParams.get("token") ? "reset" : "email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Erreur", description: "Veuillez entrer votre email", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<{
        ok: boolean;
        message?: string;
        devMode?: boolean;
        devResetUrl?: string;
        previewUrl?: string | null;
      }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (data.devMode && data.devResetUrl) {
        setDevLink({ devResetUrl: data.devResetUrl, previewUrl: data.previewUrl ?? null });
      }
      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre adresse email",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get("token");

    if (!token) {
      toast({ title: "Erreur", description: "Lien invalide", variant: "destructive" });
      return;
    }

    if (!password || !confirmPassword) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }

    if (password.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la réinitialisation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "reset" && searchParams.get("token")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <img src={logoFtdap} alt="FTDAP" className="h-12 w-auto mx-auto max-w-[180px]" />
            <CardTitle className="text-2xl">Réinitialiser le mot de passe</CardTitle>
            <CardDescription>Entrez votre nouveau mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Nouveau mot de passe */}
              <div>
                <label className="text-sm font-medium">Nouveau mot de passe *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="text-sm font-medium">Confirmer le mot de passe *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Indicateur force du mot de passe */}
              {password && (
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          password.length >= 8 ? (password.length >= 12 ? "bg-green-500" : "bg-yellow-500") : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min((password.length / 16) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground">
                      {password.length < 8 ? "Trop court" : password.length < 12 ? "Moyen" : "Fort"}
                    </span>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Réinitialiser
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <img src={logoFtdap} alt="FTDAP" className="h-12 w-auto mx-auto max-w-[180px]" />
          <CardTitle className="text-2xl">Mot de passe oublié?</CardTitle>
          <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Envoyer le lien
            </Button>

            {devLink && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs space-y-2">
                <p className="font-medium text-amber-800">Mode développement — SMTP non configuré :</p>
                <a href={devLink.devResetUrl} className="text-blue-700 underline break-all">
                  Choisir un nouveau mot de passe (lien valable 1 h)
                </a>
                {devLink.previewUrl && (
                  <a href={devLink.previewUrl} target="_blank" rel="noreferrer" className="block text-muted-foreground underline break-all">
                    Voir l'email de démonstration (Ethereal)
                  </a>
                )}
              </div>
            )}

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
