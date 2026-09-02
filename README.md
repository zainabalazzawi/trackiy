# Trackiy

Kanban-style project and ticket tracker (Next.js, PostgreSQL). Sign in, create projects, manage tickets on a board, comment, and invite teammates.

## Quick start

**Needs:** Node.js 20+, PostgreSQL

```bash
git clone <your-repo-url>
cd trackiy
npm install
```

Create `.env.local` at the repo root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/trackiy"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

**Optional — Google sign-in**

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING="true"
```

**Optional — email invitations** (all three required)

Sign up at [brevo.com](https://www.brevo.com) (free plan). Verify your sender email under **Settings → Senders**, then create an API key under **Settings → SMTP & API → API keys**.

```env
BREVO_API_KEY=""
BREVO_FROM_EMAIL="your-verified@gmail.com"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

On Vercel, set `NEXT_PUBLIC_BASE_URL` to your deployment URL (e.g. `https://trackiy.vercel.app`).

**Run**

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start dev server (Turbopack)       |
| `npm run build`    | Production build                   |
| `npm run start`    | Start production server            |
| `npm run lint`     | Run ESLint                         |
| `npm run tslint`   | Type-check with TypeScript         |
| `npm run test`     | Run unit tests in watch mode       |
| `npm run test:run` | Run unit tests once (CI-friendly)  |

## What the app does

Trackiy is a small Jira/Trello-style tool for teams:

1. **Sign in** with Google or email/password.
2. **Create a project** with a key (e.g. `TRK`), template, and category.
3. **Work on a Kanban board** — drag tickets across columns; default flow is *Ready to Development → In Development → Ready for Code Review → Ready for QA → Done*.
4. **Manage tickets** — auto-numbered (`TRK-1000`), priority, assignee, reporter, labels, inline edits.
5. **Comment** on tickets; **invite** teammates by email; **search** tickets globally or filter all work on `/items`.

Each project has **four roles** — Viewer, Member, Admin, Owner. The creator is always Owner. The API enforces what each role can do; the board hides actions you are not allowed to perform.

## Pages

| Route | What happens there |
| ----- | ------------------- |
| `/` | Landing page and sign-in |
| `/projects` | List projects; accepts invite links (`?invite=TOKEN`) |
| `/projects/create` | Multi-step project creation |
| `/projects/:id` | Kanban board |
| `/projects/:id/tickets/:ticketId` | Ticket detail |
| `/items` | All tickets across projects, with filters |

## How code is organized

| Path | Purpose |
| ---- | ------- |
| `app/api/` | REST routes; shared guards and Zod schemas in `api/_lib/` |
| `app/components/` | Feature UI — board, tickets, comments, auth forms |
| `app/hooks/` | React Query hooks (`useProjects`, `useTickets`, …) |
| `app/projects/`, `app/items/` | Page routes |
| `app/stores/` | Client state (e.g. recent projects in localStorage) |
| `components/ui/` | shadcn/ui primitives |
| `lib/` | Prisma client, permissions, Brevo, utilities |
| `prisma/schema.prisma` | Database schema |
| `test/` | Shared test helpers (`expectSuccess`, `expectFailure`) |

## Request flow

```
Component → React Query hook → axios → app/api route
  → requireSession / requireProjectPermission (guards.ts)
  → Zod validation (schemas.ts)
  → Prisma → JSON response → cached in React Query
```

Mutations invalidate the relevant query keys so the UI stays in sync.

## Auth

- **NextAuth** — Google OAuth + credentials; JWT sessions; Prisma adapter.
- **Signup** — `POST /api/auth/signup` (bcrypt, Zod).
- **Google** — requires verified email.
- **No middleware** — pages are open; APIs return 401/403 when unauthorized.

## Permissions

Roles and rules live in `lib/permissions.ts`. Routes call `app/api/_lib/guards.ts`.

| Role | Can |
| ---- | --- |
| **Viewer** | View board, tickets, comments |
| **Member** | Edit tickets, drag cards, post comments |
| **Admin** | Manage columns, invite members |
| **Owner** | Delete project |

`GET /api/projects/:id` returns `currentUserRole`. UI uses `useProjectPermissions(projectId)` for `canEditTickets`, `canManageColumns`, and `canManageMembers`.

New members are assigned **Member** on invite or add. Role changes are not exposed in the UI yet.

## Data model

Core entities in `prisma/schema.prisma`:

| Entity | Role in the app |
| ------ | ---------------- |
| **User** | Account; can be assignee or reporter on tickets |
| **Project** | Board container; `key`, template, `nextTicketSeq` for ticket numbering |
| **ProjectMember** | Links user to project with a `role` |
| **Column** + **Status** | Board layout; each column maps to a status |
| **Ticket** | Work item — number, title, priority, labels, column/status |
| **Comment** | Message on a ticket |
| **Invitation** | Pending email invite with accept token |

## Testing

Unit tests use **Vitest** (`vitest.config.mts`). Run `npm run test` for watch mode or `npm run test:run` for a single pass.

| Test file | What it covers |
| --------- | -------------- |
| `lib/permissions.test.ts` | `roleAtLeast` and `hasPermission` for every role/permission pair |
| `app/api/_lib/guards.test.ts` | Session and project access guards (`requireSession`, `getProjectRole`, `requireProjectRole`, `requireProjectPermission`, `requireProjectAccess`) |
| `app/api/_lib/validation.test.ts` | JSON body and query-string parsing (`parseJson`, `parseQuery`) |

API guard tests mock `next-auth` and Prisma; validation tests use real Zod schemas. Shared assertions live in `test/helpers.ts`.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · PostgreSQL · Prisma · NextAuth · TanStack React Query · Zustand · axios · Zod · Vitest · Tailwind CSS v4 · shadcn/ui · @dnd-kit · Brevo
