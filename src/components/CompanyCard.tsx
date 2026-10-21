import { memo } from "react";
import { ArrowRight, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";
import { CATEGORY_STYLES } from "@/lib/college";
import { isNullish, type CompanySummary } from "@/lib/companyData";
import { cn } from "@/lib/utils";

const Val = ({ v }: { v: string }) =>
  isNullish(v) ? <span className="italic text-muted-foreground">not publicly available</span> : <span>{v}</span>;

export const CompanyCard = memo(function CompanyCard({ company, onOpen }: { company: CompanySummary; onOpen: (c: CompanySummary) => void }) {
  const down = company.yoyGrowthRate.trim().startsWith("-");
  const Trend = down ? TrendingDown : TrendingUp;
  return (
    <button
      type="button"
      onClick={() => onOpen(company)}
      className="group relative flex flex-col rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} websiteUrl={company.websiteUrl} />
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", CATEGORY_STYLES[company.companyType])}>{company.companyType}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold">{company.name}</h3>
      <p className="text-xs text-muted-foreground">{company.shortName}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /><Val v={company.headquarters} /></li>
        <li className="flex items-center gap-2"><Users className="h-4 w-4" /><Val v={company.employeeSize} /></li>
        <li className={cn("flex items-center gap-2", down ? "text-destructive" : "text-standard")}>
          <Trend className="h-4 w-4" /><Val v={company.yoyGrowthRate} /> <span className="text-muted-foreground">YoY</span>
        </li>
      </ul>
      <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </button>
  );
});
