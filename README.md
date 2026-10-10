# Lawson Digital Solutions

Website, enquiry handling and staff portal, built from the `Lawson Digital Solutions v2` HTML prototype.

| Layer    | Tech                                  | Folder      | Port |
|----------|---------------------------------------|-------------|------|
| Frontend | Next.js 15 (App Router, React 19, TS) | `frontend/` | 3000 |
| Backend  | NestJS 11 + TypeORM                   | `backend/`  | 4000 |
| Database | SQLite 3 (`better-sqlite3`)           | `database/app.sqlite` | — |

The browser only talks to Next.js. Next.js forwards `/api/*` and `/uploads/*` to NestJS (see `frontend/next.config.ts`), so the staff session cookie stays same-origin.

---

## Quick start

Needs **Node.js 20+** (22 LTS recommended).

```bash
npm run install:all   # root + backend + frontend dependencies
npm run build
npm start             # API on :4000, site on :3000
```

To develop with hot reload, run `npm run dev` instead.

- Public site: <http://localhost:3000>
- Staff portal: <http://localhost:3000/staff/login>. It's a separate route and nothing on the public site links to it.

| Staff email | Password |
|---|---|
| `admin@lawsondigital.dev` | `Lawson@2026` |

Change the password after you first sign in (**Settings → Change password**). You can also set `STAFF_EMAIL` and `STAFF_PASSWORD` in `backend/.env` before the first run.

### Database

`database/app.sqlite` ships with all the prototype's content: 4 services, hero diagrams, challenges, process stages, principles, values, solutions and the contact details. It has no enquiries or case studies yet. If the file is missing, the API creates it and fills it on start.

```bash
npm run seed         # create the database, or fill in anything missing (never overwrites)
npm run seed:reset   # put services, page content and settings back to the original copy
                     # (enquiries, case studies and staff accounts are kept)
```

---

## What changed from the prototype

| Prototype | Now |
|---|---|
| The enquiry form said “Online enquiries aren’t connected yet” | Enquiries are saved to SQLite, checked again on the server with the same rules and wording, and confirmed with a reference such as `E-7Q2K9D` |
| `previewSubmission` / `submitEndpoint` test switches | Real API with real error states: a network failure, a server error, invalid fields (shown next to each field), and too many attempts in a short time (`429`) |
| Honeypot and `elapsedMs` were sent but nothing used them | A filled honeypot gets a fake success and nothing is stored. Very fast submissions are kept but flagged “possibly automated” in the staff notes |
| All content hardcoded in the page | Services, hero diagrams, challenges, process, principles, values, solutions, prompts, budget ranges and timelines come from the database (`GET /api/content`) |
| Contact details repeated in the markup | Edited once in **Settings**. The header, footer, contact page, privacy page, the `mailto:` fallback and the search-engine structured data all use it |
| “Austin, TX · time” clock with a fixed time zone | Time zone and location label come from Settings |
| Projects page always empty | Staff write case studies and publish them. Published ones appear on `/projects` with their own pages at `/projects/[slug]`. With none published, the original “Approved work samples aren’t available yet” panel shows |
| “Pending owner confirmation” review notes | Removed from the public site |
| Hash routes (`#/services?s=web`) | Real URLs (`/services?s=web`, `/contact?service=web`) |

Everything interactive from v2 is carried over:
- **Hero:** rotating system diagrams with a progress bar, pause/play, pausing on hover, a mouse-following spotlight and 3D tilt, and the floating JSON card.
- **Home page:** the marquee, the capabilities list with its preview card, the challenge tabs, the 5-stage process stepper, the scope checklist, the principles hover, and the CTA with the live clock.
- **Services page:** the “On this page” list highlights the section you're reading.
- **Enquiry form:**
  - Prompt chips, a “3 / 3 required” progress bar, check marks on valid fields and a character counter.
  - The optional timeline/budget/URL section opens by itself if the URL is invalid.
  - “Copy email” and “Send by email instead” buttons.
- **Header and page:** reading-progress bar in the header, sections fading in as you scroll, a mobile menu that closes with Escape, and reduced-motion support throughout.

After a successful enquiry, a **success card** shows the reference number, a “Back to Services” button, a link to the Projects page and “Send another enquiry”. Each staff form (case study, service, settings, password) also ends on a success card with buttons for the next step.

---

## Staff portal (`/staff`)

