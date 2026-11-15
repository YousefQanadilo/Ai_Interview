import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const student = await db.student.upsert({
    where: { id: 'demo-student' },
    update: {},
    create: { id: 'demo-student', displayName: 'Demo Student' },
  });

  const question = await db.interviewQuestion.upsert({
    where: { id: 'demo-btree-index' },
    update: {},
    create: {
      id: 'demo-btree-index',
      domain: 'Relational Databases & Indexing',
      difficulty: 'medium',
      title: 'B-tree indexing',
      prompt: 'How does a B-tree index speed up a query, and when can an index slow writes?',
      targetMechanism: 'Balanced-tree lookups and index maintenance overhead',
      expectedKeywordsJson: JSON.stringify(['B-tree', 'O(log n)', 'write amplification']),
    },
  });

  await db.interviewSession.upsert({
    where: { id: 'sprint2-demo-session' },
    update: {},
    create: {
      id: 'sprint2-demo-session',
      studentId: student.id,
      questionId: question.id,
      role: 'Junior Backend Engineer',
      domain: question.domain,
      currentStage: 'STAGE_1_INIT',
    },
  });

  console.info('Seeded one demo student, one question, and one unscored demo session.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
