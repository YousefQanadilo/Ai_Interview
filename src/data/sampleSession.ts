import { InterviewSession } from '../types/interview';

/**
 * Sample finished session used to demo the Frame 4 diagnostic screen until the
 * interview stages (Frames 2-3) and the /api/v1/sessions/evaluate backend exist.
 *
 * The evaluator's verdict is deliberately inflated (Strong Hire on 70% / 60%)
 * so the demo also shows the anti-sycophancy guard lowering it.
 */
export const SAMPLE_SESSION: InterviewSession = {
  id: 'sample-session-1',
  role: 'Junior Backend Engineer',
  domain: 'Relational Databases & Indexing',
  currentStage: 'STAGE_4_DIAGNOSTIC',
  startedAt: Date.now() - 6 * 60 * 1000,
  endedAt: Date.now(),
  totalDurationSeconds: 360,
  initialQuestion: {
    prompt: 'How does a B-tree index speed up a query, and when would adding one hurt performance?',
    targetMechanism: 'B-tree index lookups and write amplification',
    expectedKeywords: ['B-tree', 'O(log n)', 'selectivity', 'write cost', 'composite index'],
  },
  candidateInitialAnswer: {
    transcript:
      'A B-tree keeps keys sorted so the database can find a row in log n steps instead of scanning the whole table...',
    durationSeconds: 95,
    cadenceGapSeconds: 8,
    timestamp: Date.now() - 4 * 60 * 1000,
  },
  diagnostic: {
    session_id: 'sample-session-1',
    hiring_verdict: 'STRONG_HIRE',
    verdict_headline: 'Excellent answer!',
    technical_accuracy_score: 70,
    communication_score: 60,
    readiness_level: 'L3_Interview_Ready',
    rejection_reasons: ['Did not explain the write cost of maintaining extra indexes.'],
    flagged_improvement_area: {
      concept: 'Index trade-offs',
      diagnosis: 'Long pause before covering when an index hurts write performance.',
      cadence_gap_seconds: 8,
    },
    remediation_drill: {
      drill_prompt: 'In 45 seconds: explain one case where adding an index makes an application slower.',
      duration_seconds: 45,
      target_mastery_focus: 'Index write amplification',
    },
    model_answer_bullets: [
      'B-tree lookups are O(log n) because keys stay sorted in a balanced tree.',
      'Indexes help most on selective columns used in WHERE, JOIN and ORDER BY.',
      'Every insert, update and delete must also update each index, so writes get slower.',
    ],
    detailed_feedback: {
      strengths: ['Correct explanation of sorted B-tree lookups', 'Clear O(log n) complexity analysis'],
      missing_tradeoffs: ['Write cost of maintaining extra indexes', 'Low-selectivity columns gain little'],
      cadence_analysis: 'An 8-second gap before the follow-up suggests the trade-off was not prepared.',
    },
    rubric_criteria: [
      { criterion: 'communication', score: 60, evidence: 'Clear start, but several filler pauses.' },
      { criterion: 'complexity_analysis', score: 78 },
      { criterion: 'edge_case_testing', score: 45, evidence: 'No mention of low-selectivity or write-heavy tables.' },
      { criterion: 'star_structure', score: 55 },
    ],
  },
};
