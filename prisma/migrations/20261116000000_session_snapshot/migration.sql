-- Persist the complete shared session model so the API can restore it exactly.
ALTER TABLE "InterviewSession" ADD COLUMN "sessionData" TEXT NOT NULL DEFAULT '{}';
