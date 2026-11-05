import React, { useState } from 'react';
import { DiagnosticEvaluation, InterviewSession, StageNumber } from './types/interview';
import { HistoryDrawer } from './components/HistoryDrawer';
import { loadHistory, saveHistory } from './services/sessionHistory';
import { StageProgressBar } from './components/StageProgressBar';
import { PreInterviewSetup } from './stages/PreInterviewSetup';
import { Stage4DiagnosticRubric } from './stages/Stage4DiagnosticRubric';
import { SAMPLE_SESSION } from './data/sampleSession';

// Live voice backend (coming in a later PBI). Override with VITE_LIVE_VOICE_WS_URL in .env.local.
const LIVE_VOICE_WS_URL =
  import.meta.env.VITE_LIVE_VOICE_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/live`;

// Flow so far: pre-interview setup (#2) -> diagnostic rubric (#4) -> drill placeholder.
// Frames 2-3 aren't built yet, so after setup the app shows Frame 4 with a sample
// finished session. Once the interview stages exist, pass the real session here.
export default function App() {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState<StageNumber>(4);
  const [drill, setDrill] = useState<DiagnosticEvaluation['remediation_drill'] | null>(null);

  const [activeSession, setActiveSession] = useState<InterviewSession>(SAMPLE_SESSION);
  const [history, setHistory] = useState<InterviewSession[]>(() => loadHistory(window.localStorage));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const saveSession = () => {
    try {
      setHistory(saveHistory(window.localStorage, activeSession));
      setSaveMessage('Demo session saved to this browser.');
    } catch {
      setSaveMessage('Could not save. Check browser storage settings.');
    }
  };

  if (!started) {
    return <PreInterviewSetup serverUrl={LIVE_VOICE_WS_URL} onReady={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center gap-3">
        <div>
          <h1 className="font-semibold text-sm">Interview practice</h1>
          <p className="text-[11px] text-amber-300">Demo evaluation — not a live interview result</p>
        </div>
        <button type="button" onClick={() => setHistoryOpen(true)} className="rounded-lg border border-slate-700 text-cyan-300 px-3 py-2 text-xs cursor-pointer">History ({history.length})</button>
      </div>
      <StageProgressBar currentStageNumber={stage} />

      {stage === 4 && (
        <>
        <Stage4DiagnosticRubric
          key={activeSession.id}
          session={activeSession}
          onSelectFlaggedArea={(evaluation) => {
            setDrill(evaluation.remediation_drill);
            setStage(5);
          }}
        />
        <div className="max-w-md mx-auto px-4 pb-6 space-y-2">
          <button type="button" onClick={saveSession} className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl py-2.5 text-sm font-semibold cursor-pointer">Save demo session</button>
          {saveMessage && <p role="status" className="text-xs text-slate-300">{saveMessage}</p>}
        </div>
        </>
      )}

      {stage === 5 && drill && (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h2 className="font-bold text-sm text-white">Remediation Drill</h2>
            <p className="text-slate-300">{drill.drill_prompt}</p>
            <p className="text-slate-500 font-mono">{drill.duration_seconds}s · Frame 5 coming in a later sprint</p>
            <button
              onClick={() => setStage(4)}
              className="text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-xl px-3 py-2 cursor-pointer"
            >
              Back to diagnostic
            </button>
          </div>
        </div>
      )}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={history}
        onSelectSession={(session) => {
          setActiveSession(session);
          setDrill(null);
          setStage(4);
          setSaveMessage('');
        }}
      />
    </div>
  );
}
