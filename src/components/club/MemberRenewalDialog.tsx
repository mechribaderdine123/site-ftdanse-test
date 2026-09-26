import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import LicenseExpiry, { type LicenseExpiryInfo } from "@/components/LicenseExpiry";

const DOCUMENT_TYPES = [
  { value: "medical", label: "Certificat médical" },
  { value: "id", label: "Pièce d'identité" },
  { value: "insurance", label: "Attestation d'assurance" },
  { value: "photo", label: "Photo d'identité" },
  { value: "payment", label: "Justificatif de paiement" },
  { value: "autre", label: "Autre" },
];

/**
 * Demande de renouvellement annuel pour un membre de club : documents
 * justificatifs obligatoires, envoyés à l'administration pour vérification.
 */
const MemberRenewalDialog = ({
  member,
  onClose,
  onSubmitted,
}: {
  member: {
    id: number;
    fullName: string;
    licenseNumber: string | null;
    licenseExpiresAt: string | null;
    daysRemaining: number | null;
  } | null;
  onClose: () => void;
  onSubmitted: () => void;
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<{ file: File; type: string }[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!member) return null;

  const info: LicenseExpiryInfo = {
    licenseExpiresAt: member.licenseExpiresAt,
    daysRemaining: member.daysRemaining,
  };

  const submit = async () => {
    if (files.length === 0) {
      toast({ title: "Erreur", description: "Joignez au moins un document justificatif", variant: "destructive" });
      return;
    }
    if (files.some((entry) => !entry.type.trim())) {
      toast({ title: "Erreur", description: "Indiquez le type de chaque document", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("documentTypes", JSON.stringify(files.map((entry) => entry.type.trim())));
      formData.append("note", note);
      files.forEach((entry) => formData.append("documents", entry.file));
      await apiRequest(`/api/member/club-members/${member.id}/renewal`, {
        method: "POST",
        body: formData,
      });
      toast({ title: "Demande envoyée", description: `Renouvellement de ${member.fullName} transmis à l'administration.` });
      setFiles([]);
      setNote("");
      onSubmitted();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Envoi impossible",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={(open) => { if (!open && !submitting) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renouvellement — {member.fullName}</DialogTitle>
          <DialogDescription>
            Licence {member.licenseNumber || "—"} · joignez les documents justificatifs pour la saison suivante.
            L'administration vérifiera le dossier avant d'étendre la licence d'un an.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <LicenseExpiry info={info} />
          <div>
            <Label>Documents justificatifs (obligatoire)</Label>
            <label className="mt-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cliquez pour ajouter des documents (PDF, JPG ou PNG)</span>
              <Input
                type="file"
                accept=".pdf,image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(event) => {
                  const selected = Array.from(event.target.files || []);
                  event.target.value = "";
                  setFiles((previous) => [...previous, ...selected.map((file) => ({ file, type: "" }))]);
                }}
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((entry, index) => (
                  <div key={`${entry.file.name}-${index}`} className="p-2 border border-border rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-sm truncate flex-1">{entry.file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{(entry.file.size / 1024).toFixed(0)} Ko</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setFiles((previous) => previous.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Select
                      value={entry.type}
                      onValueChange={(value) =>
                        setFiles((previous) => previous.map((item, i) => (i === index ? { ...item, type: value } : item)))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Type de document *" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Note à l'administrateur (optionnel)</Label>
            <Textarea
              placeholder="Précisez la demande..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
            <Button onClick={submit} disabled={submitting || files.length === 0}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Envoyer la demande
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberRenewalDialog;

/** État de renouvellement d'un membre de club (exposé aussi au tableau). */
export type MemberRenewalState = {
  renewalId: number | null;
  renewalStatus: string | null;
  season: string | null;
};

export const useMemberRenewals = (enabled: boolean) =>
  useQuery({
    queryKey: ["club-member-renewals"],
    queryFn: () =>
      apiRequest<
        {
          id: number;
          fullName: string;
          licenseNumber: string | null;
          licenseExpiresAt: string | null;
          approvalStatus: string;
          renewalId: number | null;
          renewalStatus: string | null;
          renewalSeason: string | null;
        }[]
      >("/api/member/club-member-renewals"),
    enabled,
  });
