import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";

export const AdminLogin = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (signIn(code)) {
      toast({ title: "Welcome back", description: "Signed in to admin." });
      navigate("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-ocean text-primary-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">Admin sign-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the temporary passcode to access the admin.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            placeholder="Passcode"
            className="h-12 rounded-2xl text-base"
            aria-invalid={error}
          />
          {error && <p className="text-sm text-destructive">Incorrect passcode.</p>}
          <Button type="submit" className="h-12 w-full rounded-2xl gradient-ocean text-primary-foreground">
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">
          Demo only. Replace with Lovable Cloud authentication before launch.
        </p>
      </div>
    </div>
  );
};
