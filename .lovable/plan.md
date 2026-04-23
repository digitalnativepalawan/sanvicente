

## Map View with Leaflet + OpenStreetMap

### 1. Database
New migration adds coordinates to `businesses`:
- `latitude double precision` (nullable)
- `longitude double precision` (nullable)
- btree index on `(latitude, longitude)`

### 2. Types & store
- `src/types/business.ts`: add optional `latitude?: number`, `longitude?: number`.
- `src/data/businessStore.ts`: map `latitude`/`longitude` in both `rowToBusiness` and `businessToRow` so reads, writes, and cloud upserts include coords.

### 3. KMZ importer
- `src/pages/admin/ImportKmz.tsx`: copy `r.lat`/`r.lng` from each parsed placemark into `latitude`/`longitude` on the created business so re-import populates coords.

### 4. Map View page (`src/pages/MapView.tsx`)
- Install `leaflet`, `react-leaflet`, `@types/leaflet`. Import `leaflet/dist/leaflet.css` once.
- Fix default marker icons (standard react-leaflet workaround using bundled PNGs).
- Fetch businesses where `latitude is not null` from Supabase on mount.
- Full-width map below header, centered on San Vicente (`10.4762, 119.2182`, zoom 12).
- Theme-aware `<TileLayer>` keyed by theme so it remounts on toggle:
  - Light: OSM standard `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Dark: Carto Dark Matter `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- One `<Marker>` per business with a `<Popup>` showing:
  - Business name (bold)
  - Category badge
  - Short description
  - "View Details" button → `/business/:slug`
- Loading + empty states (e.g. "No businesses with coordinates yet — re-import your KMZ").

### 5. Routing & navigation
- `src/App.tsx`: add `<Route path="/map" element={<MapView />} />`.
- `src/components/Header.tsx`: add a "Map" link in the desktop nav row (next to category links) and in the mobile drawer.

### 6. After deploy
Re-upload the KMZ via Admin → Import KMZ. The 484 placemarks will be saved with coordinates and appear as pins on `/map`.

### Files
- new: `supabase/migrations/<ts>_add_business_coords.sql`
- new: `src/pages/MapView.tsx`
- edit: `src/types/business.ts`, `src/data/businessStore.ts`, `src/pages/admin/ImportKmz.tsx`, `src/App.tsx`, `src/components/Header.tsx`
- `package.json`: add `leaflet`, `react-leaflet`, `@types/leaflet`

