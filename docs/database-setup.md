# Database Setup (Sprint 2)

This guide gets the Mock Interview AI Agent's local database running on your machine. Every team member follows it once, then records their result in the [team verification table](#team-verification-table) at the bottom.

Schema design and the data-access API are documented separately in [`docs/yousef-database.md`](yousef-database.md).

## Our database: SQLite + Prisma ORM

We use **SQLite** as the database and **Prisma 6** as the ORM.

**Why it fits this project:**

- **Free and local.** SQLite is a single file on your computer. There is no server to install, no account to create and no paid hosting.
- **Same setup for everyone.** The schema (`prisma/schema.prisma`) and migrations (`prisma/migrations/`) are committed, so every teammate builds an identical database from the same files.
- **Fits our stack.** Prisma generates a fully typed client for TypeScript, which matches our React + TypeScript + Node codebase. Queries are type-checked by `npm run lint`.
- **Real relational features.** Primary keys, foreign keys, unique constraints and cascading deletes are enforced, which our models need: a session owns its responses, evaluation and remediation attempts.
- **Easy to test.** The database tests create a throwaway SQLite file, run against it and delete it, so they never touch your own data.

**Limitations we accepted:**

- Each teammate's database is separate. Data does **not** sync between machines. Use the seed script for shared demo data.
- SQLite is built for one writer at a time. That's fine for local development and demos, but a deployed multi-user version would move to PostgreSQL. Prisma makes that switch mostly a one-line provider change plus a new migration.
- SQLite has no native JSON column in this Prisma setup, so structured fields (rubric, feedback) are stored as JSON text.

**Alternatives considered:** PostgreSQL (hosted, e.g. Supabase or Neon) needs an account and network access for every teammate. MongoDB doesn't give us the relational constraints our session → response/evaluation model relies on.

## What's in the database

| Model | Stores |
|---|---|
| `Student` | Optional owner of sessions (no login yet, so sessions can exist without one) |
| `InterviewQuestion` | Question bank entries with expected keywords |
| `InterviewSession` | Role, domain, current stage, timestamps, duration |
| `InterviewResponse` | Each spoken answer or follow-up: transcript, duration, pauses |
| `DiagnosticEvaluation` | One per session: verdict, scores, rubric, next drill |
| `RemediationAttempt` | Practice re-attempts with before/after mastery |

Deleting a session also deletes its responses, evaluation and attempts. Deleting a student or question keeps the sessions and clears the link.

## Prerequisites

- **Node.js 20 or newer.** Check with `node -v`.
- **Git**, and a clone of the repo: `git clone https://github.com/YousefQanadilo/Ai_Interview.git`
- An internet connection for the first `npm install` and `npm run db:generate`. Prisma downloads its engine once.

> **Windows tip:** keep the project **outside OneDrive** (for example `C:\Users\<you>\projects\Ai_Interview`). OneDrive syncing can lock `node_modules` and the `.db` file.

## Setup (run once)

Run every command from the repo root (the folder with `package.json`).

### 1. Install dependencies

```bash
npm install
```

### 2. Create your local `.env`

Copy the placeholder file. Your real `.env` stays on your machine only.

**PowerShell (Windows):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux / Git Bash:**

```bash
cp .env.example .env
```

Check that it contains this line (it does by default):

```
DATABASE_URL="file:./dev.db"
```

The path is resolved relative to `prisma/schema.prisma`, so your database is created at **`prisma/dev.db`**.

> Don't create `.env` with `echo ... > .env` in Windows PowerShell 5. It saves the file as UTF-16, which Prisma can't read. Use `Copy-Item` as shown, or create the file in VS Code.

### 3. Generate the Prisma client

```bash
npm run db:generate
```

This builds the typed database client from `prisma/schema.prisma`. Re-run it any time the schema changes.

### 4. Create the database tables

```bash
npm run db:migrate
```

This applies every committed migration and creates `prisma/dev.db`. You should see `All migrations have been successfully applied.`

### 5. Load the demo data

```bash
npm run db:seed
```

Expected output:

```
Seeded one demo student, one question, and one unscored demo session.
```

The seed is safe to run more than once. It won't create duplicates.

## Verify it works

Do **both** checks and record the results in the table at the bottom.

### A. Run the database tests

```bash
npm run test:db
```

This creates a temporary database, writes a session with a response and an evaluation, reconnects, reads them back, checks that invalid input is rejected, then deletes the temporary file. The summary at the end should show **pass 1** and **fail 0**.

### B. See the seeded record in Prisma Studio

```bash
npm run db:studio
```

Your browser opens Prisma Studio at http://localhost:5555. Click **InterviewSession** and confirm there's a row with:

- `id`: `sprint2-demo-session`
- `role`: `Junior Backend Engineer`
- `currentStage`: `STAGE_1_INIT`

