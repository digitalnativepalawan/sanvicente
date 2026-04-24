import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  images: string[];
  open: boolean;
  startIndex?: number;
  onOpenChange: (open: boolean) => void;
  alt?: string;
};

/** In-site image lightbox. Keyboard: ←/→/Esc. Mobile: swipe-friendly tap zones. */
export const Lightbox = ({ images, open, startIndex = 0, onOpenChange, alt = "Photo" }: Props) => {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    if (open) setIdx(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!images.length) return null;
  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl border-0 bg-background/95 p-0 sm:rounded-3xl"
        hideClose
      >
        <div className="relative flex h-[85vh] w-full items-center justify-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/85 text-background shadow-soft transition hover:bg-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={images[idx]}
            alt={`${alt} ${idx + 1}`}
            className="max-h-full max-w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full shadow-soft"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full shadow-soft"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-foreground/85 px-3 py-1 text-xs font-medium text-background">
                {idx + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-border bg-card p-3">
            {images.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={u} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
