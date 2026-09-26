import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { downloadProtectedFile, openProtectedFile } from "@/lib/download";
import { FileText, Eye, Download, Loader2, ExternalLink } from "lucide-react";

export interface AdminDocument {
  id: string;
  name: string;
  type?: string;
  key?: string;
  mimeType: string;
  size?: number;
  url: string;
}

const documentKeyLabels: Record<string, string> = {
  cin: "CIN (Carte d'identité)",
  photo: "Photo d'identité",
  birthExtract: "Extrait de naissance (مضمون)",
  parentalAuth: "ترخيص أبوي (Autorisation parentale)",
  paymentReceipt: "Reçu de paiement",
};

const documentGroupLabels: Record<string, string> = {
  statuts: "Statuts du club",
  legal: "Récépissé de dépôt légal",
  id: "Pièce d'identité",
  ag: "Procès-verbal AG",
  bureau: "Liste du bureau",
  rib: "RIB",
  assurance: "Attestation d'assurance",
  id_recto: "Pièce d'identité recto",
  id_verso: "Pièce d'identité verso",
  birth_extract: "Extrait de naissance (مضمون)",
  parental_auth: "ترخيص أبوي (Autorisation parentale)",
  photo: "Photo d'identité",
  medical: "Certificat médical",
  diplome: "Diplôme/Certificat",
};

export const documentLabel = (document: AdminDocument) =>
  (document.key && documentKeyLabels[document.key])
  || (document.type && (documentGroupLabels[document.type] || document.type))
  || document.name;

export const DocumentsBrowser = ({ documents }: { documents: AdminDocument[] }) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<{ url: string; name: string; mimeType: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Free the blob URL when the preview closes.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Aucun document.</p>;
  }

  const openPreview = async (document: AdminDocument) => {
    setPreview({ url: document.url, name: document.name, mimeType: document.mimeType });
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      const response = await fetch(document.url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
      });
      if (!response.ok) throw new Error("Document indisponible");
      const blob = await response.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const download = async (document: AdminDocument) => {
    try {
      setDownloading(document.id);
      await downloadProtectedFile(document.url, document.name);
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-2">
      {documents.map((document, index) => (
        <div key={document.id || `${document.key}-${index}`} className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <FileText className="w-5 h-5 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{documentLabel(document)}</div>
            <div className="text-xs text-muted-foreground truncate">
              {document.name}{document.size ? ` · ${(document.size / 1024).toFixed(0)} Ko` : ""}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => void openPreview(document)}>
            <Eye className="w-4 h-4 mr-1" /> Voir
          </Button>
          <Button size="sm" variant="outline" onClick={() => void download(document)} disabled={downloading === document.id}>
            {downloading === document.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-1" />} Télécharger
          </Button>
        </div>
      ))}

      <Dialog open={!!preview} onOpenChange={(open) => { if (!open) { setPreview(null); setPreviewUrl(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 truncate">
              {preview?.name}
              {preview && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => preview && void openProtectedFile(preview.url)}
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto bg-muted/40 rounded-lg flex items-center justify-center">
            {previewLoading || !previewUrl ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : preview?.mimeType === "application/pdf" ? (
              <iframe src={previewUrl} title={preview.name} className="w-full h-[70vh] border-0" />
            ) : (
              <img src={previewUrl} alt={preview.name} className="max-w-full max-h-[70vh] object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
