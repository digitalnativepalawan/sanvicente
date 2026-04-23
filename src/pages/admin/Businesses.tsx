import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Star, BadgeCheck, Eye, EyeOff, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { businessStore, useBusinesses } from "@/data/businessStore";
import { CATEGORIES } from "@/data/categories";
import { useToast } from "@/hooks/use-toast";

const AdminBusinesses = () => {
  const businesses = useBusinesses();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return businesses.filter((b) => {
      if (cat !== "all" && b.category !== cat) return false;
      if (!needle) return true;
      return b.name.toLowerCase().includes(needle) || b.barangay.toLowerCase().includes(needle);
    });
  }, [businesses, q, cat]);

  const handleDelete = () => {
    if (!pendingDelete) return;
    const name = businessStore.get(pendingDelete)?.name;
    businessStore.remove(pendingDelete);
    setPendingDelete(null);
    toast({ title: "Deleted", description: `${name ?? "Business"} was removed.` });
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Businesses"
        description={`${filtered.length} of ${businesses.length} listings`}
        action={
          <Button asChild className="h-11 rounded-full gradient-sunset text-accent-foreground">
            <Link to="/admin/businesses/new"><Plus className="mr-1.5 h-4 w-4" />Add business</Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or barangay…"
            className="h-11 rounded-full pl-9"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-11 w-full rounded-full sm:w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No businesses match.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((b) => (
              <li key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <img src={b.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate font-semibold">
                      {b.name}
                      {b.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{b.barangay} · {b.category}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {b.isFeatured && <Badge className="border-0 gradient-sunset text-[10px] text-accent-foreground">Featured</Badge>}
                      {!b.isActive && <Badge variant="outline" className="text-[10px]">Hidden</Badge>}
                      <span className="text-[10px] text-muted-foreground">{b.priceRange}</span>
                    </div>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">Views</dt><dd className="font-semibold">{b.viewCount}</dd></div>
                  <div><dt className="text-muted-foreground">Rating</dt><dd className="font-semibold">{b.rating.toFixed(1)} ★</dd></div>
                  <div><dt className="text-muted-foreground">Reviews</dt><dd className="font-semibold">{b.reviewCount}</dd></div>
                </dl>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="h-10 rounded-xl"
                    onClick={() => businessStore.toggleFeatured(b.id)}>
                    <Star className={`mr-1.5 h-4 w-4 ${b.isFeatured ? "fill-accent text-accent" : ""}`} />
                    {b.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-10 rounded-xl"
                    onClick={() => businessStore.toggleActive(b.id)}>
                    {b.isActive ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
                    {b.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-10 rounded-xl">
                    <Link to={`/admin/businesses/${b.id}/edit`}><Pencil className="mr-1.5 h-4 w-4" />Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="h-10 rounded-xl text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(b.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" />Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-soft md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Views</th>
                  <th className="px-4 py-3 font-semibold text-right">Rating</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={b.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1 font-semibold">
                            {b.name}
                            {b.isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
                          </p>
                          <p className="text-xs text-muted-foreground">{b.barangay}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{b.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.isFeatured && <Badge className="border-0 gradient-sunset text-[10px] text-accent-foreground">Featured</Badge>}
                        {!b.isActive && <Badge variant="outline" className="text-[10px]">Hidden</Badge>}
                        {b.isActive && !b.isFeatured && <Badge variant="secondary" className="text-[10px]">Live</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{b.viewCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{b.rating.toFixed(1)} ★</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-9 w-9" title={b.isFeatured ? "Unfeature" : "Feature"}
                          onClick={() => businessStore.toggleFeatured(b.id)}>
                          <Star className={`h-4 w-4 ${b.isFeatured ? "fill-accent text-accent" : ""}`} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9" title={b.isActive ? "Hide" : "Show"}
                          onClick={() => businessStore.toggleActive(b.id)}>
                          {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-9 w-9" title="View live">
                          <Link to={`/business/${b.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-9 w-9" title="Edit">
                          <Link to={`/admin/businesses/${b.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:text-destructive" title="Delete"
                          onClick={() => setPendingDelete(b.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this business?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the listing from the directory. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminBusinesses;
