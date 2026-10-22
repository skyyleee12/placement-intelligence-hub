import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CompanyCard } from "@/components/CompanyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { normalizeCompanySummary, type CompanySummary, type CompanyType } from "@/lib/companyData";
import { COLLEGE_NAME, COLLEGE_SHORT } from "@/lib/college";
import { useCompany } from "@/context/CompanyContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COLLEGE_NAME} Companies Research & Placement Analytics Portal` },
      { name: "description", content: "Browse recruiting companies and research them for campus placements." },
      { property: "og:title", content: `${COLLEGE_NAME} Placement Intelligence Hub` },
      { property: "og:description", content: "Your strategic edge for campus placements." },
    ],
  }),
  component: Index,
});

const FILTERS: ("All" | CompanyType)[] = ["All", "Super Dream", "Dream", "Standard", "Regular"];
const PILL: Record<string, string> = {
  All: "border-foreground/20 text-foreground data-[on=true]:bg-foreground data-[on=true]:text-background",
  "Super Dream": "border-super-dream/40 text-super-dream data-[on=true]:bg-super-dream data-[on=true]:text-primary-foreground",
  Dream: "border-dream/40 text-dream data-[on=true]:bg-dream data-[on=true]:text-primary-foreground",
  Standard: "border-standard/40 text-standard data-[on=true]:bg-standard data-[on=true]:text-primary-foreground",
  Regular: "border-regular/40 text-regular data-[on=true]:bg-regular data-[on=true]:text-primary-foreground",
};

function Index() {
  const navigate = useNavigate();
  const { select } = useCompany();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200); return () => clearTimeout(t); }, [query]);

  const companies = useMemo(() => SEED_COMPANIES.map((c) => normalizeCompanySummary(c.short_json, c.company_id)), []);
  const searched = useMemo(
    () => companies.filter((c) => !debounced || `${c.name} ${c.shortName} ${c.headquarters}`.toLowerCase().includes(debounced)),
    [companies, debounced],
  );
  const shown = filter === "All" ? searched : searched.filter((c) => c.companyType === filter);

  const open = useCallback(
    (c: CompanySummary) => {
      select({ companyId: c.id, companyName: c.name, logoUrl: c.logoUrl });
      navigate({ to: "/company/intelligence" });
    },
    [select, navigate],
  );

  const reset = () => { setQuery(""); setFilter("All"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <span className="inline-block rounded-full border bg-accent px-3 py-1 text-xs font-semibold tracking-wider text-accent-foreground">
            {COLLEGE_SHORT.toUpperCase()} · INTELLIGENCE PLATFORM
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {COLLEGE_NAME} Companies Research & Placement Analytics Portal
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">Your strategic edge for campus placements</p>
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, locations…"
              aria-label="Search companies"
              className="h-11 w-full rounded-lg border bg-card pl-9 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map((f) => {
            const count = f === "All" ? searched.length : searched.filter((c) => c.companyType === f).length;
            return (
              <button key={f} data-on={filter === f} onClick={() => setFilter(f)}
                className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors", PILL[f])}>
                {f} <span className="ml-1 opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-heading text-lg font-semibold">No companies match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or category.</p>
            <Button className="mt-4" variant="outline" onClick={reset}>Reset filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((c) => <CompanyCard key={c.id} company={c} onOpen={open} />)}
          </div>
        )}
      </main>
    </div>
  );
}
