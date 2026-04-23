import JSZip from "jszip";
import type { Category, PriceRange } from "@/types/business";

export interface ParsedPlacemark {
  name: string;
  description: string;
  shortDescription: string;
  folder: string;
  lat: number;
  lng: number;
  images: string[];
  category: Category;
  // raw extended data for inspection
  extra: Record<string, string>;
}

const decodeEntities = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripCdata = (s: string) => {
  const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return (m ? m[1] : s).trim();
};

const stripHtml = (s: string) =>
  decodeEntities(s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();

const KEYWORDS: Record<Category, RegExp> = {
  resorts: /resort|hotel|inn|hostel|guesthouse|guest house|lodge|villa|cottage|homestay|pension|suites|stays?|huts?|transient|accommodation/i,
  restaurants: /restaurant|cafe|café|coffee|bar|grill|eatery|kitchen|resto|bistro|pizzeria|bakery|food/i,
  tours: /tour|island hopping|dive|diving|snorkel|adventure|trek|excursion|kayak|paddle/i,
  transport: /transport|tricycle|van|shuttle|rental|rent[- ]?a[- ]?(car|bike|motor)|transfer|taxi/i,
  shops: /shop|store|souvenir|mart|sari[- ]?sari|boutique|market/i,
  services: /spa|massage|laundry|salon|repair|clinic|service/i,
};

const guessCategory = (name: string, folder: string, desc: string): Category => {
  const hay = `${name} ${folder} ${desc}`;
  const order: Category[] = ["resorts", "restaurants", "tours", "transport", "shops", "services"];
  for (const c of order) if (KEYWORDS[c].test(hay)) return c;
  return "resorts"; // San Vicente TREs default to accommodation
};

const parseExtended = (block: string): Record<string, string> => {
  const out: Record<string, string> = {};
  const re = /<Data\s+name="([^"]+)">\s*<value>([\s\S]*?)<\/value>\s*<\/Data>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    out[m[1]] = decodeEntities(m[2]).trim();
  }
  return out;
};

const tag = (block: string, name: string) => {
  const re = new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`);
  const m = block.match(re);
  return m ? m[1].trim() : "";
};

export const parseKmlString = (kml: string): ParsedPlacemark[] => {
  const out: ParsedPlacemark[] = [];

  // Walk folders so we can attach a folder name to each placemark
  const folderRe = /<Folder>([\s\S]*?)<\/Folder>/g;
  const folders: { name: string; body: string }[] = [];
  let fm: RegExpExecArray | null;
  while ((fm = folderRe.exec(kml))) {
    const body = fm[1];
    const fname = stripCdata(tag(body, "name") || "");
    folders.push({ name: fname, body });
  }
  // If no folders, treat whole doc as one
  const blocks = folders.length ? folders : [{ name: "", body: kml }];

  for (const f of blocks) {
    const placeRe = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let pm: RegExpExecArray | null;
    while ((pm = placeRe.exec(f.body))) {
      const block = pm[1];
      const nameRaw = tag(block, "name");
      const name = stripCdata(nameRaw);
      if (!name) continue;

      const coordsRaw = tag(block, "coordinates");
      if (!coordsRaw) continue;
      const [lngS, latS] = coordsRaw.split(/\s+|,/).filter(Boolean);
      const lng = parseFloat(lngS);
      const lat = parseFloat(latS);
      if (!isFinite(lat) || !isFinite(lng)) continue;

      const ext = parseExtended(block);
      const cleanDesc = ext["description"] ?? stripHtml(stripCdata(tag(block, "description")));
      const media = (ext["gx_media_links"] ?? "")
        .split(/\s+/)
        .map((u) => u.trim())
        .filter((u) => /^https?:\/\//.test(u));

      const short = cleanDesc
        ? cleanDesc.replace(/\s+/g, " ").slice(0, 140)
        : `${name} in ${f.name || "San Vicente"}`;

      out.push({
        name,
        description: cleanDesc,
        shortDescription: short,
        folder: f.name,
        lat,
        lng,
        images: media,
        category: guessCategory(name, f.name, cleanDesc),
        extra: ext,
      });
    }
  }

  return out;
};

export const parseKmzFile = async (file: File): Promise<ParsedPlacemark[]> => {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "kml") {
    const text = await file.text();
    return parseKmlString(text);
  }
  // KMZ: zip containing doc.kml
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const kmlEntry =
    zip.file("doc.kml") ||
    Object.values(zip.files).find((f) => f.name.toLowerCase().endsWith(".kml"));
  if (!kmlEntry) throw new Error("No .kml file found inside KMZ");
  const text = await kmlEntry.async("string");
  let parsed = parseKmlString(text);

  // Handle NetworkLink: if no placemarks but there's an external link, fetch it
  if (parsed.length === 0) {
    const linkMatch = text.match(/<NetworkLink>[\s\S]*?<href>([^<]+)<\/href>[\s\S]*?<\/NetworkLink>/);
    if (linkMatch) {
      const href = linkMatch[1].trim();
      const res = await fetch(href);
      const buf = await res.arrayBuffer();
      // could be kmz or kml
      try {
        const inner = await JSZip.loadAsync(buf);
        const innerKml =
          inner.file("doc.kml") ||
          Object.values(inner.files).find((f) => f.name.toLowerCase().endsWith(".kml"));
        if (innerKml) parsed = parseKmlString(await innerKml.async("string"));
      } catch {
        parsed = parseKmlString(new TextDecoder().decode(buf));
      }
    }
  }

  return parsed;
};

export const fetchKmlFromUrl = async (url: string): Promise<ParsedPlacemark[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
  const buf = await res.arrayBuffer();
  // Try as KMZ first
  try {
    const zip = await JSZip.loadAsync(buf);
    const kmlEntry =
      zip.file("doc.kml") ||
      Object.values(zip.files).find((f) => f.name.toLowerCase().endsWith(".kml"));
    if (kmlEntry) {
      const text = await kmlEntry.async("string");
      let parsed = parseKmlString(text);
      if (parsed.length === 0) {
        const linkMatch = text.match(/<NetworkLink>[\s\S]*?<href>([^<]+)<\/href>[\s\S]*?<\/NetworkLink>/);
        if (linkMatch) parsed = await fetchKmlFromUrl(linkMatch[1].trim());
      }
      return parsed;
    }
  } catch {
    /* fall through to text */
  }
  return parseKmlString(new TextDecoder().decode(buf));
};

// Heuristic: derive a barangay from folder name (e.g. "Port_Barton_TREs" -> "Port Barton")
export const folderToBarangay = (folder: string): string => {
  if (!folder) return "San Vicente";
  return folder
    .replace(/_?TREs?_?/gi, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "San Vicente";
};

export const defaultPriceRange = (): PriceRange => "₱₱";
