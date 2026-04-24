import { useEffect, useState, useRef } from "react";
import { Loader2, Save, Plus, Trash2, Upload as UploadIcon } from "lucide-react";
import { AdminLayout, AdminPageHeader } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useSiteSettings, type SiteSettings, type LinkItem } from "@/hooks/use-site-settings";
import { uploadImage } from "@/lib/upload";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/data/categories";

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <Card className="space-y-4 p-5 md:p-6">
    <div>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </Card>
);

const LinksEditor = ({
  value,
  onChange,
  addLabel,
}: {
  value: LinkItem[];
  onChange: (v: LinkItem[]) => void;
  addLabel: string;
}) => {
  const update = (i: number, patch: Partial<LinkItem>) => {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { label: "", url: "" }]);
  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
      {value.map((link, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <Input
            placeholder="Label"
            value={link.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            placeholder="https://..."
            value={link.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => remove(i)} aria-label="Remove link">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
};

const CategoryImagesEditor = ({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (slug: string, file: File) => {
    setBusy(slug);
    try {
      const url = await uploadImage(file, "logos", 0);
      onChange({ ...value, [slug]: url });
      toast({ title: "Image uploaded", description: "Click Save to apply." });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const clear = (slug: string) => {
    const next = { ...value };
    delete next[slug];
    onChange(next);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CATEGORIES.map((c) => {
        const url = value?.[c.slug];
        return (
          <div key={c.slug} className="flex gap-3 rounded-xl border border-border p-3">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
              {url ? (
                <img src={url} alt={c.label} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted-foreground">Default</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="truncate text-sm font-semibold">{c.label}</div>
              <input
                ref={(el) => (inputs.current[c.slug] = el)}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(c.slug, f);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputs.current[c.slug]?.click()}
                  disabled={busy === c.slug}
                >
                  {busy === c.slug ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <UploadIcon className="mr-1 h-3.5 w-3.5" />}
                  {url ? "Change" : "Upload"}
                </Button>
                {url && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => clear(c.slug)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AdminSettings = () => {
  const { settings, loading, save } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { setForm(settings); }, [settings]);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      toast({ title: "Settings saved", description: "Your changes are live." });
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, "logos", 0);
      set("logo_url", url);
      toast({ title: "Logo uploaded", description: "Click Save to apply." });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Site settings"
        description="Control branding, navigation, footer, and contact info across the website."
        action={
          <Button onClick={handleSave} disabled={saving} className="h-11 rounded-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6">
        <Section title="Logo & branding" description="Upload your logo and set the display size in each location.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-muted">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo preview" className="max-h-24 max-w-24 object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">No logo</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Logo image</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoUpload(f);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadIcon className="mr-2 h-4 w-4" />}
                  Upload logo
                </Button>
              </div>
              <Input
                value={form.logo_url}
                onChange={(e) => set("logo_url", e.target.value)}
                placeholder="Or paste an image URL"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Header size: {form.logo_size_header}px</Label>
              <Input
                type="range" min={24} max={120}
                value={form.logo_size_header}
                onChange={(e) => set("logo_size_header", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Footer size: {form.logo_size_footer}px</Label>
              <Input
                type="range" min={24} max={160}
                value={form.logo_size_footer}
                onChange={(e) => set("logo_size_footer", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Hero size: {form.logo_size_hero}px</Label>
              <Input
                type="range" min={48} max={240}
                value={form.logo_size_hero}
                onChange={(e) => set("logo_size_hero", Number(e.target.value))}
              />
            </div>
          </div>
        </Section>

        <Section title="Site identity" description="Name and short tagline used across the site.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Site name</Label>
              <Input value={form.site_name} onChange={(e) => set("site_name", e.target.value)} />
            </div>
            <div>
              <Label>Site tagline</Label>
              <Input value={form.site_tagline} onChange={(e) => set("site_tagline", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Footer description</Label>
              <Textarea rows={3} value={form.footer_tagline} onChange={(e) => set("footer_tagline", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Copyright text</Label>
              <Input
                value={form.copyright_text}
                onChange={(e) => set("copyright_text", e.target.value)}
                placeholder="© {year} Your Brand. All rights reserved."
              />
              <p className="mt-1 text-xs text-muted-foreground">Use {"{year}"} to insert the current year automatically.</p>
            </div>
          </div>
        </Section>

        <Section title="Contact" description="Optional public contact info shown in the footer.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="Social media" description="Leave blank to hide a network from the footer.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Facebook URL</Label><Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} /></div>
            <div><Label>Instagram URL</Label><Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} /></div>
            <div><Label>TikTok URL</Label><Input value={form.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} /></div>
            <div><Label>YouTube URL</Label><Input value={form.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} /></div>
            <div><Label>X (Twitter) URL</Label><Input value={form.x_url} onChange={(e) => set("x_url", e.target.value)} /></div>
            <div><Label>External website URL</Label><Input value={form.website_url} onChange={(e) => set("website_url", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Footer links" description="Extra links shown in the Directory column of the footer.">
          <LinksEditor
            value={form.footer_links}
            onChange={(v) => set("footer_links", v)}
            addLabel="Add footer link"
          />
        </Section>

        <Section title="Featured / partner links" description="Showcase partner sites or other web apps in their own footer column.">
          <LinksEditor
            value={form.partner_links}
            onChange={(v) => set("partner_links", v)}
            addLabel="Add featured link"
          />
        </Section>

        <Section title="Category images" description="Upload the photo shown on each category card on the homepage. Recommended: square images, at least 800×800.">
          <CategoryImagesEditor
            value={form.category_images}
            onChange={(v) => set("category_images", v)}
          />
        </Section>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="h-11 rounded-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
