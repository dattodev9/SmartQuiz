// ============================================================
// Smart Quiz — Health Check Handler
// GET /api/v1/health
// ============================================================

import type { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'healthy',
      service: 'smart-quiz-api',
      stage: process.env.STAGE || 'unknown',
      timestamp: new Date().toISOString(),
    }),
  };
};
