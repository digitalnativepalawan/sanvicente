import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const KEY = "sv-admin-auth";
const PASSCODE = "5309"; // TEMPORARY — replace with Lovable Cloud auth before launch

interface AdminAuthValue {
  isAuthed: boolean;
  signIn: (code: string) => boolean;
  signOut: () => void;
}

const Ctx = createContext<AdminAuthValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(KEY) === "1");
  }, []);

  const signIn = (code: string) => {
    if (code === PASSCODE) {
      sessionStorage.setItem(KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const signOut = () => {
    sessionStorage.removeItem(KEY);
    setAuthed(false);
  };

  return <Ctx.Provider value={{ isAuthed, signIn, signOut }}>{children}</Ctx.Provider>;
};

export const useAdminAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return v;
};
