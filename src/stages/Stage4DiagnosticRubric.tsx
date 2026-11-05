import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { DiagnosticEvaluation, InterviewSession } from '../types/interview';
import { enforceAntiSycophancy, readinessScore, VERDICT_LABELS } from '../services/diagnosticScoring';
import { evaluateSession, EvaluationError } from '../services/evaluationService';
import { DebriefModal } from '../components/DebriefModal';

interface Stage4DiagnosticRubricProps {
  session: InterviewSession;
  /** Called once an evaluation is loaded so the parent can save it on the session. */
  onEvaluated?: (evaluation: DiagnosticEvaluation) => void;
  /** Called when the student picks the flagged area / starts the drill (Frame 5). */
  onSelectFlaggedArea?: (evaluation: DiagnosticEvaluation) => void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; evaluation: DiagnosticEvaluation; adjustments: string[] };

const MetricCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
    <div className="text-[11px] text-slate-400">{label}</div>
    <div className="text-3xl font-bold text-white mt-1">{value}%</div>
    <div className="h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
      <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const Stage4DiagnosticRubric: React.FC<Stage4DiagnosticRubricProps> = ({
  session,
  onEvaluated,
  onSelectFlaggedArea,
}) => {
  const [state, setState] = useState<LoadState>(() =>
    session.diagnostic ? { status: 'ready', ...enforceAntiSycophancy(session.diagnostic) } : { status: 'loading' },
  );
  const [isDebriefOpen, setDebriefOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (session.diagnostic) return;
    const controller = new AbortController();
    setState({ status: 'loading' });

    evaluateSession(session, { signal: controller.signal })
      .then((result) => {
        setState({ status: 'ready', ...result });
        onEvaluated?.(result.evaluation);
        setDebriefOpen(true);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: err instanceof EvaluationError ? err.message : 'Something went wrong while scoring your answer.',
        });
      });

    return () => controller.abort();
    // Re-run only for a new session or a retry.
  }, [session.id, attempt]);

  const closeDebrief = useCallback(() => setDebriefOpen(false), []);

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        Scoring your answer against the rubric…
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-xs">
        <p className="text-rose-300">{state.message}</p>
        <button
          onClick={() => setAttempt((n) => n + 1)}
          className="flex items-center gap-1.5 text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  const { evaluation, adjustments } = state;
  const readiness = readinessScore(evaluation.technical_accuracy_score, evaluation.communication_score);
  const flagged = evaluation.flagged_improvement_area;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Diagnostic dashboard
          </h2>
          <span className="text-[11px] font-mono text-slate-400">{VERDICT_LABELS[evaluation.hiring_verdict]}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Accuracy" value={evaluation.technical_accuracy_score} />
          <MetricCard label="Communication" value={evaluation.communication_score} />
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400">Readiness</div>
          <div className="text-3xl font-bold text-white mt-1">{readiness}/10</div>
          <div className="flex gap-1.5 mt-3" aria-label={`Readiness ${readiness} out of 10`}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < readiness ? 'bg-cyan-400' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>

        <button
          onClick={() => onSelectFlaggedArea?.(evaluation)}
          disabled={!onSelectFlaggedArea}
          className="w-full flex items-center justify-between gap-2 text-left text-xs bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-2.5 enabled:hover:bg-amber-500/15 enabled:cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>
              <strong>Flagged:</strong> {flagged.concept}
              {flagged.diagnosis && <span className="block text-amber-200/70 mt-0.5">{flagged.diagnosis}</span>}
            </span>
          </span>
          {onSelectFlaggedArea && <ChevronRight className="w-4 h-4 shrink-0" />}
        </button>

        <button
          onClick={() => setDebriefOpen(true)}
          className="w-full text-xs font-bold text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-xl py-2.5 transition-colors cursor-pointer"
        >
          View full debrief
        </button>
      </div>

      <DebriefModal
        isOpen={isDebriefOpen}
        onClose={closeDebrief}
        evaluation={evaluation}
        adjustments={adjustments}
        onStartDrill={onSelectFlaggedArea ? () => onSelectFlaggedArea(evaluation) : undefined}
      />
    </div>
  );
};
