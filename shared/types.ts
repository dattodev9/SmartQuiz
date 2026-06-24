// ============================================================
// Smart Quiz — Shared Types
// Used by both Chrome Extension (client) and Backend (server)
// ============================================================

// --- Quiz Types ---

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizSet {
  id: string;
  userId: string;
  sourceText: string;
  sourceUrl?: string;
  pageTitle?: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

// --- Summary Types ---

export interface Flashcard {
  front: string;
  back: string;
}

export interface Summary {
  id: string;
  userId: string;
  sourceText: string;
  sourceUrl?: string;
  pageTitle?: string;
  bulletPoints: string[];
  flashcards: Flashcard[];
  createdAt: string;
}

// --- API Request/Response Types ---

export interface GenerateQuizRequest {
  text: string;
  numQuestions?: number;
  sourceUrl?: string;
  pageTitle?: string;
}

export interface GenerateQuizResponse {
  success: boolean;
  data?: QuizSet;
  error?: string;
}

export interface GenerateSummaryRequest {
  text: string;
  format: 'bullets' | 'flashcards' | 'both';
  sourceUrl?: string;
  pageTitle?: string;
}

export interface GenerateSummaryResponse {
  success: boolean;
  data?: Summary;
  error?: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: {
    quizzes: QuizSet[];
    summaries: Summary[];
  };
  error?: string;
}

export interface SubmitQuizRequest {
  quizId: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
}

export interface SubmitQuizResponse {
  success: boolean;
  data?: {
    score: number;
    totalQuestions: number;
    results: {
      questionId: string;
      userAnswer: 'A' | 'B' | 'C' | 'D';
      correctAnswer: 'A' | 'B' | 'C' | 'D';
      isCorrect: boolean;
    }[];
  };
  error?: string;
}

// --- Chrome Extension Message Types ---

export enum MessageType {
  // Content Script → Background
  TEXT_SELECTED = 'TEXT_SELECTED',
  GET_SELECTION = 'GET_SELECTION',

  // Background → Side Panel
  QUIZ_LOADING = 'QUIZ_LOADING',
  QUIZ_READY = 'QUIZ_READY',
  QUIZ_ERROR = 'QUIZ_ERROR',
  SUMMARY_LOADING = 'SUMMARY_LOADING',
  SUMMARY_READY = 'SUMMARY_READY',
  SUMMARY_ERROR = 'SUMMARY_ERROR',

  // Side Panel → Background
  REQUEST_HISTORY = 'REQUEST_HISTORY',
  SUBMIT_QUIZ = 'SUBMIT_QUIZ',

  // General
  OPEN_SIDE_PANEL = 'OPEN_SIDE_PANEL',
}

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

// --- History Item (unified view) ---

export type HistoryItemType = 'quiz' | 'summary';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  sourceUrl?: string;
  preview: string;
  score?: number;
  totalQuestions?: number;
  createdAt: string;
}

// --- Error Codes ---

export enum ErrorCode {
  TEXT_TOO_SHORT = 'TEXT_TOO_SHORT',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.TEXT_TOO_SHORT]: 'Đoạn văn này quá ngắn để xử lý. Hãy chọn đoạn dài hơn (ít nhất 100 ký tự) nhé!',
  [ErrorCode.TEXT_TOO_LONG]: 'Đoạn văn này quá dài. Hãy chọn đoạn ngắn hơn (tối đa 10,000 ký tự) nhé!',
  [ErrorCode.AI_GENERATION_FAILED]: 'AI không thể xử lý đoạn văn này. Hãy thử lại hoặc chọn đoạn khác.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.',
  [ErrorCode.INVALID_REQUEST]: 'Yêu cầu không hợp lệ. Vui lòng thử lại.',
  [ErrorCode.NOT_FOUND]: 'Không tìm thấy dữ liệu yêu cầu.',
  [ErrorCode.INTERNAL_ERROR]: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  [ErrorCode.UNAUTHORIZED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
};

// --- Constants ---

export const QUIZ_DEFAULTS = {
  NUM_QUESTIONS: 5,
  MIN_TEXT_LENGTH: 100,
  MAX_TEXT_LENGTH: 10000,
} as const;

export const API_ENDPOINTS = {
  GENERATE_QUIZ: '/api/v1/quizzes/generate',
  GENERATE_SUMMARY: '/api/v1/summaries/generate',
  GET_HISTORY: '/api/v1/history',
  GET_QUIZ: '/api/v1/quizzes',
  HEALTH: '/api/v1/health',
} as const;
