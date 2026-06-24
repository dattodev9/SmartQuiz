// ============================================================
// Smart Quiz — Rate Limiter Middleware
// Token bucket rate limiting using in-memory store (dev)
// In production, uses DynamoDB for distributed rate limiting
// ============================================================

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

// In-memory store for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a user/IP has exceeded the rate limit
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  if (process.env.STAGE === 'dev') {
    return checkRateLimitMemory(identifier);
  }
  return checkRateLimitDynamo(identifier);
}

// --- In-memory rate limiting (dev) ---

function checkRateLimitMemory(identifier: string): boolean {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  record.count++;
  return true;
}

// --- DynamoDB rate limiting (production) ---

let docClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const client = new DynamoDBClient({});
    docClient = DynamoDBDocumentClient.from(client);
  }
  return docClient;
}

async function checkRateLimitDynamo(identifier: string): Promise<boolean> {
  const tableName = process.env.TABLE_NAME || 'smart-quiz-dev';
  const now = Date.now();
  const client = getDocClient();

  try {
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          PK: `RATELIMIT#${identifier}`,
          SK: 'CURRENT',
        },
      })
    );

    const record = result.Item;

    if (!record || now > (record.resetAt as number)) {
      // Create new window
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            PK: `RATELIMIT#${identifier}`,
            SK: 'CURRENT',
            count: 1,
            resetAt: now + WINDOW_MS,
            ttl: Math.floor((now + WINDOW_MS * 2) / 1000), // DynamoDB TTL
          },
        })
      );
      return true;
    }

    if ((record.count as number) >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    // Increment counter
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          ...record,
          count: (record.count as number) + 1,
        },
      })
    );
    return true;
  } catch (error) {
    // On error, allow the request (fail open)
    console.error('[Rate Limiter] Error:', error);
    return true;
  }
}
