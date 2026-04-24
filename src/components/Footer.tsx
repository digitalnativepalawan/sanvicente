import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Globe, Mail, Phone, Music2 } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Footer = () => {
  const { settings } = useSiteSettings();

  const socials: Array<{ url: string; label: string; Icon: typeof Facebook }> = [
    { url: settings.facebook_url, label: "Facebook", Icon: Facebook },
    { url: settings.instagram_url, label: "Instagram", Icon: Instagram },
    { url: settings.tiktok_url, label: "TikTok", Icon: Music2 },
    { url: settings.youtube_url, label: "YouTube", Icon: Youtube },
    { url: settings.x_url, label: "X", Icon: Twitter },
    { url: settings.website_url, label: "Website", Icon: Globe },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
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
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
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

            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(({ url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-smooth hover:text-foreground hover:border-foreground/30"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Categories</h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Directory</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/search" className="text-sm text-muted-foreground hover:text-foreground">Search</Link></li>
                <li><Link to="/map" className="text-sm text-muted-foreground hover:text-foreground">Map</Link></li>
                <li><Link to="/list-your-business" className="text-sm text-muted-foreground hover:text-foreground">List your business</Link></li>
                {settings.footer_links.map((l, i) => (
                  <li key={i}>
                    <a href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {settings.partner_links.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Featured</h3>
                <ul className="mt-4 space-y-2">
                  {settings.partner_links.map((l, i) => (
                    <li key={i}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.copyright_text.replace("{year}", String(new Date().getFullYear()))}</p>
          <p>A community-built directory for travelers and locals.</p>
        </div>
      </div>
    </footer>
  );
};
