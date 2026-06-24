// ============================================================
// Smart Quiz — Internationalization (i18n)
// Lightweight i18n system for Chrome Extension
// ============================================================

export type Locale = 'vi' | 'en';

export interface Translations {
  // App
  appName: string;
  appTagline: string;

  // Tabs
  tabQuiz: string;
  tabSummary: string;
  tabHistory: string;

  // Theme
  switchToLight: string;
  switchToDark: string;

  // Idle State
  idleQuizTitle: string;
  idleSummaryTitle: string;
  idleInstruction: string;
  idleQuizAction: string;
  idleSummaryAction: string;
  idleWaiting: string;

  // Loading
  loadingQuizTitle: string;
  loadingSummaryTitle: string;
  loadingQuizSubtitle: string;
  loadingSummarySubtitle: string;
  loadingPreview: string;
  loadingStep1: string;
  loadingStep2Quiz: string;
  loadingStep2Summary: string;
  loadingStep3: string;

  // Quiz
  quizQuestion: string;
  quizSubmit: string;
  quizNext: string;
  quizPrevious: string;
  quizFinish: string;
  quizCheckAnswer: string;
  quizExplanation: string;
  quizScore: string;
  quizScoreGreat: string;
  quizScoreGood: string;
  quizScorePoor: string;
  quizNewQuiz: string;
  quizRetry: string;
  quizCorrect: string;
  quizIncorrect: string;

  // Summary
  summaryBullets: string;
  summaryFlashcards: string;
  summaryClickToFlip: string;
  summaryFront: string;
  summaryBack: string;
  summaryNoBullets: string;
  summaryNoFlashcards: string;
  summaryNewSummary: string;

  // History
  historyTitle: string;
  historyEmpty: string;
  historyEmptySubtitle: string;
  historyQuizzes: string;
  historySummaries: string;
  historyQuestions: string;
  historyFrom: string;
  historyViewQuiz: string;
  historyViewSummary: string;

  // Error
  errorTitle: string;
  errorDefault: string;
  errorRetry: string;
  errorGoBack: string;

  // General
  of: string;
  source: string;
}

// Vietnamese (default)
export const vi: Translations = {
  appName: 'Smart Quiz',
  appTagline: 'AI-Powered Learning',

  tabQuiz: 'Quiz',
  tabSummary: 'Tóm tắt',
  tabHistory: 'Lịch sử',

  switchToLight: 'Chuyển sang Light Mode',
  switchToDark: 'Chuyển sang Dark Mode',

  idleQuizTitle: 'Sẵn sàng tạo Quiz!',
  idleSummaryTitle: 'Sẵn sàng Tóm tắt!',
  idleInstruction: 'Bôi đen đoạn văn bản trên trang web, nhấn chuột phải và chọn',
  idleQuizAction: '"Tạo Quiz từ đoạn này"',
  idleSummaryAction: '"Tóm tắt đoạn này"',
  idleWaiting: 'Đang chờ lệnh...',

  loadingQuizTitle: 'Đang tạo Quiz...',
  loadingSummaryTitle: 'Đang tóm tắt...',
  loadingQuizSubtitle: 'AI đang phân tích và tạo câu hỏi',
  loadingSummarySubtitle: 'AI đang phân tích và tóm tắt nội dung',
  loadingPreview: 'Đoạn văn đang xử lý',
  loadingStep1: 'Phân tích nội dung',
  loadingStep2Quiz: 'Tạo câu hỏi trắc nghiệm',
  loadingStep2Summary: 'Tạo bản tóm tắt',
  loadingStep3: 'Hoàn thiện kết quả',

  quizQuestion: 'Câu hỏi',
  quizSubmit: 'Nộp bài',
  quizNext: 'Câu tiếp',
  quizPrevious: 'Câu trước',
  quizFinish: 'Xem kết quả',
  quizCheckAnswer: 'Kiểm tra',
  quizExplanation: 'Giải thích',
  quizScore: 'Điểm số',
  quizScoreGreat: 'Xuất sắc! 🎉',
  quizScoreGood: 'Khá tốt! 👍',
  quizScorePoor: 'Cần cố gắng thêm! 💪',
  quizNewQuiz: 'Tạo Quiz mới',
  quizRetry: 'Làm lại',
  quizCorrect: 'Đúng',
  quizIncorrect: 'Sai',

  summaryBullets: 'Điểm chính',
  summaryFlashcards: 'Flashcards',
  summaryClickToFlip: 'Nhấn để lật thẻ',
  summaryFront: 'Mặt trước',
  summaryBack: 'Mặt sau',
  summaryNoBullets: 'Không có điểm chính nào.',
  summaryNoFlashcards: 'Không có flashcard nào.',
  summaryNewSummary: 'Tóm tắt mới',

  historyTitle: 'Lịch sử',
  historyEmpty: 'Chưa có lịch sử',
  historyEmptySubtitle: 'Tạo quiz hoặc tóm tắt đầu tiên để bắt đầu!',
  historyQuizzes: 'Quizzes',
  historySummaries: 'Tóm tắt',
  historyQuestions: 'câu hỏi',
  historyFrom: 'Từ',
  historyViewQuiz: 'Xem Quiz',
  historyViewSummary: 'Xem Tóm tắt',

  errorTitle: 'Có lỗi xảy ra',
  errorDefault: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
  errorRetry: 'Thử lại',
  errorGoBack: 'Quay lại',

  of: 'trên',
  source: 'Nguồn',
};

