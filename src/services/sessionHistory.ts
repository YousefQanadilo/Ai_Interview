import type { InterviewSession } from '../types/interview';

export const HISTORY_KEY = 'mock-interview-practice-history-v1';
const MAX_SESSIONS = 20;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function isSession(value: unknown): value is InterviewSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  const diagnostic = session.diagnostic;
  if (!diagnostic || typeof diagnostic !== 'object') return false;
  const scores = diagnostic as Record<string, unknown>;
  return typeof session.id === 'string'
    && typeof session.role === 'string'
    && typeof session.domain === 'string'
    && typeof session.startedAt === 'number'
    && Number.isFinite(session.startedAt)
    && typeof scores.technical_accuracy_score === 'number'
    && typeof scores.communication_score === 'number'
    && typeof scores.hiring_verdict === 'string'
    && typeof scores.flagged_improvement_area === 'object'
    && scores.flagged_improvement_area !== null
    && typeof scores.remediation_drill === 'object'
    && scores.remediation_drill !== null;
}

export function loadHistory(storage: StorageLike): InterviewSession[] {
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSession).slice(0, MAX_SESSIONS) : [];
  } catch {
    return [];
  }
}

export function saveHistory(storage: StorageLike, session: InterviewSession): InterviewSession[] {
  if (!isSession(session)) return loadHistory(storage);
  const entries = [session, ...loadHistory(storage).filter((entry) => entry.id !== session.id)]
    .slice(0, MAX_SESSIONS);
  storage.setItem(HISTORY_KEY, JSON.stringify(entries));
  return entries;
}
