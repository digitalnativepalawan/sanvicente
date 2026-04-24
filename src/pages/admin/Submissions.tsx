import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Trash2, Mail, Phone, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { listSubmissions, updateSubmission, deleteSubmission, type SubmissionRecord, type SubmissionStatus } from "@/lib/submissions";
import { businessStore, slugify } from "@/data/businessStore";
import type { Business } from "@/types/business";

const statusColor: Record<SubmissionStatus, string> = {
  pending: "bg-accent/15 text-accent",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
};

const SubmissionsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { document.title = "Submissions · Admin"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listSubmissions());
    } catch (e: any) {
      toast({ title: "Could not load", description: e?.message ?? "", variant: "destructive" });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => filter === "all" ? items : items.filter((c) => c.status === filter), [items, filter]);
  const counts = useMemo(() => ({
    pending: items.filter((c) => c.status === "pending").length,
    approved: items.filter((c) => c.status === "approved").length,
    rejected: items.filter((c) => c.status === "rejected").length,
    all: items.length,
  }), [items]);

  const handleApprove = async (sub: SubmissionRecord) => {
    setBusy(sub.id);
    try {
      const data = (sub.proposed_data ?? {}) as Partial<Business>;
      const slug = data.slug || slugify(data.name ?? "business");
      const created = businessStore.create({
        name: data.name ?? "",
        slug,
        category: (data.category ?? "services") as Business["category"],
        subcategory: data.subcategory,
        phone: data.phone, email: data.email, website: data.website,
        facebook: data.facebook, instagram: data.instagram,
        address: data.address ?? "", barangay: data.barangay ?? "",
        googleMapsLink: data.googleMapsLink,
        description: data.description ?? "", shortDescription: data.shortDescription ?? "",
        services: data.services ?? [], amenities: data.amenities ?? [],
        image: data.image ?? "", images: data.images ?? [],
        menuImages: data.menuImages ?? [], roomTypes: data.roomTypes ?? [],
        priceRange: data.priceRange ?? "₱₱",
        openingHours: data.openingHours ?? {},
        isFeatured: false, isVerified: false, isActive: true,
        listingTier: "free",
        latitude: data.latitude, longitude: data.longitude,
      } as any);
      await updateSubmission(sub.id, { status: "approved", admin_notes: notesById[sub.id] ?? null, approved_business_id: created.id });
      toast({ title: "Listing approved", description: `${created.name} is now live.` });
      await load();
    } catch (e: any) {
      toast({ title: "Approve failed", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const handleReject = async (sub: SubmissionRecord) => {
    setBusy(sub.id);
    try {
      await updateSubmission(sub.id, { status: "rejected", admin_notes: notesById[sub.id] ?? null });
      toast({ title: "Submission rejected" });
      await load();
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const handleDelete = async (sub: SubmissionRecord) => {
    if (!confirm("Delete this submission record? This cannot be undone.")) return;
    setBusy(sub.id);
    try {
      await deleteSubmission(sub.id);
      toast({ title: "Deleted" });
      await load();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  return (
    <AdminLayout>
      <Link to="/admin" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <AdminPageHeader title="New listing submissions" description="Owners requesting to add a new business to the directory." />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
              filter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s[0].toUpperCase() + s.slice(1)} <span className="ml-1 opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          No {filter === "all" ? "" : filter} submissions.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((sub) => {
            const proposed = (sub.proposed_data ?? {}) as Record<string, any>;
            const isOpen = openId === sub.id;
            return (
              <li key={sub.id} className="rounded-3xl border border-border bg-card shadow-soft">
                <div className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`rounded-full border-0 ${statusColor[sub.status]}`}>{sub.status}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold break-words">{proposed.name ?? "Untitled business"}</h3>
                    <p className="text-sm text-muted-foreground">{proposed.category} · {proposed.barangay}</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5">
                      <span className="font-medium">{sub.owner_name}</span>
                      <a href={`mailto:${sub.owner_email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground break-all">
                        <Mail className="h-4 w-4 shrink-0" /> {sub.owner_email}
                      </a>
                      <a href={`tel:${sub.owner_phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <Phone className="h-4 w-4 shrink-0" /> {sub.owner_phone}
                      </a>
                    </div>
                    {sub.owner_message && (
                      <p className="mt-3 rounded-2xl bg-secondary/50 p-3 text-sm">{sub.owner_message}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 rounded-full" onClick={() => setOpenId(isOpen ? null : sub.id)}>
                      {isOpen ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                      {isOpen ? "Hide" : "Review"}
                    </Button>
                    {sub.status === "pending" && (
                      <>
                        <Button size="sm" className="h-9 rounded-full gradient-ocean text-primary-foreground" disabled={busy === sub.id} onClick={() => handleApprove(sub)}>
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 rounded-full text-destructive hover:text-destructive" disabled={busy === sub.id} onClick={() => handleReject(sub)}>
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive" disabled={busy === sub.id} onClick={() => handleDelete(sub)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border p-5 space-y-4">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposed listing details</h4>
                      <dl className="grid gap-2 sm:grid-cols-2">
                        {[
                          ["Category", proposed.category],
                          ["Subcategory", proposed.subcategory],
                          ["Price", proposed.priceRange],
                          ["Phone", proposed.phone],
                          ["Email", proposed.email],
                          ["Website", proposed.website],
                          ["Address", proposed.address],
                          ["Barangay", proposed.barangay],
                          ["Short description", proposed.shortDescription],
                          ["Description", proposed.description],
                          ["Services", (proposed.services ?? []).join(", ")],
                          ["Amenities", (proposed.amenities ?? []).join(", ")],
                          ["Photos", `${(proposed.images ?? []).length} image(s)`],
                          ["Menu photos", `${(proposed.menuImages ?? []).length} image(s)`],
                          ["Room types", `${(proposed.roomTypes ?? []).length} type(s)`],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="rounded-xl bg-secondary/40 p-3">
                            <dt className="text-xs font-medium text-muted-foreground">{String(k)}</dt>
                            <dd className="mt-0.5 break-words text-sm">{v ? String(v) : "—"}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    {(proposed.images ?? []).length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Photos</h4>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                          {(proposed.images as string[]).map((u, i) => (
                            <img key={i} src={u} alt={`Photo ${i + 1}`} className="aspect-square w-full rounded-xl border border-border object-cover" loading="lazy" />
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Admin notes (saved on approve/reject)</label>
                      <Textarea
                        value={notesById[sub.id] ?? sub.admin_notes ?? ""}
                        onChange={(e) => setNotesById((m) => ({ ...m, [sub.id]: e.target.value }))}
                        rows={2}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
};

export default SubmissionsPage;
