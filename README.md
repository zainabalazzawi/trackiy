# Trackiy

Kanban-style project and ticket tracker (Next.js, PostgreSQL). Sign in, create projects, manage tickets on a board, comment, and invite teammates.

**New here?** Run the steps below, then read [OVERVIEW.md](./OVERVIEW.md) to understand how the app works.

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
