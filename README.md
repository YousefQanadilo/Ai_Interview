# Mock Interview AI Agent

ITSC 3155 class project (Fall 2026).

A technical interview practice app for CS students. The goal: an AI interviewer asks a
conceptual question out loud, follows up on weak spots in the answer, checks it against a
ground-truth reference, scores it, and suggests a short practice drill.

**Status: Sprint 1, in progress.** The project skeleton, the core UI components, the
shared data model, the pre-interview setup screen and the diagnostic rubric are in. The
backend API and the live interview stages are coming next.

## Team

| Name | Focus |
|---|---|
| Lee Tropezado | Frontend: project setup, UI components, interview screens |
| Franck Kanunu | Backend: data model, question data, API server, Gemini integration |
| Kailyn Ponce | Frontend: pre-interview microphone & connection check (#2), diagnostic rubric and debrief (#4), Figma prototype |

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend (in progress):** Node.js, Express, WebSockets
- **AI:** Google Gemini API, Claude

## Run locally

Prerequisites: Node.js 20 or newer

```bash
npm install      # install dependencies
npm run lint     # type-check the project
npm test         # run the unit tests
npx vite         # preview the frontend at http://localhost:5173
```

The full app (`npm run dev`) will run once the backend server is added. It will also need a
Gemini API key in a `.env.local` file. See `.env.example`.

## Project structure (so far)

| Path | What it is |
|---|---|
| `index.html`, `src/main.tsx`, `src/App.tsx` | App entry point (`App.tsx` is a placeholder for now) |
| `src/index.css` | Global dark theme and animations |
| `src/types/interview.ts` | Shared data model: roles, domains, sessions, questions, evaluations |
| `src/components/AudioWaveform.tsx` | Audio level visualizer for voice input |
| `src/components/InterviewerFace.tsx` | Animated AI interviewer face |
| `src/components/AIOrb.tsx` | Glowing orb that wraps the interviewer face |
| `src/components/Navbar.tsx` | Top bar showing the active target role and main actions |
| `src/components/StageProgressBar.tsx` | Six-step interview progress indicator |
| `src/components/HistoryDrawer.tsx` | Side panel listing past sessions |

## Implemented features (Sprint 1)

### Pre-interview microphone and connection check ([#2](https://github.com/YousefQanadilo/Ai_Interview/issues/2), [PR #7](https://github.com/YousefQanadilo/Ai_Interview/pull/7))

A short setup screen before the live voice interview, based on Milestone 5 user-testing
feedback (an abrupt permission popup and a silent "Connecting" delay).

- Asks for microphone access up front, shows a live input-level meter, and explains what to
  do if the mic is blocked, missing or unsupported.
- Connects to the live voice WebSocket with an 8-second timeout and shows Not connected /
  Connecting / Connected / Connection failed, with a Retry button.
- "Start interview" stays disabled until both checks pass.
- Files: `src/hooks/useMicrophonePermission.ts`, `src/hooks/useConnectionStatus.ts`,
  `src/stages/PreInterviewSetup.tsx`

### Diagnostic rubric and post-interview debrief ([#4](https://github.com/YousefQanadilo/Ai_Interview/issues/4), [PR #8](https://github.com/YousefQanadilo/Ai_Interview/pull/8))

Frame 4 of the storyboard: the student's scores after an interview answer.

- Dashboard with accuracy %, communication %, readiness out of 10, and the flagged area to
  practise. Selecting the flagged area moves on to the remediation drill (Frame 5).
- Debrief modal with the hiring verdict, a rubric breakdown (communication, complexity
  analysis, edge-case testing, STAR structure), strengths, missing architectural trade-offs,
  and what a strong answer covers.
- Fetches the evaluation from `POST /api/v1/sessions/evaluate` and validates the response.
- **Anti-sycophancy guard:** the AI's verdict and readiness level are capped to what the
  scores support. They can be lowered but never raised (thresholds in
  `src/services/diagnosticScoring.ts`).
- Until the interview stages and backend exist, the app shows this screen with a sample
  session (`src/data/sampleSession.ts`).
- Files: `src/stages/Stage4DiagnosticRubric.tsx`, `src/components/DebriefModal.tsx`,
  `src/services/evaluationService.ts`, `src/services/diagnosticScoring.ts`


### Demo session history ([#11](https://github.com/YousefQanadilo/Ai_Interview/issues/11))

This Sprint 1 feature adds a **Save demo session** button on the diagnostic dashboard and
a **History** drawer. It saves the example diagnostic to this browser's localStorage
(maximum 20 entries), avoids duplicate saves, and restores saved results without calling
the unfinished evaluation backend. The UI explicitly labels these as demonstration
results, not actual live interview scores.

To test manually:

1. Run `npx vite` and use the existing **Skip connection check (dev only)** option.
2. On the diagnostic dashboard click **Save demo session**.
3. Open **History** and verify the entry lists the role, domain, date and scores.
4. Reload the page, skip the dev connection check again, and confirm History still has the entry.
5. Select the saved entry and confirm the diagnostic dashboard reopens.
6. Click save again and confirm the count remains one.
7. Clear browser site data to reset the saved demo entries.

Automated checks: `npm test` includes `src/services/sessionHistory.test.ts`,
which covers persistence, duplicates, malformed stored data, and the 20-item limit.
Run `npm run lint` and `npm run build` as well. Browser-specific behavior must
still be verified locally. This is not a live session-history backend.

AI usage (#11): ChatGPT assisted with the browser-storage helper, integration, tests,
and documentation. The team should review the code and run the checks before merging.

## Testing

```bash
npm run lint     # TypeScript type check
npm test         # unit tests (node:test via tsx)
```

**Automated tests** (`src/services/diagnosticScoring.test.ts`, 13 tests) cover the scoring
thresholds and their boundaries, that the verdict is never upgraded, payload validation,
the evaluate API call, and HTTP errors.

**Manual checks**

- *Diagnostic rubric (#4):* run `npx vite`. The dashboard shows 70% / 60% / 7 out of 10.
  The sample evaluator claimed "Strong Hire", so the header should read "Lean No Hire".
  "View full debrief" opens the modal with a note that the verdict was lowered. Clicking
  the flagged area opens the remediation drill.
- *Mic setup (#2):* allow the mic and check the level meter moves. Block it and check the
  "Try again" message. With no backend running, "Connect" should show "Connection failed"
  with a Retry button, and "Start interview" stays disabled. Tested in Chrome; Safari check
  still to do.

## AI usage disclosure

We used AI tools during Sprint 1, and the team reviewed, tested and is responsible for all
code in this repository.

- **#4 Diagnostic rubric (Kailyn):** written with Claude (Anthropic), which read the Figma
  storyboard frame for the layout and proposed the scoring thresholds. Verified with the
  unit tests and the manual checks above.
- **Project management (Lee):** used Claude (Anthropic) to check the GitHub Issues against the assignment’s PBI format, plan Sprint 1 in GitHub Projects, and review PR #7. All issue content, labels and sprint assignments were set and checked by Lee.
- **Franck:** _add how you used Copilot / Figma MCP for your parts._

## Sprint 1 submission and evidence

- **Application repository:** https://github.com/YousefQanadilo/Ai_Interview
- **Figma prototype:** https://www.figma.com/file/oahuXOFAGsxWDxGJ9l2NT5?node-id=0%3A1
- **Completed feature issue:** [#11 — Save diagnostic practice sessions and reopen history](https://github.com/YousefQanadilo/Ai_Interview/issues/11)
- **Feature pull request:** [#12 — Save demo diagnostic sessions and view history](https://github.com/YousefQanadilo/Ai_Interview/pull/12)
- **GitHub Project / Sprint 1 board:** Add the team's actual GitHub Project URL after confirming that #11 is assigned to Sprint 1.

### Screenshot checklist

Capture these authentic screenshots from the team's local environment and upload them to an `evidence/` folder in this repository:

| File | Evidence |
|---|---|
| `evidence/history.png` | Saved session displayed in the Student Practice History drawer |
| `evidence/output.png` | `npm run lint`, 18 passing unit tests, and `npm run build` |
| `evidence/mcp.png` | Running Figma MCP server and design-context response in VS Code |
| `evidence/copo.png` | Repository analysis from the VS Code chat panel |

**Evidence status:** Screenshots have been captured locally but are not yet uploaded to this repository. The displayed chat panel should be checked to ensure the Copilot screenshot actually demonstrates **GitHub Copilot** rather than another assistant.

### Acceptance criteria verification

The student reported that `npm run lint` passed, **18 of 18** tests passed, and `npm run build` succeeded with a non-blocking Vite warning. The student manually confirmed that the saved demo session appears in History and works in the browser. The local-browser storage implementation is a demonstration feature, not a completed live-interview backend.

## Planning

User stories and feature work are tracked in [GitHub Issues](https://github.com/YousefQanadilo/Ai_Interview/issues).
The storyboard is in [Figma](https://www.figma.com/design/GvcZ2oY01Ja12TTjzPZPIZ/AI-Interview-Prep-Storyboard?node-id=2-6).
