import { ReactNode } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLogin } from "./AdminLogin";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { isAuthed } = useAdminAuth();
  if (!isAuthed) return <AdminLogin />;
  return <>{children}</>;
};
