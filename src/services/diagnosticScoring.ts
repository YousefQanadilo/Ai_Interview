import {
  DiagnosticEvaluation,
  ReadinessLevel,
  RubricCriterionId,
  RubricCriterionScore,
  StrictHiringVerdict,
} from '../types/interview';

/**
 * Anti-sycophancy thresholds.
 *
 * The model is allowed to be harsher than these numbers, but never kinder.
 * A verdict or readiness level the scores don't support gets capped down.
 */
export const VERDICT_THRESHOLDS = {
  STRONG_HIRE: { accuracy: 85, communication: 80, minCriterion: 70 },
  HIRED: { accuracy: 70, communication: 65, minCriterion: 50 },
  LEAN_NO_HIRE: { accuracy: 50, communication: 0, minCriterion: 0 },
} as const;

export const READINESS_THRESHOLDS = {
  L3_Interview_Ready: { accuracy: 80, communication: 75 },
  L2_Intermediate: { accuracy: 55, communication: 0 },
} as const;

// Lower index = stronger outcome.
const VERDICT_ORDER: StrictHiringVerdict[] = ['STRONG_HIRE', 'HIRED', 'LEAN_NO_HIRE', 'NOT_HIRED'];
const READINESS_ORDER: ReadinessLevel[] = ['L3_Interview_Ready', 'L2_Intermediate', 'L1_Foundational'];

export const VERDICT_LABELS: Record<StrictHiringVerdict, string> = {
  STRONG_HIRE: 'Strong Hire',
  HIRED: 'Hire',
  LEAN_NO_HIRE: 'Lean No Hire',
  NOT_HIRED: 'No Hire',
};

export const READINESS_LABELS: Record<ReadinessLevel, string> = {
  L1_Foundational: 'L1 · Foundational',
  L2_Intermediate: 'L2 · Intermediate',
  L3_Interview_Ready: 'L3 · Interview Ready',
};

export const CRITERION_LABELS: Record<RubricCriterionId, string> = {
  communication: 'Communication',
  complexity_analysis: 'Complexity Analysis',
  edge_case_testing: 'Edge-Case Testing',
  star_structure: 'STAR Structure',
};

const NEUTRAL_HEADLINES: Record<StrictHiringVerdict, string> = {
  STRONG_HIRE: 'Clear, rigorous answer with the key trade-offs covered.',
  HIRED: 'Solid answer, with a few gaps to tighten before a real interview.',
  LEAN_NO_HIRE: 'Partially correct, but important gaps would hold you back.',
  NOT_HIRED: 'Core concepts were missing or incorrect. Review the flagged area.',
};

/** Coerces any value to an integer score between 0 and 100. */
export function clampScore(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n)));
}

/** The strongest verdict the scores can justify. */
export function maxVerdictForScores(
  accuracy: number,
  communication: number,
  opts: { criteria?: RubricCriterionScore[]; missingTradeoffs?: number; rejectionReasons?: number } = {},
): StrictHiringVerdict {
  const lowestCriterion = opts.criteria?.length
    ? Math.min(...opts.criteria.map((c) => clampScore(c.score)))
    : 100;
  const hasGaps = (opts.missingTradeoffs ?? 0) > 0 || (opts.rejectionReasons ?? 0) > 0;

  const meets = (t: { accuracy: number; communication: number; minCriterion: number }) =>
    accuracy >= t.accuracy && communication >= t.communication && lowestCriterion >= t.minCriterion;

  if (meets(VERDICT_THRESHOLDS.STRONG_HIRE) && !hasGaps) return 'STRONG_HIRE';
  if (meets(VERDICT_THRESHOLDS.HIRED)) return 'HIRED';
  if (meets(VERDICT_THRESHOLDS.LEAN_NO_HIRE)) return 'LEAN_NO_HIRE';
  return 'NOT_HIRED';
}

/** The highest readiness level the scores can justify. */
export function maxReadinessForScores(accuracy: number, communication: number): ReadinessLevel {
  const l3 = READINESS_THRESHOLDS.L3_Interview_Ready;
  const l2 = READINESS_THRESHOLDS.L2_Intermediate;
  if (accuracy >= l3.accuracy && communication >= l3.communication) return 'L3_Interview_Ready';
  if (accuracy >= l2.accuracy && communication >= l2.communication) return 'L2_Intermediate';
  return 'L1_Foundational';
}

/** Returns whichever verdict is harsher. */
export function harsherVerdict(a: StrictHiringVerdict, b: StrictHiringVerdict): StrictHiringVerdict {
  return VERDICT_ORDER.indexOf(a) >= VERDICT_ORDER.indexOf(b) ? a : b;
}

/** Returns whichever readiness level is lower. */
export function lowerReadiness(a: ReadinessLevel, b: ReadinessLevel): ReadinessLevel {
  return READINESS_ORDER.indexOf(a) >= READINESS_ORDER.indexOf(b) ? a : b;
}

/** Readiness on a 0-10 scale (accuracy weighted 60%, communication 40%). */
export function readinessScore(accuracy: number, communication: number): number {
  return Math.round((clampScore(accuracy) * 0.6 + clampScore(communication) * 0.4) / 10);
}

export interface EnforcedEvaluation {
  evaluation: DiagnosticEvaluation;
  /** Human-readable notes for every change the guard made. Empty if none. */
  adjustments: string[];
}

/**
 * Applies the anti-sycophancy guard to an evaluation from the model:
 * scores are clamped, and the verdict / readiness level are capped to what
 * the scores support. Nothing is ever upgraded.
 */
export function enforceAntiSycophancy(input: DiagnosticEvaluation): EnforcedEvaluation {
  const adjustments: string[] = [];
  const accuracy = clampScore(input.technical_accuracy_score);
  const communication = clampScore(input.communication_score);
  const criteria = input.rubric_criteria?.map((c) => ({ ...c, score: clampScore(c.score) }));

  const ceiling = maxVerdictForScores(accuracy, communication, {
    criteria,
    missingTradeoffs: input.detailed_feedback?.missing_tradeoffs?.length ?? 0,
    rejectionReasons: input.rejection_reasons?.length ?? 0,
  });
  const verdict = harsherVerdict(input.hiring_verdict, ceiling);
  if (verdict !== input.hiring_verdict) {
    adjustments.push(
      `Verdict lowered from ${VERDICT_LABELS[input.hiring_verdict]} to ${VERDICT_LABELS[verdict]} to match the scores.`,
    );
  }

  const readiness = lowerReadiness(input.readiness_level, maxReadinessForScores(accuracy, communication));
  if (readiness !== input.readiness_level) {
    adjustments.push(
      `Readiness lowered from ${READINESS_LABELS[input.readiness_level]} to ${READINESS_LABELS[readiness]} to match the scores.`,
    );
  }

  return {
    evaluation: {
      ...input,
      technical_accuracy_score: accuracy,
      communication_score: communication,
      hiring_verdict: verdict,
      readiness_level: readiness,
      // An upbeat headline written for a higher verdict no longer fits.
      verdict_headline:
        verdict !== input.hiring_verdict || !input.verdict_headline?.trim()
          ? NEUTRAL_HEADLINES[verdict]
          : input.verdict_headline,
      ...(criteria ? { rubric_criteria: criteria } : {}),
    },
    adjustments,
  };
}
