# Mock Interview AI Agent

ITSC 3155 class project (Fall 2026).

A technical interview practice app for CS students. The goal: an AI interviewer asks a conceptual question out loud, follows up on weak spots in the answer, checks it against a ground-truth reference, scores it, and suggests a short practice drill.

## Database-backed session history

Interview history is stored in SQLite through Prisma, not browser localStorage. The Express API supports saving, retrieving, listing and updating complete interview-session snapshots; the React history drawer loads and saves through those endpoints. Validation errors and unavailable database operations are displayed to the user, and the same database file preserves sessions across application restarts.

See [Database Setup](docs/database-setup.md) for database configuration and [Session History API](docs/session-history-api.md) for routes and verification. Start the frontend and API together with `npm run dev` after setting up the database.

## Run locally

Prerequisites: Node.js 20 or newer.

```bash
npm install
cp .env.example .env       # PowerShell: Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run dev                 # API and Vite frontend at http://localhost:3000
```

## Tests

```bash
npm run lint
npm test                    # client and API validation/error-handling tests
npm run test:db             # SQLite integration and reconnect persistence test
npm run build
```

The repository also includes the existing interview UI, diagnostic scoring, setup checks, and Prisma models. Database migration files are committed; `.env` and local database files must remain untracked.
