import { Link } from "react-router-dom";
import { Building2, Eye, MousePointerClick, Star, BadgeCheck, Plus, ListChecks, Sparkles } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useBusinesses, analytics } from "@/data/businessStore";

const StatCard = ({ icon: Icon, label, value, accent }: { icon: typeof Eye; label: string; value: string | number; accent?: boolean }) => (
  <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent ? "bg-accent-soft text-accent" : "bg-secondary text-primary"}`}>
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <p className="mt-3 font-display text-3xl font-bold">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const businesses = useBusinesses();
  const featured = businesses.filter((b) => b.isFeatured).length;
  const verified = businesses.filter((b) => b.isVerified).length;
  const inactive = businesses.filter((b) => !b.isActive).length;
  const totals = analytics.totals();

  // Top performers
  const top = [...businesses]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Dashboard"
        description="At-a-glance overview of your directory."
        action={
          <Button asChild className="h-11 rounded-full gradient-sunset text-accent-foreground">
            <Link to="/admin/businesses/new"><Plus className="mr-1.5 h-4 w-4" />Add business</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Building2} label="Total" value={businesses.length} />
        <StatCard icon={Sparkles} label="Featured" value={featured} accent />
        <StatCard icon={BadgeCheck} label="Verified" value={verified} />
        <StatCard icon={Eye} label="Inactive" value={inactive} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Eye} label="Total views" value={totals.views} />
        <StatCard icon={MousePointerClick} label="Total clicks" value={totals.clicks} accent />
        <StatCard
          icon={Star}
          label="Avg. rating"
          value={
            businesses.length
              ? (businesses.reduce((s, b) => s + b.rating, 0) / businesses.length).toFixed(1)
              : "—"
          }
        />
        <StatCard
          icon={MousePointerClick}
          label="CTR"
          value={totals.views ? `${Math.round((totals.clicks / totals.views) * 100)}%` : "—"}
        />
      </div>

      {/* Top performers */}
      <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Top performers</h2>
          <Link to="/admin/businesses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No businesses yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {top.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <img src={b.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/businesses/${b.id}/edit`} className="block truncate font-semibold hover:underline">
                    {b.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{b.barangay} · {b.category}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center justify-end gap-1 font-semibold">
                    <Eye className="h-4 w-4 text-muted-foreground" /> {b.viewCount}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/businesses"
          className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
        >
          <ListChecks className="h-7 w-7 text-primary" />
          <h3 className="mt-3 font-display text-lg font-bold">Manage businesses</h3>
          <p className="text-sm text-muted-foreground">Edit, feature, verify, or remove listings.</p>
        </Link>
        <Link
          to="/admin/businesses/new"
          className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
        >
          <Plus className="h-7 w-7 text-accent" />
          <h3 className="mt-3 font-display text-lg font-bold">Add a new business</h3>
          <p className="text-sm text-muted-foreground">Create a fresh listing with photos, hours, and details.</p>
        </Link>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
