import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ListChecks, LogOut, Plus, Eye, Upload, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/businesses", label: "Businesses", icon: ListChecks, end: false },
  { to: "/admin/claims", label: "Claims", icon: ShieldCheck, end: false },
  { to: "/admin/businesses/import", label: "Import KMZ", icon: Upload, end: true },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Banner */}
      <div className="bg-accent/15 px-4 py-2 text-center text-xs font-medium text-accent">
        Demo admin · passcode auth · replace with Lovable Cloud auth before launch
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3 px-4">
          <Link to="/admin" className="flex items-center gap-2 font-display text-base font-bold md:text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-ocean text-primary-foreground">SV</span>
            <span>Admin</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {navItems.map((n) => {
              const active = n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-smooth ${
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <n.icon className="mr-1.5 inline h-4 w-4" />{n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="h-11 w-11 rounded-full">
              <Link to="/" aria-label="View public site"><Eye className="h-5 w-5" /></Link>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={() => { signOut(); navigate("/admin"); }}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {navItems.map((n) => {
            const active = n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                <n.icon className="mr-1.5 inline h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
};

export const AdminPageHeader = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);
