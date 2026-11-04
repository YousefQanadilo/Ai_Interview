export type TargetRole = 
  | 'Junior Backend Engineer'
  | 'Junior Full-Stack Engineer'
  | 'Junior Systems & Infrastructure Engineer';

export type FocusDomain = 
  | 'Relational Databases & Indexing'
  | 'Distributed Systems & Caching'
  | 'Data Structures & Algorithmic Complexity'
  | 'Operating Systems & Concurrency'
  | 'Web Architecture & API Fundamentals';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface InterviewQuestion {
  id: string;
  domain: FocusDomain;
  difficulty: QuestionDifficulty;
  title: string;
  question: string;
  targetMechanism: string;
  expectedKeywords: string[];
  keyInvariants?: string[];
  commonMisconceptions?: string[];
}

export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type InterviewStage = 
  | 'STAGE_1_INIT'
  | 'STAGE_2_QUESTION'
  | 'STAGE_3_PROBE'
  | 'STAGE_4_DIAGNOSTIC'
  | 'STAGE_5_REMEDIATION'
  | 'STAGE_6_SUMMARY';

export interface DiscussionTurn {
  id: string;
  sender: 'interviewer' | 'candidate';
  message: string;
  timestamp: number;
  verification?: {
    isFactuallyCorrect: boolean;
    flaggedErrors: string[];
    verifiedFacts: string[];
    groundTruthReference?: string;
  };
}

export interface InterviewSession {
  id: string;
  role: TargetRole;
  domain: FocusDomain;
  currentStage: InterviewStage;
  startedAt: number;
  endedAt?: number;
  totalDurationSeconds: number;

  // Interactive Discussion History with AI Ground Truth Verification
  discussionHistory?: DiscussionTurn[];

  // Frame 2 Question
  initialQuestion: {
    prompt: string;
    targetMechanism: string;
    expectedKeywords: string[];
    audioUrl?: string;
  };
  candidateInitialAnswer?: {
    transcript: string;
    durationSeconds: number;
    cadenceGapSeconds: number;
    timestamp: number;
  };

  // Frame 3 Adaptive Probe
  adaptiveProbe?: {
    prompt: string;
    isolatedMechanism: string;
    missingTradeoff: string;
    audioUrl?: string;
  };
  candidateProbeAnswer?: {
    transcript: string;
    durationSeconds: number;
    timestamp: number;
  };

  // Frame 4 Diagnostic Rubric
  diagnostic?: DiagnosticEvaluation;

  // Frame 5 Remediation Drill Attempt
  remediationAttempt?: {
    drillPrompt: string;
    transcript: string;
    durationSeconds: number;
    baselineMastery: number;
    revisedMastery: number;
    masteryGain: number;
    strengthsDemonstrated: string[];
    persistingGaps: string[];
    evaluatorNotes: string;
  };
}

export type ReadinessLevel = 'L1_Foundational' | 'L2_Intermediate' | 'L3_Interview_Ready';

export interface FlaggedImprovementArea {
  concept: string;
  cadence_gap_seconds: number;
  diagnosis: string;
}

export interface RemediationDrillSpec {
  drill_prompt: string;
  duration_seconds: number;
  target_mastery_focus: string;
}

export type StrictHiringVerdict = 'STRONG_HIRE' | 'HIRED' | 'LEAN_NO_HIRE' | 'NOT_HIRED';

export interface DiagnosticEvaluation {
  session_id: string;
  hiring_verdict: StrictHiringVerdict;
  verdict_headline: string;
  technical_accuracy_score: number;
  communication_score: number;
  readiness_level: ReadinessLevel;
  rejection_reasons: string[];
  flagged_improvement_area: {
    concept: string;
    diagnosis: string;
    cadence_gap_seconds?: number;
  };
  remediation_drill: {
    drill_prompt: string;
    duration_seconds: number;
    target_mastery_focus?: string;
  };
  model_answer_bullets?: string[];
  detailed_feedback?: {
    strengths: string[];
    missing_tradeoffs: string[];
    cadence_analysis: string;
  };
}

export interface LiveCallDebrief {
  hiring_verdict: StrictHiringVerdict;
  verdict_headline: string;
  technical_accuracy_score: number;
  communication_score: number;
  readiness_level: 'L1_Foundational' | 'L2_Intermediate' | 'L3_Interview_Ready';
  rejection_reasons: string[];
  flagged_improvement_area: {
    concept: string;
    diagnosis: string;
  };
  remediation_drill: {
    drill_prompt: string;
    duration_seconds: number;
  };
  durationSeconds?: number;
  overallImpression?: string;
  demonstratedStrengths?: string[];
  interviewerAdvice?: string[];
}

export interface CumulativeStudentProfile {
  studentName: string;
  sessionsCompleted: number;
  averageAccuracy: number;
  averageCommunication: number;
  readinessTrajectory: Array<{
    date: string;
    role: string;
    domain: string;
    accuracy: number;
    communication: number;
    tier: ReadinessLevel;
    masteryGain: number;
  }>;
}
