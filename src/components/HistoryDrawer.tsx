import React from 'react';
import { X, Award, Clock, ArrowRight, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { InterviewSession } from '../types/interview';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Student Practice History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No interview sessions recorded yet. Start your first session!
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSession(s);
                  onClose();
                }}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                  <span className="text-cyan-400 font-bold">{s.role}</span>
                </div>

                <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                  {s.domain}
                </div>

                {s.diagnostic ? (
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono border-t border-slate-900">
                    <span className="text-slate-400">Accuracy: <strong className="text-white">{s.diagnostic.technical_accuracy_score}%</strong></span>
                    <span className="text-slate-400">Pacing: <strong className="text-white">{s.diagnostic.communication_score}%</strong></span>
                    {s.remediationAttempt && (
                      <span className="text-emerald-400 font-bold">+{s.remediationAttempt.masteryGain}%</span>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-400 font-mono">In Progress</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
