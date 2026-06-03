# Admin SPA — MilindWeb

A zero-dependency, framework-free admin UI for editing the portfolio content
backed by the NestJS API (`/api/v1/portfolio/admin/*`).

## Quick start

1. Sign in at `/auth/login.html`. You need a user assigned to one of the
   Authentik groups `milindweb-super-admins`, `milindweb-portfolio-admins`, or
   `milindweb-portfolio-editors`.
2. Open `/admin/`. The dashboard shows live counts from the public API.
3. Pick a section (Services, Projects, Posts, etc.) to manage.

## Files

```
admin/
├── index.html          # dashboard (counts + quick actions)
├── profile.html        # singleton editor (brand, contact, SEO, theme)
├── services.html       # list + add/edit/delete
├── projects.html
├── posts.html
├── testimonials.html
├── faq.html
├── team.html
├── admin.js            # auth guard, API client, UI helpers, generic CRUD
└── admin.css
```

## How it works

- **Auth guard** (`requireRole`) lives in `admin.js`. On every page load it
  waits for `MW_AUTH.ready()`, calls `/auth/me` to resolve the user's role
  and groups, and either renders the page or shows a "forbidden" screen
  with a link back to `/auth/me.html`. If not signed in, it stashes the
  current URL in `sessionStorage` and redirects to `/auth/login.html`.
- **API client** (`api`) wraps `MW_AUTH.fetch` (which adds the
  `Authorization: Bearer …` header and silently refreshes on 401). It
  normalises the `{ data, error }` envelope and throws on non-2xx.
- **Generic CRUD renderer** uses the `ENTITIES` registry (one entry per
  table) to know which fields to list and which to edit. Adding a new
  entity means adding one entry, not a new page.
- **Forms** are rendered in a side modal (single instance, replaced on each
  open). Slug fields auto-derive from the title; checkboxes are handled
  even when unchecked.

## Roles

| Action                 | Required role                                                |
|------------------------|--------------------------------------------------------------|
| View dashboard         | any signed-in user                                           |
| Read `/auth/me`        | any signed-in user                                           |
| Write `/portfolio/admin/*` | `portfolio_admin` or `portfolio_editor` (or `super_admin`) |
| Sign out               | any signed-in user                                           |

Editor vs admin distinction: today both roles can do everything. If you
want to restrict editors to "no delete", wrap the `api.remove` call sites
in `requireRole(['portfolio_admin', 'super_admin'])`.

## Limitations

- **No file upload yet.** Cover images and avatars are URLs. The
  `/storage/*` endpoints (Phase 5c) will add `POST /storage/upload`
  returning a URL that can be pasted into the relevant field.
- **Markdown body is plain text.** A live preview pane can be added in a
  later phase.
- **No bulk actions.** Edit or delete one at a time.
- **No undo.** Soft-delete is used on the server; restore is via the
  database, not the SPA.
