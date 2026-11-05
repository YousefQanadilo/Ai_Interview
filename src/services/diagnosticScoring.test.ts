/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DiagnosticEvaluation } from '../types/interview';
import {
  clampScore,
  enforceAntiSycophancy,
  maxReadinessForScores,
  maxVerdictForScores,
  readinessScore,
} from './diagnosticScoring.ts';
import { evaluateSession, parseEvaluationPayload, EvaluationError } from './evaluationService.ts';

const base = (overrides: Partial<DiagnosticEvaluation> = {}): DiagnosticEvaluation => ({
  session_id: 's1',
  hiring_verdict: 'HIRED',
  verdict_headline: 'Nice work',
  technical_accuracy_score: 75,
  communication_score: 70,
  readiness_level: 'L2_Intermediate',
  rejection_reasons: [],
  flagged_improvement_area: { concept: 'Index selectivity', diagnosis: 'Skipped cardinality.' },
  remediation_drill: { drill_prompt: 'Explain composite indexes.', duration_seconds: 45 },
  ...overrides,
});

test('clampScore keeps scores in 0-100 and handles junk', () => {
  assert.equal(clampScore(140), 100);
  assert.equal(clampScore(-5), 0);
  assert.equal(clampScore(72.6), 73);
  assert.equal(clampScore('81'), 81);
  assert.equal(clampScore(NaN), 0);
  assert.equal(clampScore(undefined), 0);
});

test('verdict ceiling follows the thresholds', () => {
  assert.equal(maxVerdictForScores(90, 85), 'STRONG_HIRE');
  assert.equal(maxVerdictForScores(85, 80), 'STRONG_HIRE'); // boundary is inclusive
  assert.equal(maxVerdictForScores(84, 95), 'HIRED');
  assert.equal(maxVerdictForScores(70, 65), 'HIRED');
  assert.equal(maxVerdictForScores(70, 64), 'LEAN_NO_HIRE');
  assert.equal(maxVerdictForScores(50, 10), 'LEAN_NO_HIRE');
  assert.equal(maxVerdictForScores(49, 100), 'NOT_HIRED');
});

test('missing trade-offs or rejection reasons block STRONG_HIRE', () => {
  assert.equal(maxVerdictForScores(95, 95, { missingTradeoffs: 1 }), 'HIRED');
  assert.equal(maxVerdictForScores(95, 95, { rejectionReasons: 1 }), 'HIRED');
});

test('a weak rubric criterion caps the verdict', () => {
  const criteria = [
    { criterion: 'complexity_analysis' as const, score: 90 },
    { criterion: 'edge_case_testing' as const, score: 40 },
  ];
  assert.equal(maxVerdictForScores(95, 95, { criteria }), 'LEAN_NO_HIRE');
});

test('readiness ceiling and 0-10 readiness score', () => {
  assert.equal(maxReadinessForScores(80, 75), 'L3_Interview_Ready');
  assert.equal(maxReadinessForScores(79, 99), 'L2_Intermediate');
  assert.equal(maxReadinessForScores(54, 99), 'L1_Foundational');
  assert.equal(readinessScore(70, 60), 7); // 0.6*70 + 0.4*60 = 66 -> 7
  assert.equal(readinessScore(0, 0), 0);
  assert.equal(readinessScore(100, 100), 10);
});

test('sycophantic verdict is lowered and the headline replaced', () => {
  const { evaluation, adjustments } = enforceAntiSycophancy(
    base({ hiring_verdict: 'STRONG_HIRE', verdict_headline: 'Amazing!!', technical_accuracy_score: 55, communication_score: 40 }),
  );
  assert.equal(evaluation.hiring_verdict, 'LEAN_NO_HIRE');
  assert.notEqual(evaluation.verdict_headline, 'Amazing!!');
  assert.equal(adjustments.length, 1);
});

test('inflated readiness level is lowered', () => {
  const { evaluation, adjustments } = enforceAntiSycophancy(
    base({ readiness_level: 'L3_Interview_Ready', technical_accuracy_score: 60, communication_score: 60, hiring_verdict: 'LEAN_NO_HIRE' }),
  );
  assert.equal(evaluation.readiness_level, 'L2_Intermediate');
  assert.equal(adjustments.length, 1);
});

test('a harsher model verdict is never upgraded', () => {
  const { evaluation, adjustments } = enforceAntiSycophancy(
    base({ hiring_verdict: 'NOT_HIRED', readiness_level: 'L1_Foundational', technical_accuracy_score: 95, communication_score: 95 }),
  );
  assert.equal(evaluation.hiring_verdict, 'NOT_HIRED');
  assert.equal(evaluation.readiness_level, 'L1_Foundational');
  assert.deepEqual(adjustments, []);
});

test('consistent evaluation passes through unchanged', () => {
  const input = base();
  const { evaluation, adjustments } = enforceAntiSycophancy(input);
  assert.deepEqual(adjustments, []);
  assert.equal(evaluation.verdict_headline, 'Nice work');
  assert.equal(evaluation.hiring_verdict, 'HIRED');
});

test('parseEvaluationPayload accepts a wrapped body and defaults unknown verdicts to NOT_HIRED', () => {
  const parsed = parseEvaluationPayload(
    { evaluation: { hiring_verdict: 'MAYBE', technical_accuracy_score: 80, communication_score: 70, rubric_criteria: [{ criterion: 'star_structure', score: 66 }, { criterion: 'bogus', score: 1 }] } },
    'abc',
  );
  assert.equal(parsed.session_id, 'abc');
  assert.equal(parsed.hiring_verdict, 'NOT_HIRED');
  assert.equal(parsed.readiness_level, 'L1_Foundational');
  assert.equal(parsed.rubric_criteria?.length, 1);
});

test('parseEvaluationPayload rejects a body without scores', () => {
  assert.throws(() => parseEvaluationPayload({ hiring_verdict: 'HIRED' }, 'x'), EvaluationError);
  assert.throws(() => parseEvaluationPayload(null, 'x'), EvaluationError);
});

test('evaluateSession posts to /api/v1/sessions/evaluate and guards the result', async () => {
  let calledWith: { url: string; body: any } | null = null;
  const fakeFetch = (async (url: string, init: RequestInit) => {
    calledWith = { url, body: JSON.parse(init.body as string) };
    return new Response(JSON.stringify(base({ hiring_verdict: 'STRONG_HIRE', technical_accuracy_score: 72, communication_score: 66 })), { status: 200 });
  }) as unknown as typeof fetch;

  const session = { id: 's1', role: 'Junior Backend Engineer', domain: 'Relational Databases & Indexing', initialQuestion: { prompt: 'q', targetMechanism: 'm', expectedKeywords: [] } } as any;
  const { evaluation } = await evaluateSession(session, { fetchImpl: fakeFetch });

  assert.equal(calledWith!.url, '/api/v1/sessions/evaluate');
  assert.equal(calledWith!.body.session_id, 's1');
  assert.equal(evaluation.hiring_verdict, 'HIRED');
});

test('evaluateSession surfaces HTTP errors', async () => {
  const fakeFetch = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
  await assert.rejects(evaluateSession({ id: 's1' } as any, { fetchImpl: fakeFetch }), /HTTP 500/);
});
