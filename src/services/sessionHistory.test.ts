import assert from 'node:assert/strict';
import test from 'node:test';
import { HISTORY_KEY, loadHistory, saveHistory } from './sessionHistory';
import { SAMPLE_SESSION } from '../data/sampleSession';

function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => { items.set(key, value); },
  };
}

test('loads empty history', () => {
  assert.deepEqual(loadHistory(memoryStorage()), []);
});

test('saves and reloads a diagnostic session', () => {
  const storage = memoryStorage();
  saveHistory(storage, SAMPLE_SESSION);
  assert.equal(loadHistory(storage)[0].id, SAMPLE_SESSION.id);
});

test('repeated saves update rather than duplicate a session', () => {
  const storage = memoryStorage();
  saveHistory(storage, SAMPLE_SESSION);
  saveHistory(storage, SAMPLE_SESSION);
  assert.equal(loadHistory(storage).length, 1);
});

test('ignores malformed JSON and invalid entries', () => {
  const storage = memoryStorage();
  storage.setItem(HISTORY_KEY, '{bad json');
  assert.deepEqual(loadHistory(storage), []);
  storage.setItem(HISTORY_KEY, JSON.stringify([null, {}, { id: 'fake' }, SAMPLE_SESSION]));
  assert.equal(loadHistory(storage).length, 1);
});

test('limits history to twenty sessions', () => {
  const storage = memoryStorage();
  for (let i = 0; i < 25; i++) {
    saveHistory(storage, { ...SAMPLE_SESSION, id: 'demo-' + i });
  }
  assert.equal(loadHistory(storage).length, 20);
  assert.equal(loadHistory(storage)[0].id, 'demo-24');
});
