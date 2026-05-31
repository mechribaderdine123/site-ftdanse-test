import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export interface MemberQRPayload {
  kind: "club" | "athlete" | "coach" | "trainer" | "referee" | "member";
  id: string | number;
  name: string;
  [k: string]: any;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  payload: MemberQRPayload | null;
  title?: string;
}

const MemberQRDialog = ({ open, onOpenChange, payload, title }: Props) => {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!payload) {
      setDataUrl("");
      return;
    }
    const text = JSON.stringify(payload);
    QRCode.toDataURL(text, { width: 320, margin: 2, errorCorrectionLevel: "M" })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [payload]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${payload?.kind ?? "member"}-${payload?.id ?? ""}.png`;
    a.click();
  };

  const print = () => {
    if (!dataUrl || !payload) return;
    const w = window.open("", "_blank", "width=520,height=640");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>QR ${payload.name}</title>
      <style>body{font-family:Inter,sans-serif;text-align:center;padding:32px;}
      h1{font-size:18px;margin:0 0 6px}p{color:#666;margin:0 0 18px;font-size:13px}
      img{width:300px;height:300px}</style></head>
      <body><h1>${payload.name}</h1><p>${payload.kind.toUpperCase()} — ID ${payload.id}</p>
      <img src="${dataUrl}" /><script>window.onload=()=>{window.print();}</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title || "QR Code"}</DialogTitle>
        </DialogHeader>
        {payload && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-xl border border-border p-3 bg-white">
              {dataUrl ? (
                <img src={dataUrl} alt="QR" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-muted-foreground text-sm">
                  Génération...
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold">{payload.name}</p>
              <p className="text-xs text-muted-foreground">
                {payload.kind.toUpperCase()} • ID {payload.id}
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={download}>
                <Download className="w-4 h-4 mr-2" /> PNG
              </Button>
              <Button className="flex-1" onClick={print}>
                <Printer className="w-4 h-4 mr-2" /> Imprimer
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Scannez ce QR pour afficher toutes les informations enregistrées.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberQRDialog;