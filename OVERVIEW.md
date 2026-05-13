# Trackiy

Trackiy is a Jira/Trello-style **project & ticket management web app** built with Next.js. It lets teams create projects, organize work on a Kanban board, manage tickets (priority, assignee, labels, comments), invite members by email, and collaborate in real time with typing indicators.

## Features

- **Authentication** — Google OAuth and email/password (credentials) sign-in via NextAuth.
- **Projects** — Create projects from templates (Kanban / Customer Service), pick a category (Software / Service) and type (Team-managed / Company-managed), with a unique project key (e.g. `TRK`).
- **Kanban board** — Columns and statuses per project (defaults: *Ready to Development → In Development → Ready for Code Review → Ready for QA → Done*), drag-and-drop tickets between columns.
- **Tickets** — Auto-generated ticket numbers, title/description with inline editing, priority (LOW/MEDIUM/HIGH), assignee, reporter, and labels.
- **Comments** — Per-ticket threaded comments with edit/delete.
- **Members & invitations** — Invite people to a project by email (SendGrid), accept via invitation token.
- **Recent projects** — Tracks recently visited projects in a Zustand-backed sidebar panel.
- **Global search** — Search tickets by title or ticket number from the header.
- **Filtering** — Filter the “All work items” page by project, assignee, status, priority, and labels.
- **Typing indicators** — Live "user is typing…" hints on ticket fields, polled every 2s.
- **Responsive UI** — Mobile-friendly layout with collapsible sidebar.

## Tech Stack

### Framework & Language
- **Next.js 15** (App Router, Turbopack dev server)
- **React 19**
- **TypeScript 5**

### Styling & UI
- **Tailwind CSS v4** with `tailwindcss-animate` and `tailwind-merge`
- **shadcn/ui** (new-york style) on top of **Radix UI** primitives (`@radix-ui/react-*`)
- **lucide-react** + **react-icons** for icons
- **cmdk** for command palette / search input
- `class-variance-authority` + `clsx` for variant-based styling

### Data & Auth
- **Prisma 6** ORM
- **PostgreSQL** database
- **NextAuth.js v4** with `@next-auth/prisma-adapter`
  - Google provider + Credentials provider
  - JWT session strategy
- **bcrypt** for password hashing

### State & Data Fetching
- **TanStack React Query v5** — server state, caching, and polling
- **Zustand v5** — client state (recent projects store)
- **axios** — HTTP client

### Forms & Validation
- **React Hook Form** with `@hookform/resolvers`
- **Zod** schemas (shared by API routes for input validation)

### Other Libraries
- **@dnd-kit/core**, **@dnd-kit/sortable** — drag-and-drop for the board
- **@tanstack/react-table** — tables for project & ticket lists
- **@sendgrid/mail** — transactional email for invitations

### Tooling
- **ESLint 9**
- **Prisma CLI** (auto-runs `prisma generate` on `postinstall`)

## Project Structure

