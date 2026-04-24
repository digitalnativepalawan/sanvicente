import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Trash2, Mail, Phone, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { listClaims, updateClaimStatus, deleteClaim, type ClaimRecord, type ClaimStatus } from "@/lib/claims";
import { businessStore } from "@/data/businessStore";

const statusColor: Record<ClaimStatus, string> = {
  pending: "bg-accent/15 text-accent",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
};

const ClaimsPage = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ClaimStatus | "all">("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Claims · Admin";
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listClaims();
      setClaims(data);
    } catch (e: any) {
      toast({ title: "Could not load claims", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(
    () => (filter === "all" ? claims : claims.filter((c) => c.status === filter)),
    [claims, filter],
  );

  const counts = useMemo(() => ({
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    all: claims.length,
  }), [claims]);

  const handleApprove = async (claim: ClaimRecord) => {
    setBusy(claim.id);
    try {
      // Apply proposed edits to the business + mark as claimed
      const patch = { ...(claim.proposed_data ?? {}), isClaimed: true, claimedAt: new Date().toISOString() } as any;
      businessStore.update(claim.business_id, patch);
      await updateClaimStatus(claim.id, "approved", notesById[claim.id]);
      toast({ title: "Claim approved", description: "Business updated and marked as claimed." });
      await load();
    } catch (e: any) {
      toast({ title: "Approve failed", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (claim: ClaimRecord) => {
    setBusy(claim.id);
    try {
      await updateClaimStatus(claim.id, "rejected", notesById[claim.id]);
      toast({ title: "Claim rejected" });
      await load();
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (claim: ClaimRecord) => {
    if (!confirm("Delete this claim record? This cannot be undone.")) return;
    setBusy(claim.id);
    try {
      await deleteClaim(claim.id);
      toast({ title: "Claim deleted" });
      await load();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout>
      <Link to="/admin" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <AdminPageHeader title="Business claims" description="Review ownership claim submissions and approve edits." />

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
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading claims…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          No {filter === "all" ? "" : filter} claims.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((claim) => {
            const biz = businessStore.get(claim.business_id);
            const proposed = (claim.proposed_data ?? {}) as Record<string, any>;
            const isOpen = openId === claim.id;
            return (
              <li key={claim.id} className="rounded-3xl border border-border bg-card shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`rounded-full border-0 ${statusColor[claim.status]}`}>{claim.status}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(claim.created_at).toLocaleString()}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold">
                      {proposed.name ?? biz?.name ?? "Unknown business"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {biz ? <Link to={`/business/${biz.slug}`} className="hover:underline">View public listing →</Link> : "Business not found locally"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span className="font-medium">{claim.owner_name}</span>
                      <a href={`mailto:${claim.owner_email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <Mail className="h-4 w-4" /> {claim.owner_email}
                      </a>
                      <a href={`tel:${claim.owner_phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <Phone className="h-4 w-4" /> {claim.owner_phone}
                      </a>
                    </div>
                    {claim.owner_message && (
                      <p className="mt-3 rounded-2xl bg-secondary/50 p-3 text-sm">{claim.owner_message}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 rounded-full" onClick={() => setOpenId(isOpen ? null : claim.id)}>
                      {isOpen ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                      {isOpen ? "Hide" : "Review"} edits
                    </Button>
                    {claim.status === "pending" && (
                      <>
                        <Button size="sm" className="h-9 rounded-full gradient-ocean text-primary-foreground" disabled={busy === claim.id} onClick={() => handleApprove(claim)}>
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 rounded-full text-destructive hover:text-destructive" disabled={busy === claim.id} onClick={() => handleReject(claim)}>
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive" disabled={busy === claim.id} onClick={() => handleDelete(claim)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border p-5">
                    <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Proposed changes vs. current</h4>
                    <DiffTable current={biz ?? {}} proposed={proposed} />
                    <div className="mt-4">
                      <label className="text-sm font-medium">Admin notes (optional, saved on approve/reject)</label>
                      <Textarea
                        value={notesById[claim.id] ?? claim.admin_notes ?? ""}
                        onChange={(e) => setNotesById((m) => ({ ...m, [claim.id]: e.target.value }))}
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

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "subcategory", label: "Subcategory" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "address", label: "Address" },
  { key: "barangay", label: "Barangay" },
  { key: "googleMapsLink", label: "Google Maps" },
  { key: "shortDescription", label: "Short description" },
  { key: "description", label: "Description" },
  { key: "priceRange", label: "Price range" },
  { key: "services", label: "Services" },
  { key: "amenities", label: "Amenities" },
  { key: "openingHours", label: "Opening hours" },
  { key: "image", label: "Cover image" },
];

const fmt = (v: any): string => {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ") || "—";
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "string" && v.startsWith("data:image")) return "(uploaded image)";
  return String(v);
};

const DiffTable = ({ current, proposed }: { current: Record<string, any>; proposed: Record<string, any> }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-3">Field</th>
            <th className="p-3">Current</th>
            <th className="p-3">Proposed</th>
          </tr>
        </thead>
        <tbody>
          {FIELDS.map(({ key, label }) => {
            const a = fmt(current[key]);
            const b = fmt(proposed[key]);
            const changed = a !== b;
            return (
              <tr key={key} className={`border-t border-border align-top ${changed ? "bg-accent/5" : ""}`}>
                <td className="p-3 font-medium">{label}</td>
                <td className="p-3 text-muted-foreground">{a}</td>
                <td className={`p-3 ${changed ? "font-medium text-foreground" : "text-muted-foreground"}`}>{b}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClaimsPage;
