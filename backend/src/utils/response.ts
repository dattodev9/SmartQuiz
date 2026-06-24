// ============================================================
// Smart Quiz — Response Utility
// Standardized API response helpers
// ============================================================

import type { APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export function success<T>(data: T, statusCode: number = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      data,
    }),
  };
}

export function error(
  message: string,
  statusCode: number = 500,
  errorCode?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: false,
      error: message,
      errorCode,
    }),
  };
}

export function badRequest(message: string, errorCode?: string): APIGatewayProxyResult {
  return error(message, 400, errorCode);
}

export function notFound(message: string = 'Resource not found'): APIGatewayProxyResult {
  return error(message, 404, 'NOT_FOUND');
}

export function tooManyRequests(): APIGatewayProxyResult {
  return error(
    'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
}
