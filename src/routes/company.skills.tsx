import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Lock, CheckCircle2 } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompany } from "@/context/CompanyContext";
import { useCompanyProfile, useCompanySkills } from "@/lib/companyApi";
import { proficiencyToBloom, scoreToCriticality, type Bloom, type DashboardSkill } from "@/lib/companyData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company/skills")({
  head: () => ({
    meta: [
      { title: "Skill Intelligence · JSSUni Placement Hub" },
      { name: "description", content: "Required skills, Bloom levels and 10-level learning roadmaps per company." },
      { property: "og:title", content: "Skill Intelligence · JSSUni Placement Hub" },
      { property: "og:description", content: "Know exactly which skills to build and how far." },
    ],
  }),
  component: SkillIntelligence,
});

const BLOOM: Record<Bloom, { name: string; cls: string; bar: string }> = {
  CU: { name: "Conceptual Understanding", cls: "bg-bloom-cu/10 text-bloom-cu border-bloom-cu/30", bar: "bg-bloom-cu" },
  AP: { name: "Application", cls: "bg-bloom-ap/10 text-bloom-ap border-bloom-ap/30", bar: "bg-bloom-ap" },
  AS: { name: "Analysis", cls: "bg-bloom-as/10 text-bloom-as border-bloom-as/30", bar: "bg-bloom-as" },
  EV: { name: "Evaluation", cls: "bg-bloom-ev/10 text-bloom-ev border-bloom-ev/30", bar: "bg-bloom-ev" },
  CR: { name: "Creation", cls: "bg-bloom-cr/10 text-bloom-cr border-bloom-cr/30", bar: "bg-bloom-cr" },
};
const CRIT = {
  Critical: { cls: "text-expert", desc: "Score 7+ — must be interview-ready" },
  Important: { cls: "text-advanced", desc: "Score 5–6 — expect questions" },
  Baseline: { cls: "text-beginner", desc: "Below 5 — working familiarity" },
} as const;

function SkillCard({ skill, topics }: { skill: DashboardSkill; topics: string[] }) {
  const [open, setOpen] = useState(false);
  const bloom = proficiencyToBloom(skill.score);
  const crit = scoreToCriticality(skill.score);
  return (
    <div className="rounded-xl border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full p-4 text-left" aria-expanded={open}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold">{skill.name}</h3>
            <p className="text-xs text-muted-foreground">{skill.proficiency}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", BLOOM[bloom].cls)}>{bloom}</span>
            <span className="font-heading text-sm font-semibold">{skill.score}/10</span>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full", BLOOM[bloom].bar)} style={{ width: `${skill.score * 10}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={cn("font-semibold", CRIT[crit].cls)}>{crit}</span>
          <span className="flex items-center gap-1 text-muted-foreground">Roadmap <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} /></span>
        </div>
      </button>
      {open && (
        <ol className="border-t px-4 py-2">
          {topics.map((t, i) => {
            const lvl = i + 1;
            const locked = lvl > skill.score;
            return (
              <li key={lvl} className={cn("flex items-center gap-3 py-1.5 text-sm", locked && "text-muted-foreground opacity-60")}>
                <span className="w-6 shrink-0 font-heading text-xs font-semibold">L{lvl}</span>
                <span className="flex-1">{t}</span>
                {locked ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs"><Lock className="h-3.5 w-3.5" />Beyond scope</span>
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-standard" />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function SkillIntelligence() {
  const { selected } = useCompany();
  const profileQuery = useCompanyProfile(selected?.companyId);
  const skillsQuery = useCompanySkills(selected?.companyId);

  if (profileQuery.isLoading || skillsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }
  if (profileQuery.isError || skillsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-heading text-lg font-semibold">Couldn’t load skill intelligence</p>
          <p className="mt-1 text-sm text-muted-foreground">Check your connection and Supabase settings, then try again.</p>
          <Button className="mt-4" variant="outline" onClick={() => { profileQuery.refetch(); skillsQuery.refetch(); }}>Retry</Button>
        </div>
      </div>
    );
  }
  const profile = profileQuery.data;
  if (!profile) return null;
  const skills = skillsQuery.data?.skills ?? [];
  const topics = skillsQuery.data?.topics ?? {};
  const s = profile.summary;
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <header className="flex items-center gap-3 border-b pb-4">
        <CompanyLogo name={s.name} logoUrl={s.logoUrl} websiteUrl={s.websiteUrl} className="h-12 w-12" />
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{s.shortName || s.name} Skill Intelligence</h1>
          <p className="text-sm text-muted-foreground">{skills.length} skills required, sorted by importance</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(Object.keys(BLOOM) as Bloom[]).map((b) => (
          <div key={b} className={cn("rounded-lg border p-2 text-center", BLOOM[b].cls)}>
            <div className="font-heading text-sm font-bold">{b}</div>
            <div className="text-xs">{BLOOM[b].name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(Object.keys(CRIT) as (keyof typeof CRIT)[]).map((c) => (
          <div key={c} className="rounded-lg border bg-card p-3">
            <div className={cn("text-sm font-semibold", CRIT[c].cls)}>{c}</div>
            <div className="text-xs text-muted-foreground">{CRIT[c].desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {skills.map((sk) => <SkillCard key={sk.id} skill={sk} topics={topics[sk.id] ?? []} />)}
      </div>
    </div>
  );
}
