import React, { useEffect } from 'react';
import { X, Award, CheckCircle2, AlertTriangle, ListChecks, ShieldAlert, ArrowRight } from 'lucide-react';
import { DiagnosticEvaluation, StrictHiringVerdict } from '../types/interview';
import { CRITERION_LABELS, READINESS_LABELS, VERDICT_LABELS } from '../services/diagnosticScoring';

interface DebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: DiagnosticEvaluation;
  adjustments?: string[];
  onStartDrill?: () => void;
}

const VERDICT_STYLES: Record<StrictHiringVerdict, string> = {
  STRONG_HIRE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  HIRED: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
  LEAN_NO_HIRE: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  NOT_HIRED: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
};

const ScoreBlock: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
    <div className="text-[11px] text-slate-400">{label}</div>
    <div className="text-3xl font-bold text-white mt-1">{value}%</div>
    <div className="h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const DebriefModal: React.FC<DebriefModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  adjustments = [],
  onStartDrill,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const feedback = evaluation.detailed_feedback;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="debrief-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 id="debrief-title" className="font-bold text-sm text-white">Post-Interview Debrief</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close debrief"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Verdict */}
          <div className="space-y-2">
            <span
              className={`inline-block text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${VERDICT_STYLES[evaluation.hiring_verdict]}`}
            >
              {VERDICT_LABELS[evaluation.hiring_verdict]}
            </span>
            <p className="text-sm text-slate-200">{evaluation.verdict_headline}</p>
            <p className="text-[11px] font-mono text-slate-500">{READINESS_LABELS[evaluation.readiness_level]}</p>
          </div>

          {adjustments.length > 0 && (
            <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <ul className="space-y-1">
                {adjustments.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">
            <ScoreBlock label="Technical Accuracy" value={evaluation.technical_accuracy_score} />
            <ScoreBlock label="Communication" value={evaluation.communication_score} />
          </div>

          {/* Rubric breakdown */}
          {evaluation.rubric_criteria && evaluation.rubric_criteria.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-cyan-400" /> Rubric Breakdown
              </h4>
              {evaluation.rubric_criteria.map((c) => (
                <div key={c.criterion} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200">{CRITERION_LABELS[c.criterion]}</span>
                    <span className="font-mono text-white">{c.score}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${c.score}%` }} />
                  </div>
                  {c.evidence && <p className="text-[11px] text-slate-400">{c.evidence}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Strengths */}
          {feedback && feedback.strengths.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-5">
                {feedback.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Missing trade-offs */}
          {feedback && feedback.missing_tradeoffs.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Architectural Trade-offs
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-5">
                {feedback.missing_tradeoffs.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Rejection reasons */}
          {evaluation.rejection_reasons.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-white">What held the verdict back</h4>
              <ul className="space-y-1.5 text-xs text-rose-200/90 list-disc pl-5">
                {evaluation.rejection_reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {feedback?.cadence_analysis && (
            <section className="space-y-1">
              <h4 className="text-xs font-bold text-white">Delivery & Pacing</h4>
              <p className="text-xs text-slate-300">{feedback.cadence_analysis}</p>
            </section>
          )}

          {evaluation.model_answer_bullets && evaluation.model_answer_bullets.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-white">What a strong answer covers</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-5">
                {evaluation.model_answer_bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {onStartDrill && (
          <div className="p-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onStartDrill}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Start Remediation Drill <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
