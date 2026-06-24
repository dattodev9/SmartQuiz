// ============================================================
// Smart Quiz — Storage Service (DynamoDB)
// CRUD operations for quizzes and summaries
// ============================================================

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type { QuizSet, Summary } from '../types';

// Initialize DynamoDB client outside handler for container reuse
const dynamoConfig: any = {};

// Use DynamoDB Local in dev mode
if (process.env.STAGE === 'dev' && process.env.DYNAMODB_LOCAL === 'true') {
  dynamoConfig.endpoint = 'http://localhost:8000';
  dynamoConfig.region = 'local';
  dynamoConfig.credentials = {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  };
}

const client = new DynamoDBClient(dynamoConfig);
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const TABLE_NAME = process.env.TABLE_NAME || 'smart-quiz-dev';

// --- Quiz Operations ---

export async function saveQuiz(quiz: QuizSet): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${quiz.userId}`,
        SK: `QUIZ#${quiz.createdAt}#${quiz.id}`,
        type: 'quiz',
        ...quiz,
      },
    })
  );
}

export async function getQuiz(userId: string, quizId: string): Promise<QuizSet | null> {
  // We need to query since we don't have the exact SK
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'QUIZ#',
        ':id': quizId,
      },
      Limit: 1,
    })
  );

  if (result.Items && result.Items.length > 0) {
    return result.Items[0] as unknown as QuizSet;
  }
  return null;
}

// --- Summary Operations ---

export async function saveSummary(summary: Summary): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${summary.userId}`,
        SK: `SUMMARY#${summary.createdAt}#${summary.id}`,
        type: 'summary',
        ...summary,
      },
    })
  );
}

// --- History Operations ---

export async function getHistory(
  userId: string,
  limit: number = 20
): Promise<{ quizzes: QuizSet[]; summaries: Summary[] }> {
  // Query all items for this user
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
      ScanIndexForward: false, // newest first
      Limit: limit,
    })
  );

  const items = result.Items || [];

  const quizzes: QuizSet[] = [];
  const summaries: Summary[] = [];

  for (const item of items) {
    if (item.type === 'quiz') {
      quizzes.push(item as unknown as QuizSet);
    } else if (item.type === 'summary') {
      summaries.push(item as unknown as Summary);
    }
  }

  return { quizzes, summaries };
}
