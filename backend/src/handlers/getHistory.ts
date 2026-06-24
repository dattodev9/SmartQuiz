// ============================================================
// Smart Quiz — Get History Handler
// GET /api/v1/history
// ============================================================

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { withErrorHandler } from '../middleware/errorHandler';
import { getHistory } from '../services/storageService';
import { success } from '../utils/response';
import { logger } from '../utils/logger';

async function handleGetHistory(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const userId = 'anonymous'; // Phase 2: extract from JWT
  const limit = parseInt(event.queryStringParameters?.limit || '20', 10);

  logger.info('Fetching history', { userId, limit });

  const history = await getHistory(userId, Math.min(limit, 50));

  return success(history);
}

export const handler = withErrorHandler(handleGetHistory);
