import type { DiagnosticEvaluation, FocusDomain, InterviewSession, InterviewStage, StrictHiringVerdict, TargetRole } from '../types/interview';
import { prisma } from './prismaClient';
import { SessionNotFoundError, validateInterviewSession } from './sessionValidation';

const ROLES: readonly TargetRole[] = [
  'Junior Backend Engineer',
  'Junior Full-Stack Engineer',
  'Junior Systems & Infrastructure Engineer',
];

const DOMAINS: readonly FocusDomain[] = [
  'Relational Databases & Indexing',
  'Distributed Systems & Caching',
  'Data Structures & Algorithmic Complexity',
  'Operating Systems & Concurrency',
  'Web Architecture & API Fundamentals',
];

const STAGES: readonly InterviewStage[] = [
  'STAGE_1_INIT', 'STAGE_2_QUESTION', 'STAGE_3_PROBE',
  'STAGE_4_DIAGNOSTIC', 'STAGE_5_REMEDIATION', 'STAGE_6_SUMMARY',
];

function required(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

function nonnegative(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} must be a nonnegative integer`);
  return value;
}

function score(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be an integer from 0 to 100`);
  }
  return value;
}

export type NewSession = {
  id?: string;
  studentId?: string;
  questionId?: string;
  role: TargetRole;
  domain: FocusDomain;
  startedAt?: Date;
};

export async function createInterviewSession(input: NewSession) {
  if (!ROLES.includes(input.role)) throw new Error('Invalid target role');
  if (!DOMAINS.includes(input.domain)) throw new Error('Invalid focus domain');
  if (input.id !== undefined) required(input.id, 'session id');
  if (input.studentId !== undefined) required(input.studentId, 'student id');
  if (input.questionId !== undefined) required(input.questionId, 'question id');
  if (input.startedAt && Number.isNaN(input.startedAt.getTime())) throw new Error('Invalid start date');

  return prisma.interviewSession.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      ...(input.studentId ? { student: { connect: { id: input.studentId } } } : {}),
      ...(input.questionId ? { question: { connect: { id: input.questionId } } } : {}),
      role: input.role,
      domain: input.domain,
      ...(input.startedAt ? { startedAt: input.startedAt } : {}),
    },
  });
}