// English
export const en: Translations = {
  appName: 'Smart Quiz',
  appTagline: 'AI-Powered Learning',

  tabQuiz: 'Quiz',
  tabSummary: 'Summary',
  tabHistory: 'History',

  switchToLight: 'Switch to Light Mode',
  switchToDark: 'Switch to Dark Mode',

  idleQuizTitle: 'Ready to Quiz!',
  idleSummaryTitle: 'Ready to Summarize!',
  idleInstruction: 'Highlight text on any webpage, right-click and select',
  idleQuizAction: '"Create Quiz from this"',
  idleSummaryAction: '"Summarize this"',
  idleWaiting: 'Waiting for input...',

  loadingQuizTitle: 'Generating Quiz...',
  loadingSummaryTitle: 'Summarizing...',
  loadingQuizSubtitle: 'AI is analyzing and creating questions',
  loadingSummarySubtitle: 'AI is analyzing and summarizing content',
  loadingPreview: 'Processing text',
  loadingStep1: 'Analyzing content',
  loadingStep2Quiz: 'Creating quiz questions',
  loadingStep2Summary: 'Generating summary',
  loadingStep3: 'Finalizing results',

  quizQuestion: 'Question',
  quizSubmit: 'Submit',
  quizNext: 'Next',
  quizPrevious: 'Previous',
  quizFinish: 'See Results',
  quizCheckAnswer: 'Check',
  quizExplanation: 'Explanation',
  quizScore: 'Score',
  quizScoreGreat: 'Excellent! 🎉',
  quizScoreGood: 'Good job! 👍',
  quizScorePoor: 'Keep trying! 💪',
  quizNewQuiz: 'New Quiz',
  quizRetry: 'Retry',
  quizCorrect: 'Correct',
  quizIncorrect: 'Incorrect',

  summaryBullets: 'Key Points',
  summaryFlashcards: 'Flashcards',
  summaryClickToFlip: 'Click to flip',
  summaryFront: 'Front',
  summaryBack: 'Back',
  summaryNoBullets: 'No key points available.',
  summaryNoFlashcards: 'No flashcards available.',
  summaryNewSummary: 'New Summary',

  historyTitle: 'History',
  historyEmpty: 'No history yet',
  historyEmptySubtitle: 'Create your first quiz or summary to get started!',
  historyQuizzes: 'Quizzes',
  historySummaries: 'Summaries',
  historyQuestions: 'questions',
  historyFrom: 'From',
  historyViewQuiz: 'View Quiz',
  historyViewSummary: 'View Summary',

  errorTitle: 'Something went wrong',
  errorDefault: 'An unknown error occurred. Please try again.',
  errorRetry: 'Try Again',
  errorGoBack: 'Go Back',

  of: 'of',
  source: 'Source',
};

// Locale map
const locales: Record<Locale, Translations> = { vi, en };

export function getTranslations(locale: Locale): Translations {
  return locales[locale] || vi;
}

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];
