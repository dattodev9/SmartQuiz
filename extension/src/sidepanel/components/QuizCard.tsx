// ============================================================
// Smart Quiz — Quiz Card Component
// Individual question card with option selection and feedback
// ============================================================

import type { QuizQuestion } from '@shared/types';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  isSubmitted: boolean;
  onSelect: (answer: 'A' | 'B' | 'C' | 'D') => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

export default function QuizCard({
  question,
  index,
  selectedAnswer,
  isSubmitted,
  onSelect,
}: QuizCardProps) {
  const getOptionClass = (key: 'A' | 'B' | 'C' | 'D') => {
    const base = 'quiz-option';
    const classes = [base];

    if (isSubmitted) {
      classes.push('quiz-option--disabled');
      if (key === question.correctAnswer) {
        classes.push('quiz-option--correct');
      } else if (key === selectedAnswer && key !== question.correctAnswer) {
        classes.push('quiz-option--incorrect');
      }
    } else {
      if (key === selectedAnswer) {
        classes.push('quiz-option--selected');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="glass-card p-4 animate-slide-in">
      {/* Question */}
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs font-bold text-accent-primary bg-accent-glow px-2 py-0.5 rounded-full">
            Q{index + 1}
          </span>
          <p className="text-sm font-medium text-text-primary leading-relaxed">
            {question.question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {OPTION_KEYS.map((key) => (
          <div
            key={key}
            className={getOptionClass(key)}
            onClick={() => !isSubmitted && onSelect(key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                !isSubmitted && onSelect(key);
              }
            }}
          >
            <span className="quiz-option__label">
              {isSubmitted && key === question.correctAnswer
                ? '✓'
                : isSubmitted && key === selectedAnswer && key !== question.correctAnswer
                ? '✗'
                : key}
            </span>
            <span className="text-sm text-text-primary leading-snug flex-1">
              {question.options[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Explanation (shown after submission) */}
      {isSubmitted && (
        <div className="mt-4 p-3 rounded-lg bg-bg-glass border border-border animate-fade-in">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">💡</span>
            <span className="text-xs font-semibold text-accent-secondary uppercase tracking-wider">
              Giải thích
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
