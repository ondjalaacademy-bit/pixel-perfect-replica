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
- Admin CRUD pages query the browser database client directly; access is enforced by row-level security (admin writes courses/classes/settings, staff reviews registrations/payments). Why: permissions live in the backend, not the UI.
- Manual payments: student uploads proof to private 'comprovativos' storage under their user-id folder and inserts a 'pendente' payment; staff confirms. Why: works until Multicaixa integration exists.
- Keep home-page video playback and scroll effects in a dedicated browser-enhanced hero component, with CDN asset pointers and a static reduced-motion fallback. Why: isolates media lifecycle from course loading and keeps the first screen accessible.
