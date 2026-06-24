// ============================================================
// Smart Quiz — Error Handler Middleware
// Maps errors to user-friendly responses
// ============================================================

import type { APIGatewayProxyResult } from 'aws-lambda';
import { error } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Wraps a Lambda handler with error handling
 */
export function withErrorHandler(
  handler: (event: any) => Promise<APIGatewayProxyResult>
): (event: any) => Promise<APIGatewayProxyResult> {
  return async (event: any): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event);
    } catch (err) {
      return handleError(err);
    }
  };
}

function handleError(err: unknown): APIGatewayProxyResult {
  const errorObj = err instanceof Error ? err : new Error(String(err));

  logger.error('Unhandled error', {
    name: errorObj.name,
    message: errorObj.message,
    stack: errorObj.stack,
  });

  // Map known error types to friendly messages
  if (errorObj.message.includes('API key')) {
    return error('Cấu hình API không hợp lệ. Vui lòng liên hệ quản trị viên.', 500);
  }

  if (errorObj.message.includes('quota') || errorObj.message.includes('rate limit')) {
    return error(
      'Hệ thống AI đang bận. Vui lòng thử lại sau vài giây.',
      503,
      'AI_RATE_LIMIT'
    );
  }

  if (errorObj.message.includes('invalid') && errorObj.message.includes('format')) {
    return error(
      'AI không thể xử lý đoạn văn này. Hãy thử chọn đoạn khác.',
      422,
      'AI_GENERATION_FAILED'
    );
  }

  if (errorObj.message.includes('timeout') || errorObj.message.includes('ETIMEDOUT')) {
    return error(
      'Yêu cầu mất quá nhiều thời gian. Hãy thử với đoạn văn ngắn hơn.',
      504,
      'TIMEOUT'
    );
  }

  // Default error
  return error('Có lỗi xảy ra. Vui lòng thử lại sau.', 500, 'INTERNAL_ERROR');
}
