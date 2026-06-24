// ============================================================
// Smart Quiz — Get Quiz Handler
// GET /api/v1/quizzes/:id
// ============================================================

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { withErrorHandler } from '../middleware/errorHandler';
import { getQuiz } from '../services/storageService';
import { success, notFound, badRequest } from '../utils/response';
import { logger } from '../utils/logger';

async function handleGetQuiz(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const quizId = event.pathParameters?.id;
  const userId = 'anonymous'; // Phase 2: extract from JWT

  if (!quizId) {
    return badRequest('Quiz ID is required');
  }

  logger.info('Fetching quiz', { quizId, userId });

  const quiz = await getQuiz(userId, quizId);

  if (!quiz) {
    return notFound('Quiz not found');
  }

  return success(quiz);
}

export const handler = withErrorHandler(handleGetQuiz);
