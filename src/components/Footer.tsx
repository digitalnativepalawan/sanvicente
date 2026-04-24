import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Globe, Mail, Phone, Music2, Send } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { toast } from "sonner";

export const Footer = () => {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");

  const socials: Array<{ url: string; label: string; Icon: typeof Facebook }> = [
    { url: settings.facebook_url, label: "Facebook", Icon: Facebook },
    { url: settings.instagram_url, label: "Instagram", Icon: Instagram },
    { url: settings.tiktok_url, label: "TikTok", Icon: Music2 },
    { url: settings.youtube_url, label: "YouTube", Icon: Youtube },
    { url: settings.x_url, label: "X", Icon: Twitter },
    { url: settings.website_url, label: "Website", Icon: Globe },
  ].filter((s) => s.url);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container px-4 py-12 md:py-20">
        {/* 4 columns desktop, stacked mobile */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Logo + tagline */}
          <div>
            <Link to="/" className="inline-flex items-center" aria-label={`${settings.site_name} home`}>
              <img
                src={settings.logo_url}
                alt={`${settings.site_name} logo`}
                style={{ height: `${settings.logo_size_footer}px` }}
                className="w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.footer_tagline}
            </p>

            {(settings.contact_email || settings.contact_phone) && (
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {settings.contact_email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-foreground">{settings.contact_email}</a>
                  </li>
                )}
                {settings.contact_phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-foreground">{settings.contact_phone}</a>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Categories</h3>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Directory */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Directory</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Search</Link></li>
              <li><Link to="/map" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Map</Link></li>
              <li><Link to="/list-your-business" className="text-sm text-muted-foreground hover:text-primary transition-smooth">List your business</Link></li>
              {settings.footer_links.map((l, i) => (
                <li key={i}>
                  <a href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter signup */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Stay in the loop</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              New listings, hidden gems, and travel tips — straight to your inbox.
            </p>
            <form onSubmit={onSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 min-w-0 rounded-full border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-smooth hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Social icons row above copyright */}
        {socials.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {socials.map(({ url, label, Icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}

        <div className={`${socials.length > 0 ? 'mt-6' : 'mt-12 border-t border-border pt-6'} flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between`}>
          <p>{settings.copyright_text.replace("{year}", String(new Date().getFullYear()))}</p>
          <p>A community-built directory for travelers and locals.</p>
        </div>
      </div>
    </footer>
  );
};
