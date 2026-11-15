PRAGMA foreign_keys=OFF;

CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "targetMechanism" TEXT NOT NULL,
    "expectedKeywordsJson" TEXT NOT NULL DEFAULT '[]',
    "keyInvariantsJson" TEXT NOT NULL DEFAULT '[]',
    "misconceptionsJson" TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX "InterviewQuestion_domain_difficulty_idx" ON "InterviewQuestion"("domain", "difficulty");

CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT,
    "questionId" TEXT,
    "role" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL DEFAULT 'STAGE_1_INIT',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "totalDurationSeconds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InterviewSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InterviewSession_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "InterviewSession_studentId_startedAt_idx" ON "InterviewSession"("studentId", "startedAt");
CREATE INDEX "InterviewSession_startedAt_idx" ON "InterviewSession"("startedAt");

CREATE TABLE "InterviewResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "cadenceGapSeconds" INTEGER,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "InterviewResponse_sessionId_recordedAt_idx" ON "InterviewResponse"("sessionId", "recordedAt");

CREATE TABLE "DiagnosticEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "hiringVerdict" TEXT NOT NULL,
    "verdictHeadline" TEXT NOT NULL,
    "technicalAccuracy" INTEGER NOT NULL,
    "communicationScore" INTEGER NOT NULL,
    "readinessLevel" TEXT NOT NULL,
    "rejectionReasonsJson" TEXT NOT NULL DEFAULT '[]',
    "flaggedConcept" TEXT NOT NULL,
    "flaggedDiagnosis" TEXT NOT NULL,
    "cadenceGapSeconds" INTEGER,
    "drillPrompt" TEXT NOT NULL,
    "drillDurationSeconds" INTEGER NOT NULL,
    "drillFocus" TEXT,
    "modelAnswerJson" TEXT NOT NULL DEFAULT '[]',
    "detailedFeedbackJson" TEXT NOT NULL DEFAULT '{}',
    "rubricCriteriaJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiagnosticEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DiagnosticEvaluation_sessionId_key" ON "DiagnosticEvaluation"("sessionId");

CREATE TABLE "RemediationAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "drillPrompt" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "baselineMastery" INTEGER NOT NULL,
    "revisedMastery" INTEGER NOT NULL,
    "masteryGain" INTEGER NOT NULL,
    "strengthsJson" TEXT NOT NULL DEFAULT '[]',
    "persistingGapsJson" TEXT NOT NULL DEFAULT '[]',
    "evaluatorNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RemediationAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "RemediationAttempt_sessionId_createdAt_idx" ON "RemediationAttempt"("sessionId", "createdAt");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
