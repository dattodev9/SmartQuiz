// ============================================================
// Smart Quiz — Generate Quiz Handler
// POST /api/v1/quizzes/generate
// ============================================================

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { withErrorHandler } from '../middleware/errorHandler';
import { validateRequest, generateQuizSchema } from '../middleware/validator';
import { checkRateLimit } from '../middleware/rateLimiter';
import { preprocessText } from '../services/contentService';
import { generateQuiz } from '../services/aiService';
import { saveQuiz } from '../services/storageService';
import { success, badRequest, tooManyRequests } from '../utils/response';
import { logger } from '../utils/logger';
import { QUIZ_DEFAULTS } from '../types';
import type { QuizSet } from '../types';

async function handleGenerateQuiz(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Rate limit check
  const clientIp = event.requestContext?.http?.sourceIp || 'unknown';
  const isAllowed = await checkRateLimit(clientIp);
  if (!isAllowed) {
    return tooManyRequests();
  }

  // Validate request
  const validation = validateRequest(event.body, generateQuizSchema);
  if (!validation.success) {
    return badRequest(validation.error, 'INVALID_REQUEST');
  }

  const { text, numQuestions, sourceUrl, pageTitle } = validation.data;

  logger.info('Generating quiz', {
    textLength: text.length,
    numQuestions: numQuestions || QUIZ_DEFAULTS.NUM_QUESTIONS,
  });

  // Preprocess text
  const cleanText = preprocessText(text);

  // Generate quiz via AI
  const questions = await generateQuiz(
    cleanText,
    numQuestions || QUIZ_DEFAULTS.NUM_QUESTIONS
  );

  // Build quiz set
  const quizSet: QuizSet = {
    id: uuidv4(),
    userId: 'anonymous', // Phase 2: extract from JWT
    sourceText: text.substring(0, 500), // Store truncated source for reference
    sourceUrl: sourceUrl || undefined,
    pageTitle: pageTitle || undefined,
    questions,
    totalQuestions: questions.length,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Save to DynamoDB
  try {
    await saveQuiz(quizSet);
  } catch (err) {
    logger.warn('Failed to save quiz to DB, returning result anyway', {
      error: String(err),
    });
  }

  logger.info('Quiz generated successfully', {
    quizId: quizSet.id,
    questionCount: questions.length,
  });

  return success(quizSet, 201);
}

export const handler = withErrorHandler(handleGenerateQuiz);
