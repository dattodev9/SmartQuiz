// ============================================================
// Smart Quiz — Request Validator Middleware
// Zod-based validation for API requests
// ============================================================

import { z } from 'zod';
import { QUIZ_DEFAULTS } from '../types';

export const generateQuizSchema = z.object({
  text: z
    .string()
    .min(
      QUIZ_DEFAULTS.MIN_TEXT_LENGTH,
      `Đoạn văn quá ngắn. Cần ít nhất ${QUIZ_DEFAULTS.MIN_TEXT_LENGTH} ký tự.`
    )
    .max(
      QUIZ_DEFAULTS.MAX_TEXT_LENGTH,
      `Đoạn văn quá dài. Tối đa ${QUIZ_DEFAULTS.MAX_TEXT_LENGTH} ký tự.`
    ),
  numQuestions: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(QUIZ_DEFAULTS.NUM_QUESTIONS)
    .optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  pageTitle: z.string().max(500).optional(),
});

export const generateSummarySchema = z.object({
  text: z
    .string()
    .min(
      QUIZ_DEFAULTS.MIN_TEXT_LENGTH,
      `Đoạn văn quá ngắn. Cần ít nhất ${QUIZ_DEFAULTS.MIN_TEXT_LENGTH} ký tự.`
    )
    .max(
      QUIZ_DEFAULTS.MAX_TEXT_LENGTH,
      `Đoạn văn quá dài. Tối đa ${QUIZ_DEFAULTS.MAX_TEXT_LENGTH} ký tự.`
    ),
  format: z.enum(['bullets', 'flashcards', 'both']).default('both'),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  pageTitle: z.string().max(500).optional(),
});

/**
 * Parse and validate request body against a Zod schema
 */
export function validateRequest<T>(
  body: string | null | undefined,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  if (!body) {
    return { success: false, error: 'Request body is required' };
  }

  try {
    const parsed = JSON.parse(body);
    const result = schema.safeParse(parsed);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return {
        success: false,
        error: firstError?.message || 'Invalid request data',
      };
    }

    return { success: true, data: result.data };
  } catch {
    return { success: false, error: 'Invalid JSON in request body' };
  }
}
