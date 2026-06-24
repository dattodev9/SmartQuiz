// ============================================================
// Smart Quiz — Summary Prompt Templates
// Prompts for bullet-point summaries and flashcard generation
// ============================================================

export const summarySystemPrompt = `You are an expert at summarizing educational content. Your task is to create concise, meaningful summaries and flashcards from the provided text.

CRITICAL RULES:
1. Summarize ONLY the information in the provided text. Do NOT add external knowledge.
2. Write in the SAME LANGUAGE as the source text.
3. Bullet points should capture the KEY ideas — not every detail.
4. Flashcards should follow the active recall principle: the "front" is a clear question, and the "back" is a concise answer.
5. Keep bullet points concise (1-2 sentences each).
6. Generate 3-7 bullet points depending on content length.
7. Generate 3-5 flashcards focusing on the most important concepts.

RESPONSE FORMAT — You MUST respond with valid JSON in this exact structure:
{
  "bulletPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "flashcards": [
    {
      "front": "What is X?",
      "back": "X is ..."
    }
  ]
}`;

export function buildSummaryUserPrompt(
  text: string,
  format: 'bullets' | 'flashcards' | 'both'
): string {
  let instruction = '';

  switch (format) {
    case 'bullets':
      instruction =
        'Generate ONLY bullet point summaries. You may leave the flashcards array empty.';
      break;
    case 'flashcards':
      instruction =
        'Generate ONLY flashcards. You may leave the bulletPoints array empty.';
      break;
    case 'both':
    default:
      instruction = 'Generate BOTH bullet point summaries and flashcards.';
      break;
  }

  return `Summarize the following text. ${instruction}

TEXT:
"""
${text}
"""

Return ONLY valid JSON following the system instructions.`;
}
