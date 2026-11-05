import {
  DiagnosticEvaluation,
  InterviewSession,
  ReadinessLevel,
  RubricCriterionId,
  RubricCriterionScore,
  StrictHiringVerdict,
} from '../types/interview';
import { CRITERION_LABELS, EnforcedEvaluation, enforceAntiSycophancy } from './diagnosticScoring';

export const EVALUATE_ENDPOINT = '/api/v1/sessions/evaluate';

const VERDICTS: StrictHiringVerdict[] = ['STRONG_HIRE', 'HIRED', 'LEAN_NO_HIRE', 'NOT_HIRED'];
const READINESS: ReadinessLevel[] = ['L1_Foundational', 'L2_Intermediate', 'L3_Interview_Ready'];

export class EvaluationError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'EvaluationError';
  }
}

/** What the frontend sends to the evaluator. */
export function buildEvaluationRequest(session: InterviewSession) {
  return {
    session_id: session.id,
    role: session.role,
    domain: session.domain,
    initial_question: session.initialQuestion,
    candidate_initial_answer: session.candidateInitialAnswer ?? null,
    adaptive_probe: session.adaptiveProbe ?? null,
    candidate_probe_answer: session.candidateProbeAnswer ?? null,
    discussion_history: session.discussionHistory ?? [],
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];

function parseCriteria(v: unknown): RubricCriterionScore[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const ids = Object.keys(CRITERION_LABELS) as RubricCriterionId[];
  const parsed = v
    .filter(isObject)
    .filter((c) => ids.includes(c.criterion as RubricCriterionId))
    .map((c) => ({
      criterion: c.criterion as RubricCriterionId,
      score: Number(c.score),
      ...(typeof c.evidence === 'string' ? { evidence: c.evidence } : {}),
    }));
  return parsed.length ? parsed : undefined;
}

/**
 * Validates an untrusted evaluation payload and fills safe defaults.
 * Unknown verdicts fall back to the harshest value rather than the kindest.
 */
export function parseEvaluationPayload(raw: unknown, sessionId: string): DiagnosticEvaluation {
  // Accept either the evaluation itself or `{ evaluation: {...} }`.
  const body = isObject(raw) && isObject(raw.evaluation) ? raw.evaluation : raw;
  if (!isObject(body)) throw new EvaluationError('Evaluation response was empty or malformed.');

  if (body.technical_accuracy_score === undefined || body.communication_score === undefined) {
    throw new EvaluationError('Evaluation response is missing scores.');
  }

  const flagged = isObject(body.flagged_improvement_area) ? body.flagged_improvement_area : {};
  const drill = isObject(body.remediation_drill) ? body.remediation_drill : {};
  const feedback = isObject(body.detailed_feedback) ? body.detailed_feedback : undefined;

  return {
    session_id: str(body.session_id, sessionId),
    hiring_verdict: VERDICTS.includes(body.hiring_verdict as StrictHiringVerdict)
      ? (body.hiring_verdict as StrictHiringVerdict)
      : 'NOT_HIRED',
    verdict_headline: str(body.verdict_headline),
    technical_accuracy_score: Number(body.technical_accuracy_score),
    communication_score: Number(body.communication_score),
    readiness_level: READINESS.includes(body.readiness_level as ReadinessLevel)
      ? (body.readiness_level as ReadinessLevel)
      : 'L1_Foundational',
    rejection_reasons: strList(body.rejection_reasons),
    flagged_improvement_area: {
      concept: str(flagged.concept, 'General review'),
      diagnosis: str(flagged.diagnosis),
      ...(typeof flagged.cadence_gap_seconds === 'number'
        ? { cadence_gap_seconds: flagged.cadence_gap_seconds }
        : {}),
    },
    remediation_drill: {
      drill_prompt: str(drill.drill_prompt),
      duration_seconds: typeof drill.duration_seconds === 'number' ? drill.duration_seconds : 45,
      ...(typeof drill.target_mastery_focus === 'string'
        ? { target_mastery_focus: drill.target_mastery_focus }
        : {}),
    },
    model_answer_bullets: strList(body.model_answer_bullets),
    ...(feedback
      ? {
          detailed_feedback: {
            strengths: strList(feedback.strengths),
            missing_tradeoffs: strList(feedback.missing_tradeoffs),
            cadence_analysis: str(feedback.cadence_analysis),
          },
        }
      : {}),
    ...(parseCriteria(body.rubric_criteria) ? { rubric_criteria: parseCriteria(body.rubric_criteria) } : {}),
  };
}

/** POSTs the session to the evaluator and returns a guarded evaluation. */
export async function evaluateSession(
  session: InterviewSession,
  options: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
): Promise<EnforcedEvaluation> {
  const doFetch = options.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(EVALUATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEvaluationRequest(session)),
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new EvaluationError('Could not reach the evaluation service.');
  }

  if (!res.ok) {
    throw new EvaluationError(`Evaluation failed (HTTP ${res.status}).`, res.status);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new EvaluationError('Evaluation response was not valid JSON.');
  }

  return enforceAntiSycophancy(parseEvaluationPayload(json, session.id));
}
