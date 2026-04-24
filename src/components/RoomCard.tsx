import { useState } from "react";
import { Users, BedDouble, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/Lightbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RoomType } from "@/types/business";

type Props = { room: RoomType };

/** Parse free-text description into discrete amenity chips. */
const splitAmenities = (text?: string): string[] => {
  if (!text) return [];
  // Split on commas, semicolons, bullets, or 2+ spaces; keep short tokens.
  return text
    .split(/[,;•·\n]+| {2,}/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 60);
};

export const RoomCard = ({ room }: Props) => {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const cover = room.images[0];
  const thumbs = room.images.slice(1, 4);
  const extra = Math.max(0, room.images.length - 4);
  const amenities = splitAmenities(room.description);

  const openLb = (i: number) => {
    setLbIdx(i);
    setLbOpen(true);
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:shadow-md">
      {cover && (
        <button
          type="button"
          onClick={() => openLb(0)}
          className="group relative block w-full overflow-hidden"
          aria-label={`View ${room.name} photos`}
        >
          <img
            src={cover}
            alt={room.name}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-smooth group-hover:scale-105"
          />
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background opacity-0 transition group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" /> Expand
          </span>
        </button>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight">{room.name || "Room"}</h3>
          {room.pricePerNight && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              {room.pricePerNight}
              <span className="text-xs font-medium text-primary/70">/night</span>
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {room.maxGuests != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Sleeps {room.maxGuests}
            </span>
          )}
          {room.images.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {room.images.length} photo{room.images.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {amenities.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {amenities.slice(0, 6).map((a, i) => (
              <li
                key={i}
                className="rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
              >
                {a}
              </li>
            ))}
            {amenities.length > 6 && (
              <li className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                +{amenities.length - 6} more
              </li>
            )}
          </ul>
        )}

        {thumbs.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {thumbs.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openLb(i + 1)}
                className="relative block overflow-hidden rounded-lg bg-muted"
                aria-label={`View photo ${i + 2}`}
              >
                <img src={u} alt="" loading="lazy" className="aspect-square w-full object-cover transition hover:scale-105" />
                {i === thumbs.length - 1 && extra > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-foreground/55 text-sm font-semibold text-background">
                    +{extra}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {(amenities.length > 6 || (room.description && amenities.length === 0)) && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4 h-9 w-full rounded-full">
                View room details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{room.name || "Room"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {room.pricePerNight && <span className="font-semibold text-primary">{room.pricePerNight}/night</span>}
                  {room.maxGuests != null && <span>Sleeps {room.maxGuests}</span>}
                </div>
                {amenities.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {amenities.map((a, i) => (
                      <li key={i} className="rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-medium">
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{room.description}</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Lightbox
        images={room.images}
        open={lbOpen}
        onOpenChange={setLbOpen}
        startIndex={lbIdx}
        alt={room.name}
      />
    </article>
  );
};
