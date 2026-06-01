# Trackiy

Trackiy is a Jira/Trello-style **project and ticket management** web app. Teams can create projects, organize work on a Kanban board, manage tickets with priorities and assignees, leave comments, and invite members by email.

## Features

- **Authentication** — Google OAuth and email/password sign-in (NextAuth)
- **Projects** — Create projects with a unique key (e.g. `TRK`), templates, and categories
- **Kanban board** — Drag-and-drop tickets across customizable columns
- **Tickets** — Auto-generated numbers (`TRK-1000`), inline editing, priority, assignee, reporter, and labels
- **Comments** — Per-ticket comments with edit and delete
- **Members & invitations** — Invite teammates by email (SendGrid)
- **Search & filters** — Global ticket search and filterable "All work items" view
- **Responsive UI** — Mobile-friendly layout with collapsible sidebar

## Tech Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **PostgreSQL** · **Prisma 6**
- **NextAuth.js** · **TanStack React Query** · **Zustand**
- **Tailwind CSS v4** · **shadcn/ui** · **@dnd-kit** (drag-and-drop)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google OAuth credentials (optional, for Google sign-in)
- SendGrid API key (optional, for invitation emails)

### Installation

```bash
git clone <your-repo-url>
cd trackiy
npm install
```

### Environment Variables

Create a `.env.local` file at the repo root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/trackiy"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Allow linking Google and credentials accounts by email (optional)
NEXTAUTH_ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING="true"

# SendGrid (optional — required for email invitations)
SENDGRID_API_KEY=""
```

Generate a secret for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### Database Setup

Push the Prisma schema to your database:

```bash
npx prisma db push
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts


| Command          | Description                  |
| ---------------- | ---------------------------- |
| `npm run dev`    | Start dev server (Turbopack) |
| `npm run build`  | Production build             |
| `npm run start`  | Start production server      |
| `npm run lint`   | Run ESLint                   |
| `npm run tslint` | Type-check with TypeScript   |


## Project Structure

```
app/
├── api/           # REST API routes (auth, projects, tickets, search)
├── components/    # Feature components (Board, TicketCard, Comments, etc.)
├── hooks/         # React Query data hooks
├── projects/      # /projects routes (list, create, board, ticket detail)
├── items/         # /items — global work items table
└── stores/        # Zustand client state

components/ui/     # shadcn/ui primitives
lib/               # Prisma client, SendGrid, utilities
prisma/            # Database schema
```

## Documentation

For a deeper dive into architecture, data model, and request flow, see [OVERVIEW.md](./OVERVIEW.md).



