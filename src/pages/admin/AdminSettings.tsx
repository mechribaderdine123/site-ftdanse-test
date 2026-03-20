import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configurez les paramètres du site</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
          <CardDescription>Nom, email de contact et coordonnées</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du site</Label>
            <Input id="siteName" defaultValue="FTDAP — Fédération Tunisienne de Danse et Arts Populaires" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de contact</Label>
            <Input id="email" type="email" defaultValue="contact@ftdap.org" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" defaultValue="+216 71 123 456" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" defaultValue="Tunis, Tunisie" />
          </div>
          <Button>Enregistrer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Réseaux sociaux</CardTitle>
          <CardDescription>Liens vers vos pages sociales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" defaultValue="https://facebook.com/ftdap" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" defaultValue="https://instagram.com/ftdap" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" placeholder="https://youtube.com/..." />
          </div>
          <Button>Enregistrer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mode maintenance</Label>
              <p className="text-xs text-muted-foreground">Désactive l'accès public au site</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Inscriptions ouvertes</Label>
              <p className="text-xs text-muted-foreground">Permet aux nouveaux membres de s'inscrire</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Afficher les résultats</Label>
              <p className="text-xs text-muted-foreground">Rend les résultats visibles publiquement</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
