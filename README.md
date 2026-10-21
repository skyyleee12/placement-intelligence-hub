# JSS University, Noida — Companies Research & Placement Analytics Portal

**Placement Intelligence Hub** for JSS University, Noida (tag: JSSUni).

- **Phase 1 is UI-only.** All data comes from the hardcoded seed in `src/data/seedCompanies.ts` (Accenture reference record) and `src/data/skillTopics.ts`. No database, no backend.
- **Fully public.** There is no login; every page is reachable by any visitor.
- **College used:** JSS University, Noida (`src/lib/college.ts`). No college logo is shipped.
- **Phase 2** will swap the data source to Supabase. The normalizers in `src/lib/companyData.ts` already accept the raw `short_json` / `full_json` / `skill_levels` shapes, so only `src/context/CompanyContext.tsx` needs to change where rows come from.

Routes: `/` (company grid), `/company` → `/company/intelligence`, `/company/skills`.
Optional env: `VITE_LOGO_DEV_PUBLISHABLE_KEY` for Logo.dev logos.

Note: built on this project's fixed stack (TanStack Router file routes + Tailwind v4) rather than React Router 6; URLs and behavior are identical.
