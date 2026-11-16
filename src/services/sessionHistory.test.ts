import assert from 'node:assert/strict';
import test from 'node:test';
import { loadHistory, saveHistory, updateHistory } from './sessionHistory';
import { SAMPLE_SESSION } from '../data/sampleSession';

const ok = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

test('loads saved history from the API', async () => {
  const history = await loadHistory(async () => ok({ sessions: [SAMPLE_SESSION] }));
  assert.equal(history[0].id, SAMPLE_SESSION.id);
});

test('saves a session with POST and returns the persisted record', async () => {
  let method = '';
  const saved = await saveHistory(SAMPLE_SESSION, async (_input, init) => {
    method = init?.method ?? '';
    assert.deepEqual(JSON.parse(String(init?.body)), SAMPLE_SESSION);
    return ok({ session: SAMPLE_SESSION }, 201);
  });
  assert.equal(method, 'POST');
  assert.equal(saved.id, SAMPLE_SESSION.id);
});

test('updates an existing session with PUT', async () => {
  let url = '';
  let method = '';
  await updateHistory(SAMPLE_SESSION, async (input, init) => {
    url = String(input);
    method = init?.method ?? '';
    return ok({ session: SAMPLE_SESSION });
  });
  assert.equal(url, `/api/v1/sessions/${encodeURIComponent(SAMPLE_SESSION.id)}`);
  assert.equal(method, 'PUT');
});

test('reports API errors and network failures to the caller', async () => {
  await assert.rejects(loadHistory(async () => ok({ error: 'Invalid payload' }, 400)), /Invalid payload/);
  await assert.rejects(loadHistory(async () => { throw new Error('offline'); }), /service is unavailable/);
});
