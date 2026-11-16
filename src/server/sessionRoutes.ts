import express, { type Request, type Response } from 'express';
import type { InterviewSession } from '../types/interview';
import { SessionNotFoundError, SessionValidationError, validateInterviewSession } from './sessionValidation';

export interface SessionHistoryRepository {
  list(): Promise<InterviewSession[]>;
  get(id: string): Promise<InterviewSession | null>;
  save(session: InterviewSession): Promise<InterviewSession>;
  update(id: string, session: InterviewSession): Promise<InterviewSession>;
}

function sendError(response: Response, error: unknown): void {
  if (error instanceof SessionValidationError) {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof SessionNotFoundError) {
    response.status(404).json({ error: error.message });
    return;
  }
  // Keep internal database details out of the public API response.
  response.status(500).json({ error: 'Could not access interview sessions' });
}

export function createSessionRouter(repository: SessionHistoryRepository): express.Router {
  const router = express.Router();

  router.get('/', async (_request: Request, response: Response) => {
    try {
      response.json({ sessions: await repository.list() });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/', async (request: Request, response: Response) => {
    try {
      validateInterviewSession(request.body);
      const session = await repository.save(request.body);
      response.status(201).json({ session });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/:id', async (request: Request, response: Response) => {
    try {
      const session = await repository.get(request.params.id);
      if (!session) {
        response.status(404).json({ error: 'Interview session not found' });
        return;
      }
      response.json({ session });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.put('/:id', async (request: Request, response: Response) => {
    try {
      validateInterviewSession(request.body);
      if (request.body.id !== request.params.id) {
        throw new SessionValidationError('Session id must match the URL');
      }
      response.json({ session: await repository.update(request.params.id, request.body) });
    } catch (error) {
      sendError(response, error);
    }
  });

  return router;
}
