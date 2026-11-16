# Database-backed session history API

The practice-history feature now uses the Express API and the existing SQLite/Prisma data layer. The browser does not keep a localStorage copy, so saved sessions remain available when the browser reloads or the server restarts (provided the same database file is retained).

## Routes

- `GET /api/v1/sessions` — list the latest 100 saved session snapshots.
- `GET /api/v1/sessions/:id` — retrieve a saved snapshot.
- `POST /api/v1/sessions` — validate and save a complete session (upsert by session ID).
- `PUT /api/v1/sessions/:id` — validate and update an existing session; URL and payload IDs must match.

Invalid payloads return `400`; missing sessions return `404`; database errors return a generic `500` message without exposing connection details. Session validation is shared between the API and repository layer. Complete shared `InterviewSession` data is persisted as JSON alongside indexed session metadata in the SQLite database.

## Run and verify

Follow [database setup](database-setup.md), including Prisma client generation and migrations. Then use `npm run dev` to start the API and Vite frontend together. The server defaults to port 3000; set `PORT` to override it. Run `npm test` for API/client tests and `npm run test:db` for SQLite persistence integration tests.
