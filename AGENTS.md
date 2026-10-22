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

- Phase 1 data comes only from src/data/seedCompanies.ts via normalizers in src/lib/companyData.ts; Phase 2 swaps the source inside CompanyContext only — keeps the backend swap a one-file change.
- Never surface CTC, stipend or selection-ratio fields; normalizeCompanyProfile strips them — product rule.
