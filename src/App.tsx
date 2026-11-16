import React, { useEffect, useState } from 'react';
import type { DiagnosticEvaluation, InterviewSession, StageNumber } from './types/interview';
import { HistoryDrawer } from './components/HistoryDrawer';
import { loadHistory, saveHistory, updateHistory } from './services/sessionHistory';
import { StageProgressBar } from './components/StageProgressBar';
import { PreInterviewSetup } from './stages/PreInterviewSetup';
import { Stage4DiagnosticRubric } from './stages/Stage4DiagnosticRubric';
import { SAMPLE_SESSION } from './data/sampleSession';

// Live voice backend (coming in a later PBI). Override with VITE_LIVE_VOICE_WS_URL in .env.local.
const LIVE_VOICE_WS_URL =
  import.meta.env.VITE_LIVE_VOICE_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/live`;

export default function App() {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState<StageNumber>(4);
  const [drill, setDrill] = useState<DiagnosticEvaluation['remediation_drill'] | null>(null);
  const [activeSession, setActiveSession] = useState<InterviewSession>(SAMPLE_SESSION);
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!started) return;
    let mounted = true;
    loadHistory()
      .then((sessions) => { if (mounted) setHistory(sessions); })
      .catch((error: unknown) => {
        if (mounted) setSaveMessage(error instanceof Error ? error.message : 'Could not load saved sessions.');
      });
    return () => { mounted = false; };
  }, [started]);

  const refreshHistory = async () => {
    try {
      setHistory(await loadHistory());
      setSaveMessage('');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Could not load saved sessions.');
    }
  };

  const persistSession = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const isExisting = history.some((session) => session.id === activeSession.id);
      const saved = isExisting ? await updateHistory(activeSession) : await saveHistory(activeSession);
      setHistory((previous) => [saved, ...previous.filter((session) => session.id !== saved.id)].slice(0, 100));
      setSaveMessage('Interview session saved to the database.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Could not save interview session.');
    } finally {
      setSaving(false);
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
        <button type="button" onClick={() => { setHistoryOpen(true); void refreshHistory(); }} className="rounded-lg border border-slate-700 text-cyan-300 px-3 py-2 text-xs cursor-pointer">History ({history.length})</button>
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
            <button type="button" disabled={saving} onClick={() => void persistSession()} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl py-2.5 text-sm font-semibold cursor-pointer">
              {saving ? 'Saving…' : 'Save interview session'}
            </button>
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
            <button onClick={() => setStage(4)} className="text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-xl px-3 py-2 cursor-pointer">Back to diagnostic</button>
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
