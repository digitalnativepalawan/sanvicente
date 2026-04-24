import { useRef, useState, ChangeEvent } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/upload";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  folder?: string;
  /** When true, the first image is treated as the cover and shows a star badge. */
  showCoverBadge?: boolean;
  label?: string;
  helpText?: string;
};

/**
 * Mobile-first multi-image uploader. Stacks on small screens, grid on larger.
 * Uploads to Lovable Cloud storage and returns public URLs.
 */
export const MultiImageUpload = ({
  value,
  onChange,
  max = 6,
  folder = "biz",
  showCoverBadge = true,
  label = "Photos",
  helpText,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const remaining = Math.max(0, max - value.length);
    if (remaining === 0) {
      toast({ title: `Up to ${max} images`, description: "Remove one before adding more.", variant: "destructive" });
      return;
    }
    const slice = files.slice(0, remaining);
    setBusy(true);
    const uploaded: string[] = [];
    for (const f of slice) {
      try {
        const url = await uploadImage(f, folder);
        uploaded.push(url);
      } catch (err: any) {
        toast({ title: "Upload failed", description: err?.message ?? f.name, variant: "destructive" });
      }
    }
    setBusy(false);
    if (uploaded.length) onChange([...value, ...uploaded]);
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));
  const makeCover = (url: string) => onChange([url, ...value.filter((u) => u !== url)]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label} <span className="text-muted-foreground">({value.length}/{max})</span></span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-full"
          onClick={() => inputRef.current?.click()}
          disabled={busy || value.length >= max}
        >
          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1.5 h-4 w-4" />}
          {busy ? "Uploading…" : "Add photos"}
        </Button>
      </div>
      {helpText && <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>}
      <input ref={inputRef} type="file" accept="image/*" hidden multiple onChange={onPick} />

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, i) => (
            <li key={url} className="group relative overflow-hidden rounded-2xl border border-border bg-muted">
              <img src={url} alt={`Photo ${i + 1}`} className="aspect-square w-full object-cover" loading="lazy" />
              {showCoverBadge && i === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-semibold text-background">
                  <Star className="h-3 w-3 fill-current" /> Cover
                </span>
              )}
              <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {showCoverBadge && i !== 0 && (
                  <Button type="button" size="sm" variant="secondary" className="h-7 rounded-full px-2 text-[11px]" onClick={() => makeCover(url)}>
                    Set cover
                  </Button>
                )}
                <Button type="button" size="icon" variant="destructive" className="ml-auto h-7 w-7 rounded-full" onClick={() => remove(url)} aria-label="Remove photo">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {/* Mobile: always-visible delete (no hover) */}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1.5 top-1.5 h-7 w-7 rounded-full md:hidden"
                onClick={() => remove(url)}
                aria-label="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
