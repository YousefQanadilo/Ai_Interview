import type { FocusDomain, InterviewSession, InterviewStage, TargetRole } from '../types/interview';

export class SessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionValidationError';
  }
}

export class SessionNotFoundError extends Error {
  constructor() {
    super('Interview session not found');
    this.name = 'SessionNotFoundError';
  }
}

const roles: readonly TargetRole[] = [
  'Junior Backend Engineer', 'Junior Full-Stack Engineer', 'Junior Systems & Infrastructure Engineer',
];
const domains: readonly FocusDomain[] = [
  'Relational Databases & Indexing', 'Distributed Systems & Caching',
  'Data Structures & Algorithmic Complexity', 'Operating Systems & Concurrency',
  'Web Architecture & API Fundamentals',
];
const stages: readonly InterviewStage[] = [
  'STAGE_1_INIT', 'STAGE_2_QUESTION', 'STAGE_3_PROBE', 'STAGE_4_DIAGNOSTIC',
  'STAGE_5_REMEDIATION', 'STAGE_6_SUMMARY',
];

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validScore(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 100;
}

/** Shared HTTP and data-access validation for a complete session payload. */
export function validateInterviewSession(value: unknown): asserts value is InterviewSession {
  if (!object(value)) throw new SessionValidationError('Session payload must be an object');
  if (!nonempty(value.id)) throw new SessionValidationError('Session id is required');
  if (!roles.includes(value.role as TargetRole)) throw new SessionValidationError('Invalid target role');
  if (!domains.includes(value.domain as FocusDomain)) throw new SessionValidationError('Invalid focus domain');
  if (!stages.includes(value.currentStage as InterviewStage)) throw new SessionValidationError('Invalid interview stage');
  if (!Number.isSafeInteger(value.startedAt) || (value.startedAt as number) < 0) {
    throw new SessionValidationError('startedAt must be a valid timestamp');
  }
  if (!Number.isSafeInteger(value.totalDurationSeconds) || (value.totalDurationSeconds as number) < 0) {
    throw new SessionValidationError('totalDurationSeconds must be a nonnegative integer');
  }
  if (value.endedAt !== undefined && (!Number.isSafeInteger(value.endedAt) || (value.endedAt as number) < 0)) {
    throw new SessionValidationError('endedAt must be a valid timestamp');
  }
  if (!object(value.initialQuestion) || !nonempty(value.initialQuestion.prompt)
    || !nonempty(value.initialQuestion.targetMechanism)
    || !Array.isArray(value.initialQuestion.expectedKeywords)
    || !value.initialQuestion.expectedKeywords.every(nonempty)) {
    throw new SessionValidationError('initialQuestion is invalid');
  }
  if (value.diagnostic !== undefined) {
    const diagnostic = value.diagnostic;
    if (!object(diagnostic) || diagnostic.session_id !== value.id
      || !validScore(diagnostic.technical_accuracy_score)
      || !validScore(diagnostic.communication_score)
      || !nonempty(diagnostic.verdict_headline)
      || !object(diagnostic.flagged_improvement_area)
      || !nonempty(diagnostic.flagged_improvement_area.concept)
      || !nonempty(diagnostic.flagged_improvement_area.diagnosis)
      || !object(diagnostic.remediation_drill)
      || !nonempty(diagnostic.remediation_drill.drill_prompt)
      || !Number.isSafeInteger(diagnostic.remediation_drill.duration_seconds)
      || (diagnostic.remediation_drill.duration_seconds as number) < 0) {
      throw new SessionValidationError('diagnostic evaluation is invalid');
    }
  }
}
