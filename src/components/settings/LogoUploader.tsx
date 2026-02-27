import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const LogoUploader = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const clear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Firm logo preview" className="h-20 w-auto rounded-md border border-border object-contain" />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground h-5 w-5 flex items-center justify-center"
            aria-label="Remove logo"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center h-24 w-40 rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <Upload className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Upload logo</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} aria-label="Upload firm logo" />
      <p className="text-xs text-muted-foreground">PNG or SVG, max 2 MB. UI-only preview.</p>
    </div>
  );
};

export default LogoUploader;
