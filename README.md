# Mock Interview AI Agent

ITSC 3155 class project (Fall 2026).

A technical interview practice app for CS students. The goal: an AI interviewer asks a
conceptual question out loud, follows up on weak spots in the answer, checks it against a
ground-truth reference, scores it, and suggests a short practice drill.

**Status: Sprint 1, in progress.** The project skeleton, the core UI components and the
shared data model are in. The backend API, the interview stages and the main interview
screen are coming next.

## Team

| Name | Focus |
|---|---|
| Lee Tropezado | Frontend: project setup, UI components, interview screens |
| Franck Kanunu | Backend: data model, question data, API server, Gemini integration |
| Kailyn Ponce | Frontend: pre-interview microphone & connection check (#2), Figma prototype |

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend (in progress):** Node.js, Express, WebSockets
- **AI:** Google Gemini API

## Run locally

Prerequisites: Node.js 20 or newer

```bash
npm install
npm run lint     # type-check the project
npx vite         # preview the frontend
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

## Planning

User stories and feature work are tracked in [GitHub Issues](https://github.com/YousefQanadilo/Ai_Interview/issues).
The storyboard is in [Figma](https://www.figma.com/design/GvcZ2oY01Ja12TTjzPZPIZ/AI-Interview-Prep-Storyboard?node-id=2-6).
