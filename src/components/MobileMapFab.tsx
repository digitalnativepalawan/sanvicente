import { Link, useLocation } from "react-router-dom";
import { Map as MapIcon } from "lucide-react";

/** Floating action button shown only on mobile, links to /map. Hidden on the map route itself. */
export const MobileMapFab = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/map")) return null;

  return (
    <Link
      to="/map"
      aria-label="Open map view"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 md:hidden inline-flex h-14 items-center gap-2 rounded-full bg-foreground pl-5 pr-6 text-sm font-semibold text-background shadow-elegant transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
    >
      <MapIcon className="h-5 w-5" />
      Map view
    </Link>
  );
};
