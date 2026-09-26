import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export const DocumentViewer = ({ open, onOpenChange, document }: DocumentViewerProps) => {
  if (!document) return null;

  const isPdf = document.type === "application/pdf";
  const isImage = document.type.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.name}
          </DialogTitle>
          <Button size="sm" variant="outline" asChild>
            <a href={document.url} download={document.name}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </a>
          </Button>
        </DialogHeader>

        <div className="w-full h-[60vh] bg-muted rounded-lg overflow-auto">
          {isPdf && (
            <iframe
              src={document.url}
              className="w-full h-full"
              title="PDF Viewer"
            />
          )}
          {isImage && (
            <img src={document.url} alt={document.name} className="w-full h-full object-contain" />
          )}
          {!isPdf && !isImage && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Type de fichier non supporté pour la prévisualisation</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
