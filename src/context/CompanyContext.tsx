import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { normalizeCompanyProfile, normalizeDashboardSkills, type CompanyProfile, type DashboardSkill } from "@/lib/companyData";

export const STORAGE_KEY = "selected-company";
export interface SelectedCompany { companyId: number; companyName: string; logoUrl: string }

interface Ctx {
  ready: boolean;
  selected: SelectedCompany | null;
  profile: CompanyProfile | null;
  skills: DashboardSkill[];
  select: (c: SelectedCompany) => void;
  clear: () => void;
}

const CompanyContext = createContext<Ctx | null>(null);

export function readStoredCompany(): SelectedCompany | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SelectedCompany;
    return SEED_COMPANIES.some((c) => c.company_id === p.companyId) ? p : null;
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

  const value = useMemo<Ctx>(() => {
    const row = selected ? SEED_COMPANIES.find((c) => c.company_id === selected.companyId) : undefined;
    return {
      ready,
      selected,
      profile: row ? normalizeCompanyProfile(row.full_json, row.short_json, row.company_id) : null,
      skills: row ? normalizeDashboardSkills(row.skill_levels) : [],
      select,
      clear,
    };
  }, [ready, selected, select, clear]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const c = useContext(CompanyContext);
  if (!c) throw new Error("useCompany must be used inside CompanyProvider");
  return c;
}
