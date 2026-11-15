import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('Prisma SQLite persistence survives reconnect and validates inputs', async () => {
  const filename = `sprint2-test-${process.pid}-${Date.now()}.db`;
  const databaseUrl = `file:./${filename}`;
  const databasePath = path.resolve(process.cwd(), 'prisma', filename);
  process.env.DATABASE_URL = databaseUrl;

  const migrate = spawnSync(
    process.execPath,
    ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
    { cwd: process.cwd(), env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: 'utf8' },
  );
  assert.equal(migrate.status, 0, `Migration failed:\n${migrate.stdout}\n${migrate.stderr}`);

  const db = await import('../../src/server/prismaClient');
  const repository = await import('../../src/server/interviewRepository');
  const { PrismaClient } = await import('@prisma/client');
  const { SAMPLE_SESSION } = await import('../../src/data/sampleSession');

  try {
    await assert.rejects(
      repository.createInterviewSession({
        role: 'wrong role' as never,
        domain: 'Relational Databases & Indexing',
      }),
      /Invalid target role/,
    );

    const session = await repository.createInterviewSession({
      role: 'Junior Backend Engineer',
      domain: 'Relational Databases & Indexing',
    });

    await assert.rejects(
      repository.addInterviewResponse({
        sessionId: session.id,
        kind: 'INITIAL',
        transcript: '   ',
        durationSeconds: 12,
      }),
      /transcript is required/,
    );

    await repository.addInterviewResponse({
      sessionId: session.id,
      kind: 'INITIAL',
      transcript: 'B-tree indexes improve selective read queries.',
      durationSeconds: 12,
    });

    assert.ok(SAMPLE_SESSION.diagnostic);
    await repository.saveDiagnosticEvaluation(session.id, {
      ...SAMPLE_SESSION.diagnostic,
      session_id: session.id,
    });
    await repository.updateInterviewStage(session.id, 'STAGE_4_DIAGNOSTIC');

    const found = await repository.getInterviewSession(session.id);
    assert.equal(found?.responses.length, 1);
    assert.equal(found?.evaluation?.technicalAccuracy, 70);
    assert.equal(found?.currentStage, 'STAGE_4_DIAGNOSTIC');

    await db.prisma.$disconnect();

    const reopened = new PrismaClient();
    try {
      const persisted = await reopened.interviewSession.findUnique({
        where: { id: session.id },
        include: { responses: true, evaluation: true },
      });
      assert.equal(persisted?.responses[0].transcript, 'B-tree indexes improve selective read queries.');
      assert.equal(persisted?.evaluation?.communicationScore, 60);
    } finally {
      await reopened.$disconnect();
    }
  } finally {
    await db.prisma.$disconnect();
    rmSync(databasePath, { force: true });
    rmSync(`${databasePath}-journal`, { force: true });
    rmSync(`${databasePath}-wal`, { force: true });
    rmSync(`${databasePath}-shm`, { force: true });
  }
});
