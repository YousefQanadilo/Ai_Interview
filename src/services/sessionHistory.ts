import type { InterviewSession } from '../types/interview';

const API_URL = '/api/v1/sessions';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

async function request<T>(fetcher: Fetcher, path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('The session service is unavailable. Check your connection and try again.');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The session service returned an invalid response.');
  }
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      && typeof payload.error === 'string' ? payload.error : 'Could not access interview sessions.';
    throw new Error(message);
  }
  return payload as T;
}

export async function loadHistory(fetcher: Fetcher = fetch): Promise<InterviewSession[]> {
  const result = await request<{ sessions: InterviewSession[] }>(fetcher, API_URL);
  return result.sessions;
}

export async function saveHistory(
  session: InterviewSession,
  fetcher: Fetcher = fetch,
): Promise<InterviewSession> {
  const result = await request<{ session: InterviewSession }>(fetcher, API_URL, {
    method: 'POST',
    body: JSON.stringify(session),
  });
  return result.session;
}

export async function updateHistory(
  session: InterviewSession,
  fetcher: Fetcher = fetch,
): Promise<InterviewSession> {
  const result = await request<{ session: InterviewSession }>(fetcher, `${API_URL}/${encodeURIComponent(session.id)}`, {
    method: 'PUT',
    body: JSON.stringify(session),
  });
  return result.session;
}
