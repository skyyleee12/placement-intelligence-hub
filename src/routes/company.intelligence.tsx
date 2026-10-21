import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Linkedin, Globe, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/context/CompanyContext";
import { buildIntelligenceSections, type IntelSection } from "@/data/intelligenceData";
import { isNullish } from "@/lib/companyData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company/intelligence")({
  head: () => ({
    meta: [
      { title: "Company Intelligence · JSSUni Placement Hub" },
      { name: "description", content: "22-section company research profile for campus placement preparation." },
      { property: "og:title", content: "Company Intelligence · JSSUni Placement Hub" },
      { property: "og:description", content: "Deep company research across 22 intelligence sections." },
    ],
  }),
  component: CompanyIntelligence,
});

const isUrl = (v: string) => /^https?:\/\//i.test(v);

function renderValue(raw?: string) {
  const v = (raw ?? "").trim();
  if (isNullish(v)) return <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Not Available</span>;
  if (isUrl(v)) {
    const video = /youtube|youtu\.be|vimeo/i.test(v);
    return (
      <a href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
        {video ? <PlayCircle className="h-4 w-4 shrink-0" /> : <ExternalLink className="h-3.5 w-3.5 shrink-0" />}{v.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  }
  if (/^\d(\.\d)?\/5$/.test(v)) {
    const n = parseFloat(v);
    return (
      <span className="inline-flex items-center gap-1 font-medium">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(n) ? "fill-regular text-regular" : "text-border")} />)}
        <span className="ml-1">{v}</span>
      </span>
    );
  }
  if (v.length > 140) return <p className="leading-relaxed">{v}</p>;
  const parts = v.includes(";") ? v.split(";") : v.length < 120 && v.split(",").length > 2 ? v.split(",") : null;
  if (parts) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {parts.map((p) => p.trim()).filter(Boolean).map((p) => (
          <span key={p} className="rounded-md border bg-secondary px-2 py-0.5 text-xs">{p}</span>
        ))}
      </div>
    );
  }
  return <span>{v}</span>;
}

const FieldRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col gap-1 border-b py-3 last:border-0 sm:flex-row sm:gap-4">
    <dt className="text-sm text-muted-foreground sm:w-1/3">{label}</dt>
    <dd className="text-sm sm:w-2/3">{renderValue(value)}</dd>
  </div>
);

const SectionCard = memo(function SectionCard({ section, index }: { section: IntelSection; index: number }) {
  const filled = section.fields.filter((f) => !isNullish(f.value)).length;
  return (
    <section id={section.id} data-idx={index} className="scroll-mt-32 rounded-xl border bg-card">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><section.icon className="h-4 w-4" /></span>
        <h2 className="flex-1 text-base font-semibold">{section.title}</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{filled}/{section.fields.length}</span>
      </header>
      <dl className="px-4">{section.fields.map((f) => <FieldRow key={f.key} label={f.label} value={f.value} />)}</dl>
    </section>
  );
});

function CompanyIntelligence() {
  const { profile } = useCompany();
  const sections = useMemo(() => buildIntelligenceSections(profile ?? undefined), [profile]);
  const [active, setActive] = useState(0);
  const isScrollingRef = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(Number((vis.target as HTMLElement).dataset.idx));
      },
      { rootMargin: "-130px 0px -60% 0px" },
    );
    document.querySelectorAll("section[data-idx]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const scrollToSection = useCallback((idx: number) => {
    isScrollingRef.current = true;
    setActive(idx);
    document.getElementById(sections[idx].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { isScrollingRef.current = false; }, 800);
  }, [sections]);

  if (!profile) return null;
  const { summary, fields } = profile;

  return (
    <div>
      <div className="sticky top-0 z-20 border-b bg-background">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <CompanyLogo name={summary.name} logoUrl={summary.logoUrl} websiteUrl={summary.websiteUrl} />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{summary.name}</h1>
              <span className="rounded-full border bg-accent px-2 py-0.5 text-xs text-accent-foreground">{summary.category || "Industry"}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {!isNullish(fields.website_url) && (
              <Button asChild variant="outline" size="sm"><a href={fields.website_url} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /><span className="hidden sm:inline">Website</span></a></Button>
            )}
            {!isNullish(fields.linkedin_url) && (
              <Button asChild variant="outline" size="sm"><a href={fields.linkedin_url} target="_blank" rel="noreferrer"><Linkedin className="h-4 w-4" /><span className="hidden sm:inline">LinkedIn</span></a></Button>
            )}
          </div>
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {sections.map((s, i) => (
            <button key={s.id} ref={(el) => { tabRefs.current[i] = el; }} onClick={() => scrollToSection(i)}
              className={cn("shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                i === active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary")}>
              {s.title}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        {sections.map((s, i) => <SectionCard key={s.id} section={s} index={i} />)}
      </div>
    </div>
  );
}
