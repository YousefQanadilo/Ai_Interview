import React, { useState } from 'react';
import { DiagnosticEvaluation, StageNumber } from './types/interview';
import { StageProgressBar } from './components/StageProgressBar';
import { Stage4DiagnosticRubric } from './stages/Stage4DiagnosticRubric';
import { SAMPLE_SESSION } from './data/sampleSession';

// Frames 1-3 aren't built yet, so the app opens on Frame 4 with a sample
// finished session. Once the interview stages exist, pass the real session here.
export default function App() {
  const [stage, setStage] = useState<StageNumber>(4);
  const [drill, setDrill] = useState<DiagnosticEvaluation['remediation_drill'] | null>(null);

  return (
    <div className="min-h-screen">
      <StageProgressBar currentStageNumber={stage} />

      {stage === 4 && (
        <Stage4DiagnosticRubric
          session={SAMPLE_SESSION}
          onSelectFlaggedArea={(evaluation) => {
            setDrill(evaluation.remediation_drill);
            setStage(5);
          }}
        />
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
    </div>
  );
}
