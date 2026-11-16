import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import express from 'express';
import test from 'node:test';
import type { InterviewSession } from '../types/interview';
import { SAMPLE_SESSION } from '../data/sampleSession';
import { createSessionRouter, type SessionHistoryRepository } from './sessionRoutes';

async function withApi(repository: SessionHistoryRepository, run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/sessions', createSessionRouter(repository));
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not start');
  try {
    await run(`http://127.0.0.1:${address.port}/api/v1/sessions`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function memoryRepository(): SessionHistoryRepository {
  const sessions = new Map<string, InterviewSession>();
  return {
    list: async () => [...sessions.values()],
    get: async (id) => sessions.get(id) ?? null,
    save: async (session) => { sessions.set(session.id, session); return session; },
    update: async (id, session) => {
      if (!sessions.has(id)) throw new Error('not found');
      sessions.set(id, session);
      return session;
    },
  };
}

test('session API creates, lists, retrieves, and updates sessions', async () => {
  const repository = memoryRepository();
  await withApi(repository, async (url) => {
    const created = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SAMPLE_SESSION) });
    assert.equal(created.status, 201);
    assert.equal((await created.json() as { session: InterviewSession }).session.id, SAMPLE_SESSION.id);

    const listed = await fetch(url);
    assert.equal((await listed.json() as { sessions: InterviewSession[] }).sessions.length, 1);

    const found = await fetch(`${url}/${SAMPLE_SESSION.id}`);
    assert.equal((await found.json() as { session: InterviewSession }).session.role, SAMPLE_SESSION.role);

    const updatedSession = { ...SAMPLE_SESSION, totalDurationSeconds: 500 };
    const updated = await fetch(`${url}/${SAMPLE_SESSION.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedSession),
    });
    assert.equal((await updated.json() as { session: InterviewSession }).session.totalDurationSeconds, 500);
  });
});

test('session API rejects invalid payloads and mismatched update IDs', async () => {
  await withApi(memoryRepository(), async (url) => {
    const invalid = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...SAMPLE_SESSION, role: 'invalid' }) });
    assert.equal(invalid.status, 400);
    const mismatch = await fetch(`${url}/different-id`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SAMPLE_SESSION),
    });
    assert.equal(mismatch.status, 400);
    assert.equal((await fetch(`${url}/missing`)).status, 404);
  });
});

test('session API reports repository failures without leaking database details', async () => {
  const failing: SessionHistoryRepository = {
    ...memoryRepository(),
    list: async () => { throw new Error('private database connection detail'); },
  };
  await withApi(failing, async (url) => {
    const response = await fetch(url);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Could not access interview sessions' });
  });
});