Press `Ctrl+C` in the terminal to close Studio.

### C. Run the rest of the checks

```bash
npm run lint     # TypeScript type check, must show no errors
npm test         # unit tests, 18 passing
npm run build    # production build of the frontend
```

## Run the application

The frontend runs with:

```bash
npx vite
```

Open the address Vite prints (usually http://localhost:5173).

> `npm run dev` starts `server.ts`, the backend API, which is still being built in Sprint 2. Until it lands, use `npx vite` for the frontend and the checks above for the database. The database is accessed from server-side code only (`src/server/`), never from the browser.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Environment variable not found: DATABASE_URL` | `.env` is missing, isn't in the repo root, or was saved as UTF-16. Redo step 2 with `Copy-Item` / `cp`. |
| `@prisma/client did not initialize yet. Please run "prisma generate"` | Run `npm run db:generate`. |
| `The table main.InterviewSession does not exist` | The migration hasn't run. Run `npm run db:migrate`. |
| `EPERM: operation not permitted ... query_engine-windows.dll.node` | Another Node process (often Prisma Studio or a dev server) is holding the file. Close it, then re-run `npm run db:generate`. |
| `Failed to fetch ... binaries.prisma.sh` during generate or migrate | Prisma couldn't download its engine. Check your connection (some campus or VPN networks block it) and try again on another network. |
| Seed or Studio shows old or broken data | Reset your local database (below). |

### Reset your local database

This deletes only **your** local data. Nothing in Git changes.

**PowerShell:**

```powershell
Remove-Item prisma\dev.db* -ErrorAction SilentlyContinue
npm run db:migrate
npm run db:seed
```

**macOS / Linux / Git Bash:**

```bash
rm -f prisma/dev.db*
npm run db:migrate
npm run db:seed
```

## Security rules

1. **Never commit `.env`.** It holds real API keys. Only `.env.example` (placeholders) is tracked.
2. **Never commit database files** (`*.db`, `*.db-journal`, `*.sqlite`). Each teammate's data stays local.
3. **Never commit keys or credentials** (`*.pem`, `*.key`, `*.p12`, `*.crt`, `credentials*.json`, `service-account*.json`).
4. **Don't `git add -f`** an ignored file. If Git refuses to add something, that's on purpose.
5. **Schema changes go through migrations.** Edit `prisma/schema.prisma`, create a migration and commit both. Don't edit `dev.db` by hand and share it.

All of the above are blocked by `.gitignore`. To double-check before you push, these commands should print **nothing**:

**PowerShell:**

```powershell
git ls-files | Select-String -Pattern '(^|/)\.env$|\.env\.local|\.db$|\.db-|\.sqlite|\.pem$|\.key$|\.p12$|\.pfx$|\.crt$|credentials.*\.json|service-account'
```

**macOS / Linux / Git Bash:**

```bash
git ls-files | grep -iE '(^|/)\.env$|\.env\.local|\.db$|\.db-|\.sqlite|\.pem$|\.key$|\.p12$|\.pfx$|\.crt$|credentials.*\.json|service-account'
```

And this should confirm your database and `.env` are ignored:

```bash
git check-ignore -v .env prisma/dev.db
```

If a secret was ever committed by mistake, deleting the file isn't enough. It stays in the Git history. Tell the team right away and **rotate the key** (generate a new one and revoke the old one).

**Last audit (Nov 15, 2026, Lee):** no `.env`, database, key or credential files are tracked on `main`, and none appear anywhere in the repository's history.

## Team verification table

Each member: complete the setup and verification steps on your own machine, then replace your row's `pending` values and commit the change from **your own GitHub account**:

```
docs(db): record <your name>'s local database verification
```

| Member | GitHub | OS | Node version | db:migrate | db:seed | test:db | Verified record | Date |
|---|---|---|---|---|---|---|---|---|
| Lee Tropezado | @leetropezado | pending | pending | pending | pending | pending | pending | pending |
| Kailyn Ponce | @kailynalisha | pending | pending | pending | pending | pending | pending | pending |
| Yousef Qanadilo | @YousefQanadilo | pending | pending | pending | pending | pending | pending | pending |
| Franck Kanunu | @franckkanunu | pending | pending | pending | pending | pending | pending | pending |

**How to fill in your row:**

- **OS:** for example `Windows 11`, `macOS 15`, `Ubuntu 24.04`
- **Node version:** the output of `node -v`, for example `v26.13.0`
- **db:migrate / db:seed / test:db:** `✅ pass` or `❌ fail` (if it failed, add a short note under the table)
- **Verified record:** what you saw, for example `sprint2-demo-session visible in Prisma Studio`
- **Date:** the day you verified, for example `2026-11-15`
