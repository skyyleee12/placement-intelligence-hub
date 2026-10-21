// Pure normalizers. Inputs are the raw short_json / full_json / skill_levels shapes,
// so Phase 2 can pipe database rows in unchanged.
export type CompanyType = "Super Dream" | "Dream" | "Standard" | "Regular";

export interface CompanySummary {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  category: string;
  companyType: CompanyType;
  incorporationYear: string;
  employeeSize: string;
  headquarters: string;
  operatingCountries: string;
  officeLocations: string;
  yoyGrowthRate: string;
  websiteUrl: string;
}

/** All profile fields from full_json, as strings, keyed by original snake_case key. */
export interface CompanyProfile {
  summary: CompanySummary;
  fields: Record<string, string>;
}

export interface DashboardSkill {
  id: number;
  name: string;
  score: number;
  proficiency: string;
  difficulty: "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";
}

type Raw = Record<string, unknown>;

export const asString = (v: unknown): string =>
  v === null || v === undefined ? "" : typeof v === "string" ? v.trim() : String(v);

export const asRecord = (v: unknown): Raw =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {};

export const splitItems = (v: string): string[] =>
  v
    .split(/\n|;|•|(?<=[a-z0-9)])\.\s+(?=[A-Z])/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);

export const titleCaseFromCode = (code: string): string =>
  code
    .split("_")
    .map((w) => (w.length <= 3 && ["tam", "sam", "som", "ceo", "esg", "cac", "ltv", "csr"].includes(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

export const scoreToDifficulty = (s: number): DashboardSkill["difficulty"] =>
  s >= 8 ? "EXPERT" : s >= 6 ? "ADVANCED" : s >= 4 ? "PRO" : "BEGINNER";

const TYPES: CompanyType[] = ["Super Dream", "Dream", "Standard", "Regular"];
const toType = (v: string): CompanyType =>
  TYPES.find((t) => t.toLowerCase() === v.toLowerCase()) ?? "Regular";

// Fields that must never be surfaced.
const BLOCKED = /ctc|stipend|selection_ratio/i;

export function normalizeCompanySummary(shortJson: unknown, id = 0): CompanySummary {
  const r = asRecord(shortJson);
  return {
    id,
    name: asString(r.name),
    shortName: asString(r.short_name),
    logoUrl: asString(r.logo_url),
    category: asString(r.category),
    companyType: toType(asString(r.company_type)),
    incorporationYear: asString(r.incorporation_year),
    employeeSize: asString(r.employee_size),
    headquarters: asString(r.headquarters_address),
    operatingCountries: asString(r.operating_countries),
    officeLocations: asString(r.office_locations),
    yoyGrowthRate: asString(r.yoy_growth_rate),
    websiteUrl: asString(r.website_url),
  };
}

export function normalizeCompanyProfile(fullJson: unknown, shortJson: unknown, id = 0): CompanyProfile {
  const full = asRecord(fullJson);
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...asRecord(shortJson), ...full })) {
    if (!BLOCKED.test(k)) fields[k] = asString(v);
  }
  return { summary: normalizeCompanySummary(shortJson, id), fields };
}

export function normalizeDashboardSkills(skillLevels: unknown): DashboardSkill[] {
  if (!Array.isArray(skillLevels)) return [];
  return skillLevels
    .map((s) => {
      const r = asRecord(s);
      const score = Number(r.required_level) || 0;
      return {
        id: Number(r.skill_set_id) || 0,
        name: asString(r.skill_set_name),
        score,
        proficiency: asString(r.required_proficiency),
        difficulty: scoreToDifficulty(score),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export const NULLISH = /^(na|n\/a|none|-|null|undefined|)$/i;
export const isNullish = (v: string | undefined) => NULLISH.test((v ?? "").trim());

export type Bloom = "CU" | "AP" | "AS" | "EV" | "CR";
export const proficiencyToBloom = (n: number): Bloom =>
  n <= 2 ? "CU" : n <= 4 ? "AP" : n <= 6 ? "AS" : n <= 8 ? "EV" : "CR";
export const scoreToCriticality = (n: number) => (n >= 7 ? "Critical" : n >= 5 ? "Important" : "Baseline");