| Area | What you can do |
|---|---|
| **Enquiries** | Counts by status · search · filter by status and service · change status in the list or the detail panel (New → In review → Replied → Closed) · internal notes · “Reply by email” (pre-filled) · delete with confirmation · **Export CSV** of the current filter (spreadsheet formulas in the data are neutralised) |
| **Case studies** | Create, edit, delete · draft / published · cover image upload · URL slug made from the title, checked to be unique · a case study can't be published until the summary, requirement, approach and delivered sections are filled in (checked on the server too) |
| **Services** | Edit the copy for each of the 4 services (name, tag, summaries, problem lists, deliverables, the 3-step diagram) |
| **Settings** | Business and contact details, location label and time zone (checked to be a real time zone), budget ranges, timeline options · change password |

How the staff area is kept separate and secure:
- Its own route tree (`app/staff`) and layout, with no public header or footer.
- `middleware.ts` sends visitors without a session to `/staff/login?next=…`, and after signing in they go back to the page they asked for.
- The session is a JWT in an httpOnly, SameSite=Lax cookie (`lds_staff`), checked on every `/api/admin/*` request.
- Sign-in is limited to 5 attempts per minute.
- Staff pages send `noindex` so search engines skip them.

---

## API (prefix `/api`)

| Method | Route | Purpose |
|---|---|---|
| GET | `/site` | Contact details + ready-made `tel:` / `mailto:` links |
| GET | `/content` | Services + all page content + budget / timeline options |
| GET | `/services` | Services only |
| POST | `/enquiries` | Submit an enquiry → `{ ref }` (5 per 10 minutes per IP) |
| GET | `/case-studies` · `/case-studies/:slug` | Published case studies |
| POST | `/auth/login` · `/auth/logout` · `/auth/change-password` · GET `/auth/me` | Staff session |
| GET | `/admin/stats` | Sidebar counts |
| GET | `/admin/enquiries` (`q, status, service`) · GET `/admin/enquiries/export.csv` | Inbox · CSV |
| GET/PATCH/DELETE | `/admin/enquiries/:id` | Read · `{ status, staffNotes }` · delete |
| GET/POST | `/admin/case-studies` | List · create |
| GET/PUT/DELETE | `/admin/case-studies/:id` · PATCH `/admin/case-studies/:id/status` | Edit · publish / unpublish |
| GET · PUT | `/admin/services` · `/admin/services/:id` | Service copy |
| GET · PUT | `/admin/settings` | Site settings |
| POST | `/admin/uploads` | Image upload (PNG / JPG / WebP / AVIF, up to 8 MB) → `{ urls }` |

Validation errors return `400` with `{ message, errors: { field: "message" } }`.

---

## Project structure

```text
lawson-digital-solutions/
├── backend/src/
│   ├── content/        services, page content, site settings (public + admin)
│   ├── enquiries/      submission, validation, inbox, CSV export
│   ├── case-studies/   public listing + admin CRUD / publishing
│   ├── auth/           login, JWT cookie guard, change password
│   ├── uploads/        image uploads → /uploads
│   ├── admin/          stats
│   ├── seed/           prototype content, first-run seeding, CLI
│   ├── database/entities/
│   └── common/         helpers, field-level errors
├── frontend/
│   ├── app/(public)/   home, services, solutions, projects (+[slug]), about, contact, privacy
│   ├── app/staff/      login + portal (enquiries, case-studies, services, settings)
│   ├── components/{public,staff,ui}/
│   ├── lib/            API client, hooks (data, dialogs, clock), types, formatters
│   ├── styles/         lawson.css (public site), staff.css
│   └── middleware.ts   protects /staff
├── database/app.sqlite
└── package.json        root scripts
```

## Configuration

`backend/.env` (copy `.env.example`; every value has a working default): `PORT`, `JWT_SECRET`, `DATABASE_PATH`, `UPLOAD_DIR`, `STAFF_EMAIL`, `STAFF_PASSWORD`, `STAFF_NAME`, `FRONTEND_ORIGIN`.
`frontend/.env.local`: `BACKEND_URL=http://localhost:4000`.

### Before going live
- Set a long random `JWT_SECRET` and `NODE_ENV=production` (this makes the session cookie `Secure`, so the site needs HTTPS).
- **Email alerts aren't set up.** New enquiries appear in the staff inbox, but no email is sent. Connect an email provider in `EnquiriesService.create` if you want alerts.
- The prototype marked the Privacy Policy as a draft. Have the business owner review it before launch.
- The database structure is created automatically from the code (`synchronize: true`). Switch to TypeORM migrations before changing the schema in production.
- Back up `database/app.sqlite` and `backend/uploads/`.
