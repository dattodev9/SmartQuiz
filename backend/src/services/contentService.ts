// ============================================================
// Smart Quiz — Content Processing Service
// Text preprocessing, cleaning, and chunking
// ============================================================

import { QUIZ_DEFAULTS } from '../types';

/**
 * Preprocess and clean raw text before sending to AI
 */
export function preprocessText(rawText: string): string {
  let text = rawText;

  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ');

  // Remove common web artifacts
  text = text.replace(/\[.*?\]/g, ''); // Remove [brackets] like citation markers
  text = text.replace(/\{.*?\}/g, ''); // Remove {braces}
  text = text.replace(/<[^>]*>/g, ''); // Remove any HTML tags
  text = text.replace(/https?:\/\/\S+/g, ''); // Remove URLs
  text = text.replace(/\b(Advertisement|Sponsored|Share|Tweet|Pin)\b/gi, ''); // Remove social buttons text

  // Normalize quotes
  text = text.replace(/[""]/g, '"');
  text = text.replace(/['']/g, "'");

  // Collapse multiple periods, dashes
  text = text.replace(/\.{3,}/g, '...');
  text = text.replace(/-{3,}/g, '---');

  // Remove leading/trailing whitespace
  text = text.trim();

  return text;
}

/**
 * Validate text length
 */
export function validateTextLength(text: string): {
  valid: boolean;
  error?: string;
  errorCode?: string;
} {
  if (text.length < QUIZ_DEFAULTS.MIN_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text is too short (${text.length} chars). Minimum is ${QUIZ_DEFAULTS.MIN_TEXT_LENGTH} characters.`,
      errorCode: 'TEXT_TOO_SHORT',
    };
  }

  if (text.length > QUIZ_DEFAULTS.MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text is too long (${text.length} chars). Maximum is ${QUIZ_DEFAULTS.MAX_TEXT_LENGTH} characters.`,
      errorCode: 'TEXT_TOO_LONG',
    };
  }

  return { valid: true };
}

/**
 * Chunk long text into manageable pieces
 * Used when text exceeds AI model context limits
 */
export function chunkText(text: string, maxChunkSize: number = 8000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Extract a meaningful title/preview from text
 */
export function extractPreview(text: string, maxLength: number = 100): string {
  const preview = text.substring(0, maxLength);
  const lastSpace = preview.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return preview.substring(0, lastSpace) + '...';
  }

  return preview + '...';
}
