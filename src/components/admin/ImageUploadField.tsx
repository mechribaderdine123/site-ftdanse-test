import { useRef, useState } from "react";
import { Upload, X, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadMediaFile, contentUrl } from "@/lib/contentApi";

interface ImageUploadFieldProps {
  value: string;
  onChange: (v: string) => void;
  label: string;
  /** Tailwind aspect class, e.g. "aspect-video" (default) or "aspect-square". */
  ratio?: string;
  /** Allow removing the image with a trash overlay instead of the X badge. */
  overlayRemove?: boolean;
}

/**
 * Shared image picker for the admin content editors. Uploads the chosen file
 * to the persistent media endpoint and hands the returned URL to `onChange`.
 */
export const ImageUploadField = ({
  value,
  onChange,
  label,
  ratio = "aspect-video",
  overlayRemove = false,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadMediaFile(file);
      if (url) onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`relative ${ratio} w-full rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center`}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : value ? (
          <>
            <img src={contentUrl(value)} alt="" className="w-full h-full object-cover" />
            {overlayRemove ? (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Changer
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onChange("")} className="ml-2">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Cliquer pour téléverser</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value && !uploading && !overlayRemove && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Remplacer l'image
        </Button>
      )}
    </div>
  );
};
