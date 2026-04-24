import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import type { RoomType } from "@/types/business";

type Props = {
  value: RoomType[];
  onChange: (next: RoomType[]) => void;
  folder?: string;
};

const newRoom = (): RoomType => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  pricePerNight: "",
  maxGuests: undefined,
  images: [],
});

export const RoomTypesEditor = ({ value, onChange, folder = "rooms" }: Props) => {
  const update = (id: string, patch: Partial<RoomType>) =>
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(value.filter((r) => r.id !== id));
  const add = () => onChange([...value, newRoom()]);

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">No room types yet. Add one for each room category (e.g. Deluxe, Garden View).</p>
      )}

      {value.map((room, idx) => (
        <div key={room.id} className="rounded-2xl border border-border bg-background p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room #{idx + 1}</span>
            <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive" onClick={() => remove(room.id)} aria-label="Remove room">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Room name</Label>
              <Input value={room.name} onChange={(e) => update(room.id, { name: e.target.value })} placeholder="e.g. Deluxe Beachfront" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label>Price per night</Label>
              <Input value={room.pricePerNight ?? ""} onChange={(e) => update(room.id, { pricePerNight: e.target.value })} placeholder="₱3,500" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label>Max guests</Label>
              <Input type="number" min={1} value={room.maxGuests ?? ""} onChange={(e) => update(room.id, { maxGuests: e.target.value ? Number(e.target.value) : undefined })} className="mt-1.5 h-11" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={room.description ?? ""} onChange={(e) => update(room.id, { description: e.target.value })} rows={2} className="mt-1.5" placeholder="Amenities, bed type, view, etc." />
            </div>
            <div className="sm:col-span-2">
              <MultiImageUpload
                value={room.images}
                onChange={(images) => update(room.id, { images })}
                max={6}
                folder={folder}
                showCoverBadge={false}
                label="Room photos"
                helpText="Up to 6 images, JPG/PNG, 3 MB each."
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" className="h-11 w-full rounded-2xl" onClick={add}>
        <Plus className="mr-1.5 h-4 w-4" /> Add room type
      </Button>
    </div>
  );
};
