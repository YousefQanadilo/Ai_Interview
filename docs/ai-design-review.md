# AI Design Review: UML Diagrams (Sprint 2)

**Author:** Kailyn Ponce
**AI tool:** Claude (Anthropic)
**Artifacts reviewed:** `docs/uml/class-diagram.puml`, `docs/uml/sequence-diagram.puml`

## What the AI generated

Claude read `prisma/schema.prisma`, the initial migration
(`prisma/migrations/20261115000000_init/migration.sql`), `src/server/interviewRepository.ts`,
`src/types/interview.ts` and `src/services/evaluationService.ts`, then drafted both PlantUML diagrams.

## Design decision reviewed: drawing API routes that do not exist yet

**AI proposal.** The first sequence diagram showed a complete request flow from the React UI
through an Express API to the repository, with routes such as `POST /api/v1/sessions` and
`GET /api/v1/sessions`. It drew them the same way as code that already exists.

**Problem found in review.** We checked each message against the repository:

| Call in the diagram | Exists in the repo? |
| --- | --- |
| `createInterviewSession`, `addInterviewResponse`, `updateInterviewStage`, `saveDiagnosticEvaluation`, `addRemediationAttempt`, `listInterviewSessions` | Yes, `src/server/interviewRepository.ts` |
| `POST /api/v1/sessions/evaluate` | Yes, called by `src/services/evaluationService.ts` (server side not built yet) |
| `POST /api/v1/sessions`, `GET /api/v1/sessions` | No. Express routes are Franck's Sprint 2 task |
| History drawer reading from the API | No. It still uses browser `localStorage` (`src/services/sessionHistory.ts`) |

Presenting planned routes as finished would make the diagram look like a description of working
code, which is misleading for grading and for Franck, who is building those routes.

**Correction.**

1. Every repository call in the diagram uses the real function name and parameters.
2. The source file header states which routes exist and which are planned.
3. A note on the diagram says the database layer is done, while the Express routes and the
   History drawer migration are still in progress.

## Other corrections made during review

- **Missing enumeration.** The first class diagram left out `QuestionDifficulty`
  (`easy | medium | hard`), which `InterviewQuestion.difficulty` uses. Added.
- **Defaults drawn as methods.** Writing defaults as `= now()` made PlantUML treat `createdAt`
  as an operation. Changed to `= now` so they render as attributes.
- **Relationship types checked against the migration SQL.** `Student` and `InterviewQuestion`
  use `ON DELETE SET NULL`, so they are drawn as aggregation (sessions survive).
  `InterviewResponse`, `DiagnosticEvaluation` and `RemediationAttempt` use `ON DELETE CASCADE`,
  so they are drawn as composition. `DiagnosticEvaluation.sessionId` is unique, so the
  multiplicity is `0..1`, not `0..*`.
- **Where constraints live.** The diagram notes that role, domain, stage, verdict and response
  kind are stored as `TEXT` and validated only in `interviewRepository.ts`, not by SQL `CHECK`
  constraints.

## Open recommendation

Because enum-like values are only checked in application code, a script or a future route that
writes through Prisma directly could store an invalid stage or verdict. Adding SQL `CHECK`
constraints in a later migration would close that gap. This is not part of Sprint 2.

## How it was verified

- Each class, attribute, default, index and relationship was compared line by line with
  `prisma/schema.prisma` and the migration SQL.
- Each repository call in the sequence diagram was compared with the exported functions in
  `src/server/interviewRepository.ts`.
- Both diagrams were rendered with PlantUML to PNG and SVG and checked visually.
