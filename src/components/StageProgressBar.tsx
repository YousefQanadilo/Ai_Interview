import React from 'react';
import { Check, MessageSquare, HelpCircle, FileText, Zap, TrendingUp, Settings } from 'lucide-react';
import { StageNumber } from '../types/interview';

interface StageProgressBarProps {
  currentStageNumber: StageNumber;
  onSelectStage?: (stage: StageNumber) => void;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStageNumber,
  onSelectStage,
}) => {
  const stages = [
    { num: 1 as StageNumber, title: 'Session Init', subtitle: 'Role & Domain', icon: Settings },
    { num: 2 as StageNumber, title: 'Oral Question', subtitle: 'Systems Core', icon: MessageSquare },
    { num: 3 as StageNumber, title: 'Adaptive Probe', subtitle: 'Dynamic Follow-up', icon: HelpCircle },
    { num: 4 as StageNumber, title: 'Diagnostic Rubric', subtitle: 'Hiring Evaluation', icon: FileText },
    { num: 5 as StageNumber, title: 'Remediation Drill', subtitle: '45s Quick Re-attempt', icon: Zap },
    { num: 6 as StageNumber, title: 'Growth Brief', subtitle: 'Mastery Trajectory', icon: TrendingUp },
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto gap-2 text-xs">
        {stages.map((stage, idx) => {
          const isDone = stage.num < currentStageNumber;
          const isCurrent = stage.num === currentStageNumber;
          const isFuture = stage.num > currentStageNumber;
          const Icon = stage.icon;

          return (
            <React.Fragment key={stage.num}>
              <div 
                className={`flex items-center space-x-2.5 shrink-0 px-2 py-1 rounded-lg transition-colors ${
                  isCurrent ? 'bg-slate-800/90 text-cyan-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : stage.num}
                </div>

                <div className="hidden sm:block text-left">
                  <div className={`text-xs ${isCurrent ? 'text-cyan-400 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                    Frame {stage.num}: {stage.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {stage.subtitle}
                  </div>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[12px] max-w-[40px] hidden md:block rounded ${
                    isDone ? 'bg-emerald-500/50' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