```
trackiy/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (Header + Sidebar shell)
│   ├── client-layout.tsx             # SessionProvider + React Query provider
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Tailwind v4 styles
│   │
│   ├── api/                          # REST API routes
│   │   ├── _lib/                     # Shared helpers (guards, zod schemas, parsers)
│   │   ├── auth/                     # NextAuth + signup
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── lib/auth.ts           # authOptions (Google + Credentials)
│   │   │   └── signup/route.ts
│   │   ├── projects/                 # Project CRUD
│   │   │   ├── route.ts              # GET list / POST create
│   │   │   └── [id]/                 # Per-project: columns, tickets, members, invite, statuses
│   │   ├── statuses/route.ts         # Global statuses (for filters)
│   │   ├── tickets/route.ts          # Global tickets (for filters)
│   │   ├── search/tickets/route.ts   # Header search
│   │   ├── typing/                   # Typing indicators (poll + SSE stream)
│   │   ├── invite/[token]/route.ts   # Accept invitation
│   │   └── debug/invitation/         # Dev debugging helpers
│   │
│   ├── components/                   # Feature components
│   │   ├── Header.tsx, AppSidebar.tsx, BreadcrumbNav.tsx
│   │   ├── Board.tsx, Column.tsx, TicketCard.tsx
│   │   ├── Comments.tsx, EditableField.tsx
│   │   ├── Members.tsx, FilterBar.tsx, TicketSearch.tsx
│   │   ├── LoginForm.tsx, SignupForm.tsx, SignInDialog.tsx
│   │   ├── RecentProjectsCard.tsx, InfoCard.tsx
│   │   ├── PrioritySelect.tsx, StatusSelect.tsx
│   │   └── LoadingState.tsx, SearchInput.tsx
│   │
│   ├── hooks/                        # React Query data hooks
│   │   ├── useProjects.ts, useTickets.ts, useColumns.ts
│   │   ├── useStatuses.ts, useComments.ts
│   │   ├── useTicketSearch.ts, useTypingIndicator.ts
│   │
│   ├── stores/
│   │   └── recentProjectsStore.ts    # Zustand store
│   │
│   ├── projects/                     # /projects routes
│   │   ├── page.tsx                  # Projects list + filters
│   │   ├── data-table.tsx, columns.tsx
│   │   ├── InviteHandler.tsx
│   │   ├── create/page.tsx           # Multi-step create flow
│   │   └── [id]/
│   │       ├── page.tsx              # Board view
│   │       └── tickets/[ticketId]/page.tsx
│   │
│   ├── items/                        # /items — global "all work items" table
│   │   ├── page.tsx
│   │   └── columns.tsx
│   │
│   ├── types/index.ts                # Shared TS types (Project, Ticket, Column…)
│   ├── contexts/, utils/             # (placeholders)
│
├── components/
│   └── ui/                           # shadcn/ui primitives (button, dialog, table…)
│
├── hooks/
│   └── use-mobile.ts                 # Shared mobile breakpoint hook
│
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── sendgrid.ts                   # SendGrid client
│   └── utils.ts                      # cn(), formatDate(), priority helpers
│
├── prisma/
│   └── schema.prisma                 # DB schema (PostgreSQL)
│
├── public/
│   └── Trackiy.svg                   # Logo
│
├── components.json                   # shadcn/ui config
├── next.config.ts, tsconfig.json, postcss.config.mjs
├── .eslintrc.json
└── package.json
```

## Data Model

Defined in `prisma/schema.prisma`. Core entities:

- **User** — name, email, password (hashed), image; has many projects, comments, assigned/reported tickets.
- **Account / Session / VerificationToken** — NextAuth tables.
- **Project** — `name`, unique `key`, `type` (TEAM_MANAGED / COMPANY_MANAGED), `template` (KANBAN / CUSTOMER_SERVICE), `category` (SOFTWARE / SERVICE), `nextTicketSeq`; owns columns, statuses, members, invitations, comments.
- **ProjectMember** — join table for users in a project.
- **Invitation** — pending/accepted email invites with a unique token.
- **Column** — ordered board column linked to a `Status` and `Project`.
- **Status** — named status per project (used for tickets and column mapping).
- **Ticket** — `ticketNumber` (e.g. `TRK-1000`), title, description, `priority`, assignee, reporter, labels; belongs to a column + status.
- **Comment** — message on a ticket, scoped to a project and authored by a user.
- **TypingIndicator** — `(ticketId, fieldId, userId)` row updated on each keystroke; rows newer than 5s are shown as "typing…".

## Request Flow (typical)

1. **Client** page or component calls a React Query hook (e.g. `useTickets(projectId)`).
2. The hook hits a Next.js API route under `app/api/...` with **axios**.
3. The route uses `requireSession()` (`app/api/_lib/guards.ts`) to authenticate, parses input with a **Zod** schema (`app/api/_lib/schemas.ts`), and queries the DB through **Prisma**.
4. Response is cached by React Query and rendered. Mutations invalidate the relevant queries.

## Scripts

From `package.json`:

```bash
npm run dev      # next dev --turbopack
npm run build    # next build
npm run start    # next start
npm run lint     # next lint
npm run tslint   # tsc --noEmit (type-check)
# postinstall: prisma generate
```

## Environment Variables

Used across the app (see `.env`):

- `DATABASE_URL` — PostgreSQL connection string (Prisma)
- `NEXTAUTH_SECRET` — NextAuth JWT secret
- `NEXTAUTH_URL` — App base URL
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth
- `NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING` — optional, allows linking accounts by email
- `SENDGRID_API_KEY` — for invitation emails (see `lib/sendgrid.ts`)
