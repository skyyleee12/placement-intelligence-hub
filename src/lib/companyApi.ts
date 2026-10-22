// Phase 2 data-access layer. Read-only: companies come ONLY from public.company_json
// (short_json for cards, full_json for detail); skills from the 4 skill tables.
// All rows are piped through the existing normalizers in src/lib/companyData.ts.
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabaseClient";
import {
  asString,
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
  splitItems,
  type CompanyProfile,
  type CompanySummary,
  type DashboardSkill,
} from "@/lib/companyData";

export interface CompanySkillsResult {
  skills: DashboardSkill[];
  /** 10-level topic ladders per skill_set_id (level 1..10), same shape as seed SKILL_TOPICS. */
  topics: Record<number, string[]>;
}

async function fetchCompanies(): Promise<CompanySummary[]> {
  const { data, error } = await getSupabase()
    .from("company_json")
    .select("company_id, short_json")
    .order("company_id");
  if (error) throw error;
  return (data ?? []).map((r) => normalizeCompanySummary(r.short_json, r.company_id));
}

async function fetchCompanyProfile(id: number): Promise<CompanyProfile> {
  const { data, error } = await getSupabase()
    .from("company_json")
    .select("company_id, short_json, full_json")
    .eq("company_id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Company ${id} not found`);
  return normalizeCompanyProfile(data.full_json, data.short_json, data.company_id);
}

const toTopics = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(asString).filter(Boolean) : splitItems(asString(v));

async function fetchCompanySkills(id: number): Promise<CompanySkillsResult> {
  const supabase = getSupabase();
  const [levelsRes, mastersRes, profsRes, topicsRes] = await Promise.all([
    supabase.from("company_skill_levels").select("skill_set_id, required_level, required_proficiency_level_id").eq("company_id", id),
    supabase.from("skill_set_master").select("skill_set_id, skill_set_name, short_name"),
    supabase.from("proficiency_levels").select("proficiency_level_id, proficiency_name, proficiency_code"),
    supabase.from("skill_set_topics").select("skill_set_id, level_number, topics"),
  ]);
  for (const r of [levelsRes, mastersRes, profsRes, topicsRes]) if (r.error) throw r.error;

  const masterName = new Map((mastersRes.data ?? []).map((m) => [m.skill_set_id, m.skill_set_name]));
  const profName = new Map((profsRes.data ?? []).map((p) => [p.proficiency_level_id, p.proficiency_name]));

  // Assemble the exact skill_levels shape the seed file used, then reuse the normalizer.
  const skillLevels = (levelsRes.data ?? []).map((l) => ({
    skill_set_id: l.skill_set_id,
    skill_set_name: masterName.get(l.skill_set_id) ?? "",
    required_level: l.required_level,
    required_proficiency: profName.get(l.required_proficiency_level_id) ?? "",
  }));

  const grouped = new Map<number, { level: number; topics: string[] }[]>();
  for (const t of topicsRes.data ?? []) {
    const list = grouped.get(t.skill_set_id) ?? [];
    list.push({ level: Number(t.level_number) || 0, topics: toTopics(t.topics) });
    grouped.set(t.skill_set_id, list);
  }
  const topics: Record<number, string[]> = {};
  for (const [sid, list] of grouped) {
    list.sort((a, b) => a.level - b.level);
    topics[sid] = list.flatMap((x) => x.topics);
  }

  return { skills: normalizeDashboardSkills(skillLevels), topics };
}

export function useCompanies() {
  return useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
}

export function useCompanyProfile(id: number | undefined) {
  return useQuery({ queryKey: ["company", id, "profile"], queryFn: () => fetchCompanyProfile(id!), enabled: id != null });
}

export function useCompanySkills(id: number | undefined) {
  return useQuery({ queryKey: ["company", id, "skills"], queryFn: () => fetchCompanySkills(id), enabled: id != null });
}
