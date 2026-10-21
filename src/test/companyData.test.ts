import { describe, expect, it } from "vitest";
import { proficiencyToBloom, scoreToCriticality, scoreToDifficulty, normalizeCompanyProfile } from "@/lib/companyData";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { buildIntelligenceSections } from "@/data/intelligenceData";

describe("company data", () => {
  it("maps bloom levels", () => {
    expect([1, 3, 5, 7, 9].map(proficiencyToBloom)).toEqual(["CU", "AP", "AS", "EV", "CR"]);
  });
  it("maps criticality", () => {
    expect([7, 5, 4].map(scoreToCriticality)).toEqual(["Critical", "Important", "Baseline"]);
  });
  it("maps difficulty", () => {
    expect([8, 6, 4, 3].map(scoreToDifficulty)).toEqual(["EXPERT", "ADVANCED", "PRO", "BEGINNER"]);
  });
  it("builds 22 sections with no CTC/stipend/selection ratio", () => {
    const c = SEED_COMPANIES[0];
    const sections = buildIntelligenceSections(normalizeCompanyProfile(c.full_json, c.short_json, 1));
    expect(sections).toHaveLength(22);
    const keys = sections.flatMap((s) => s.fields.map((f) => f.key)).join(" ");
    expect(keys).not.toMatch(/ctc|stipend|selection_ratio/i);
  });
});
