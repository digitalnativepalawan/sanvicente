import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { RequireAdmin } from "@/components/RequireAdmin";
import Index from "./pages/Index.tsx";
import Category from "./pages/Category.tsx";
import BusinessProfile from "./pages/BusinessProfile.tsx";
import SearchPage from "./pages/Search.tsx";
import MapView from "./pages/MapView.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminBusinesses from "./pages/admin/Businesses.tsx";
import BusinessForm from "./pages/admin/BusinessForm.tsx";
import ImportKmz from "./pages/admin/ImportKmz.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/business/:slug" element={<BusinessProfile />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="/admin/businesses" element={<RequireAdmin><AdminBusinesses /></RequireAdmin>} />
              <Route path="/admin/businesses/new" element={<RequireAdmin><BusinessForm /></RequireAdmin>} />
              <Route path="/admin/businesses/import" element={<RequireAdmin><ImportKmz /></RequireAdmin>} />
              <Route path="/admin/businesses/:id/edit" element={<RequireAdmin><BusinessForm /></RequireAdmin>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
