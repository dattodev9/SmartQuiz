// ============================================================
// Smart Quiz — AI Service (Google Gemini Integration)
// Generates quizzes and summaries using Gemini 2.0 Flash
// Includes DEMO MODE for development without API credits
// ============================================================

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { quizSystemPrompt, buildQuizUserPrompt } from '../prompts/quizPrompt';
import { summarySystemPrompt, buildSummaryUserPrompt } from '../prompts/summaryPrompt';
import type { QuizQuestion, Flashcard } from '../types';

// Check if demo mode is enabled
const isDemoMode = (): boolean => {
  return process.env.DEMO_MODE === 'true' || !process.env.GEMINI_API_KEY;
};

// Initialize Gemini client outside handler for container reuse
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });
  }
  return model;
}

/**
 * Generate quiz questions from text using Gemini (or demo data)
 */
export async function generateQuiz(
  text: string,
  numQuestions: number = 5
): Promise<QuizQuestion[]> {
  if (isDemoMode()) {
    console.log('[AI Service] DEMO MODE — returning mock quiz data');
    return generateDemoQuiz(text, numQuestions);
  }

  const gemini = getModel();

  const result = await gemini.generateContent([
    { text: quizSystemPrompt },
    { text: buildQuizUserPrompt(text, numQuestions) },
  ]);

  const response = result.response;
  const jsonText = response.text();

  try {
    const parsed = JSON.parse(jsonText);

    // Handle both { questions: [...] } and direct array format
    const questions: QuizQuestion[] = Array.isArray(parsed)
      ? parsed
      : parsed.questions || [];

    // Validate structure
    return questions.map((q: any, index: number) => ({
      id: q.id || `q-${index + 1}`,
      question: String(q.question || ''),
      options: {
        A: String(q.options?.A || q.options?.a || ''),
        B: String(q.options?.B || q.options?.b || ''),
        C: String(q.options?.C || q.options?.c || ''),
        D: String(q.options?.D || q.options?.d || ''),
      },
      correctAnswer: validateAnswer(q.correctAnswer || q.correct_answer),
      explanation: String(q.explanation || ''),
    }));
  } catch (error) {
    console.error('[AI Service] Failed to parse quiz response:', jsonText);
    throw new Error('AI returned invalid quiz format');
  }
}

/**
 * Generate summary from text using Gemini (or demo data)
 */
export async function generateSummary(
  text: string,
  format: 'bullets' | 'flashcards' | 'both' = 'both'
): Promise<{ bulletPoints: string[]; flashcards: Flashcard[] }> {
  if (isDemoMode()) {
    console.log('[AI Service] DEMO MODE — returning mock summary data');
    return generateDemoSummary(text);
  }

  const gemini = getModel();

  const result = await gemini.generateContent([
    { text: summarySystemPrompt },
    { text: buildSummaryUserPrompt(text, format) },
  ]);

  const response = result.response;
  const jsonText = response.text();

  try {
    const parsed = JSON.parse(jsonText);

    return {
      bulletPoints: Array.isArray(parsed.bulletPoints || parsed.bullet_points)
        ? (parsed.bulletPoints || parsed.bullet_points).map(String)
        : [],
      flashcards: Array.isArray(parsed.flashcards)
        ? parsed.flashcards.map((fc: any) => ({
            front: String(fc.front || ''),
            back: String(fc.back || ''),
          }))
        : [],
    };
  } catch (error) {
    console.error('[AI Service] Failed to parse summary response:', jsonText);
    throw new Error('AI returned invalid summary format');
  }
}

// --- Helpers ---

function validateAnswer(answer: unknown): 'A' | 'B' | 'C' | 'D' {
  const normalized = String(answer).toUpperCase().trim();
  if (['A', 'B', 'C', 'D'].includes(normalized)) {
    return normalized as 'A' | 'B' | 'C' | 'D';
  }
  return 'A'; // fallback
}

// ============================================================
// DEMO MODE — Mock Data Generators
// Returns realistic quiz/summary data based on the source text
// ============================================================

function generateDemoQuiz(text: string, numQuestions: number): QuizQuestion[] {
  // Extract some words from the text for realistic-looking questions
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < Math.min(numQuestions, 5); i++) {
    const sentenceIndex = i % Math.max(sentences.length, 1);
    const sentence = sentences[sentenceIndex]?.trim() || text.substring(0, 100);

    questions.push({
      id: `q-${i + 1}`,
      question: `[DEMO] Theo đoạn văn, nội dung nào sau đây liên quan đến: "${sentence.substring(0, 60)}..."?`,
      options: {
        A: `Đây là nội dung chính được đề cập trong đoạn văn`,
        B: `Đây là ý phụ hỗ trợ cho luận điểm chính`,
        C: `Nội dung này không được đề cập trong đoạn văn`,
        D: `Đoạn văn đề cập vấn đề này nhưng với góc nhìn khác`,
      },
      correctAnswer: (['A', 'B', 'C', 'D'] as const)[i % 4],
      explanation: `[DEMO] Đây là dữ liệu demo. Khi bạn cấu hình Gemini API key, hệ thống sẽ tạo câu hỏi thực từ AI dựa trên nội dung đoạn văn bạn chọn.`,
    });
  }

  return questions;
}

function generateDemoSummary(text: string): { bulletPoints: string[]; flashcards: Flashcard[] } {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 15);

  const bulletPoints = sentences
    .slice(0, Math.min(5, sentences.length))
    .map((s, i) => `[DEMO] Điểm chính ${i + 1}: ${s.trim().substring(0, 120)}`);

  if (bulletPoints.length === 0) {
    bulletPoints.push('[DEMO] Đoạn văn này quá ngắn để tóm tắt chi tiết.');
  }

  const flashcards: Flashcard[] = sentences
    .slice(0, Math.min(3, sentences.length))
    .map((s, i) => ({
      front: `[DEMO] Câu hỏi ${i + 1}: Nội dung chính của ý này là gì?`,
      back: `[DEMO] ${s.trim().substring(0, 150)}`,
    }));

  if (flashcards.length === 0) {
    flashcards.push({
      front: '[DEMO] Đoạn văn nói về điều gì?',
      back: `[DEMO] ${text.substring(0, 150)}...`,
    });
  }

  return { bulletPoints, flashcards };
}
