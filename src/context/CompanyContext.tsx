// Holds only the visitor's selected company (persisted in localStorage).
// Company data itself is fetched per page via the hooks in src/lib/companyApi.ts
// (Phase 2: Supabase). seedCompanies.ts remains in the repo as a documented fallback
// but is no longer imported in the live render path.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const STORAGE_KEY = "selected-company";
export interface SelectedCompany { companyId: number; companyName: string; logoUrl: string }

interface Ctx {
  ready: boolean;
  selected: SelectedCompany | null;
  select: (c: SelectedCompany) => void;
  clear: () => void;
}

const CompanyContext = createContext<Ctx | null>(null);

export function readStoredCompany(): SelectedCompany | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SelectedCompany;
    return typeof p?.companyId === "number" && typeof p?.companyName === "string" ? p : null;
  } catch {
    return null;
  }
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSelected(readStoredCompany());
    setReady(true);
  }, []);

  const select = useCallback((c: SelectedCompany) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setSelected(c);
  }, []);
  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSelected(null);
  }, []);

  const value = useMemo<Ctx>(() => ({ ready, selected, select, clear }), [ready, selected, select, clear]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const c = useContext(CompanyContext);
  if (!c) throw new Error("useCompany must be used inside CompanyProvider");
  return c;
}
