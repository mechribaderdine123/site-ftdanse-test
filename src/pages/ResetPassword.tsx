import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { apiRequest } from "@/lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setMessage("Si cette adresse correspond à un compte, un lien de réinitialisation vient d'être envoyé.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible d'envoyer l'email.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
      setMessage("Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de modifier le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const changingPassword = Boolean(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{changingPassword ? "Nouveau mot de passe" : "Mot de passe oublié"}</CardTitle>
          <CardDescription>{changingPassword ? "Choisissez un mot de passe d'au moins 8 caractères." : "Saisissez votre email pour recevoir un lien de réinitialisation."}</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</p> : null}
          {error ? <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          {!message && (changingPassword ? (
            <form onSubmit={submitReset} className="space-y-4">
              <div className="space-y-2"><Label>Nouveau mot de passe</Label><PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div>
              <div className="space-y-2"><Label>Confirmer le mot de passe</Label><PasswordInput value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required /></div>
              <Button className="w-full" disabled={loading}>{loading ? "Modification..." : "Modifier le mot de passe"}</Button>
            </form>
          ) : (
            <form onSubmit={submitRequest} className="space-y-4">
              <div className="space-y-2"><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" required /></div></div>
              <Button className="w-full" disabled={loading}>{loading ? "Envoi..." : "Envoyer le lien"}</Button>
            </form>
          ))}
          <Link to="/member/login" className="mt-5 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Retour à la connexion</Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