export async function getInterviewSession(id: string) {
  return prisma.interviewSession.findUnique({
    where: { id: required(id, 'session id') },
    include: {
      student: true,
      question: true,
      responses: { orderBy: { recordedAt: 'asc' } },
      evaluation: true,
      remediationAttempts: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function listInterviewSessions(studentId?: string) {
  return prisma.interviewSession.findMany({
    where: studentId ? { studentId: required(studentId, 'student id') } : {},
    include: { evaluation: true },
    orderBy: { startedAt: 'desc' },
    take: 100,
  });
}

export async function updateInterviewStage(
  id: string,
  stage: InterviewStage,
  options: { endedAt?: Date; totalDurationSeconds?: number } = {},
) {
  if (!STAGES.includes(stage)) throw new Error('Invalid interview stage');
  if (options.endedAt && Number.isNaN(options.endedAt.getTime())) throw new Error('Invalid end date');
  return prisma.interviewSession.update({
    where: { id: required(id, 'session id') },
    data: {
      currentStage: stage,
      ...(options.endedAt ? { endedAt: options.endedAt } : {}),
      ...(options.totalDurationSeconds !== undefined
        ? { totalDurationSeconds: nonnegative(options.totalDurationSeconds, 'duration') } : {}),
    },
  });
}

/** Save the full UI session snapshot and searchable session metadata in SQLite. */
export async function saveInterviewSessionSnapshot(session: InterviewSession): Promise<InterviewSession> {
  validateInterviewSession(session);
  const startedAt = new Date(session.startedAt);
  const endedAt = session.endedAt === undefined ? null : new Date(session.endedAt);
  await prisma.interviewSession.upsert({
    where: { id: session.id },
    create: {
      id: session.id,
      role: session.role,
      domain: session.domain,
      currentStage: session.currentStage,
      startedAt,
      endedAt,
      totalDurationSeconds: session.totalDurationSeconds,
      sessionData: JSON.stringify(session),
    },
    update: {
      role: session.role,
      domain: session.domain,
      currentStage: session.currentStage,
      startedAt,
      endedAt,
      totalDurationSeconds: session.totalDurationSeconds,
      sessionData: JSON.stringify(session),
    },
  });
  return session;
}

/** PUT semantics: an update must refer to an existing database record. */
export async function updateInterviewSessionSnapshot(id: string, session: InterviewSession): Promise<InterviewSession> {
  if (id !== session.id) throw new Error('Session ID does not match URL');
  const existing = await prisma.interviewSession.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new SessionNotFoundError();
  return saveInterviewSessionSnapshot(session);
}

export async function getInterviewSessionSnapshot(id: string): Promise<InterviewSession | null> {
  const record = await prisma.interviewSession.findUnique({
    where: { id: required(id, 'session id') },
    select: { sessionData: true },
  });
  if (!record || record.sessionData === '{}') return null;
  try {
    const value: unknown = JSON.parse(record.sessionData);
    validateInterviewSession(value);
    return value;
  } catch {
    return null;
  }
}

export async function listInterviewSessionSnapshots(): Promise<InterviewSession[]> {
  const records = await prisma.interviewSession.findMany({
    select: { sessionData: true },
    orderBy: { startedAt: 'desc' },
    take: 100,
  });
  const sessions: InterviewSession[] = [];
  for (const record of records) {
    try {
      const value: unknown = JSON.parse(record.sessionData);
      validateInterviewSession(value);
      sessions.push(value);
    } catch {
      // Ignore legacy rows and any invalid snapshot rather than breaking all history.
    }
  }
  return sessions;
}

export async function addInterviewResponse(input: {
  sessionId: string;
  kind: 'INITIAL' | 'PROBE';
  transcript: string;
  durationSeconds: number;
  cadenceGapSeconds?: number;
}) {
  if (input.kind !== 'INITIAL' && input.kind !== 'PROBE') throw new Error('Invalid response kind');
  return prisma.interviewResponse.create({
    data: {
      sessionId: required(input.sessionId, 'session id'),
      kind: input.kind,
      transcript: required(input.transcript, 'transcript'),
      durationSeconds: nonnegative(input.durationSeconds, 'duration'),
      ...(input.cadenceGapSeconds !== undefined
        ? { cadenceGapSeconds: nonnegative(input.cadenceGapSeconds, 'cadence gap') } : {}),
    },
  });
}

export async function saveDiagnosticEvaluation(sessionId: string, evaluation: DiagnosticEvaluation) {
  const id = required(sessionId, 'session id');
  if (evaluation.session_id !== id) throw new Error('Evaluation session ID does not match');
  const verdicts: readonly StrictHiringVerdict[] = ['STRONG_HIRE', 'HIRED', 'LEAN_NO_HIRE', 'NOT_HIRED'];
  if (!verdicts.includes(evaluation.hiring_verdict)) throw new Error('Invalid hiring verdict');
  const technicalAccuracy = score(evaluation.technical_accuracy_score, 'technical accuracy');
  const communicationScore = score(evaluation.communication_score, 'communication');
  const drillDurationSeconds = nonnegative(evaluation.remediation_drill.duration_seconds, 'drill duration');
  const data = {
    hiringVerdict: evaluation.hiring_verdict,
    verdictHeadline: required(evaluation.verdict_headline, 'verdict headline'),
    technicalAccuracy,
    communicationScore,
    readinessLevel: evaluation.readiness_level,
    rejectionReasonsJson: JSON.stringify(evaluation.rejection_reasons ?? []),
    flaggedConcept: required(evaluation.flagged_improvement_area.concept, 'flagged concept'),
    flaggedDiagnosis: required(evaluation.flagged_improvement_area.diagnosis, 'flagged diagnosis'),
    cadenceGapSeconds: evaluation.flagged_improvement_area.cadence_gap_seconds ?? null,
    drillPrompt: required(evaluation.remediation_drill.drill_prompt, 'drill prompt'),
    drillDurationSeconds,
    drillFocus: evaluation.remediation_drill.target_mastery_focus ?? null,
    modelAnswerJson: JSON.stringify(evaluation.model_answer_bullets ?? []),
    detailedFeedbackJson: JSON.stringify(evaluation.detailed_feedback ?? {}),
    rubricCriteriaJson: JSON.stringify(evaluation.rubric_criteria ?? []),
  };
  return prisma.diagnosticEvaluation.upsert({
    where: { sessionId: id },
    create: { sessionId: id, ...data },
    update: data,
  });
}

export async function addRemediationAttempt(input: {
  sessionId: string;
  drillPrompt: string;
  transcript: string;
  durationSeconds: number;
  baselineMastery: number;
  revisedMastery: number;
  strengths?: string[];
  persistingGaps?: string[];
  evaluatorNotes?: string;
}) {
  const baselineMastery = score(input.baselineMastery, 'baseline mastery');
  const revisedMastery = score(input.revisedMastery, 'revised mastery');
  return prisma.remediationAttempt.create({
    data: {
      sessionId: required(input.sessionId, 'session id'),
      drillPrompt: required(input.drillPrompt, 'drill prompt'),
      transcript: required(input.transcript, 'transcript'),
      durationSeconds: nonnegative(input.durationSeconds, 'duration'),
      baselineMastery,
      revisedMastery,
      masteryGain: revisedMastery - baselineMastery,
      strengthsJson: JSON.stringify(input.strengths ?? []),
      persistingGapsJson: JSON.stringify(input.persistingGaps ?? []),
      evaluatorNotes: input.evaluatorNotes ?? '',
    },
  });
}
