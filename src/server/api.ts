import express from 'express';
import { createSessionRouter } from './sessionRoutes';
import {
  getInterviewSessionSnapshot,
  listInterviewSessionSnapshots,
  saveInterviewSessionSnapshot,
  updateInterviewSessionSnapshot,
} from './interviewRepository';

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1/sessions', createSessionRouter({
    list: listInterviewSessionSnapshots,
    get: getInterviewSessionSnapshot,
    save: saveInterviewSessionSnapshot,
    update: updateInterviewSessionSnapshot,
  }));
  app.use('/api/*', (_request, response) => response.status(404).json({ error: 'API route not found' }));
  return app;
}
