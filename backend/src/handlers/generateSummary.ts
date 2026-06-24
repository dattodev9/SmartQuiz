// ============================================================
// Smart Quiz — Generate Summary Handler
// POST /api/v1/summaries/generate
// ============================================================

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { withErrorHandler } from '../middleware/errorHandler';
import { validateRequest, generateSummarySchema } from '../middleware/validator';
import { checkRateLimit } from '../middleware/rateLimiter';
import { preprocessText } from '../services/contentService';
import { generateSummary } from '../services/aiService';
import { saveSummary } from '../services/storageService';
import { success, badRequest, tooManyRequests } from '../utils/response';
import { logger } from '../utils/logger';
import type { Summary } from '../types';

async function handleGenerateSummary(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Rate limit check
  const clientIp = event.requestContext?.http?.sourceIp || 'unknown';
  const isAllowed = await checkRateLimit(clientIp);
  if (!isAllowed) {
    return tooManyRequests();
  }

  // Validate request
  const validation = validateRequest(event.body, generateSummarySchema);
  if (!validation.success) {
    return badRequest(validation.error, 'INVALID_REQUEST');
  }

  const { text, format, sourceUrl, pageTitle } = validation.data;

  logger.info('Generating summary', {
    textLength: text.length,
    format,
  });

  // Preprocess text
  const cleanText = preprocessText(text);

  // Generate summary via AI
  const result = await generateSummary(cleanText, format);

  // Build summary object
  const summary: Summary = {
    id: uuidv4(),
    userId: 'anonymous', // Phase 2: extract from JWT
    sourceText: text.substring(0, 500),
    sourceUrl: sourceUrl || undefined,
    pageTitle: pageTitle || undefined,
    bulletPoints: result.bulletPoints,
    flashcards: result.flashcards,
    createdAt: new Date().toISOString(),
  };

  // Save to DynamoDB
  try {
    await saveSummary(summary);
  } catch (err) {
    logger.warn('Failed to save summary to DB, returning result anyway', {
      error: String(err),
    });
  }

  logger.info('Summary generated successfully', {
    summaryId: summary.id,
    bulletCount: result.bulletPoints.length,
    flashcardCount: result.flashcards.length,
  });

  return success(summary, 201);
}

export const handler = withErrorHandler(handleGenerateSummary);
