<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Phase 2: live data comes read-only from the user's external Supabase via src/lib/companyApi.ts (React Query hooks over src/lib/supabaseClient.ts, env VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY); companies only from public.company_json, skills only from the 4 skill tables — no joins, no auth. seedCompanies.ts/skillTopics.ts stay as documented fallback, unused in the live render path; CompanyContext only stores the selected company.
- Never surface CTC, stipend or selection-ratio fields; normalizeCompanyProfile strips them — product rule.
