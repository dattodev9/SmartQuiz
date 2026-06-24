// ============================================================
// Smart Quiz — Quiz View Component
// Interactive quiz interface with real-time scoring
// ============================================================

import { useState, useMemo } from 'react';
import type { QuizSet } from '@shared/types';
import QuizCard from './QuizCard';
import { MessageType } from '@shared/types';
import { useI18n } from '../useI18n';

interface QuizViewProps {
  quiz: QuizSet;
  onReset: () => void;
}

export default function QuizView({ quiz, onReset }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [submitted, setSubmitted] = useState(false);
  const { t } = useI18n();

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Calculate results
  const results = useMemo(() => {
    if (!submitted) return null;

    let correct = 0;
    const details = quiz.questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      return { questionId: q.id, userAnswer, isCorrect };
    });

    return { score: correct, total: totalQuestions, details };
  }, [submitted, answers, quiz.questions, totalQuestions]);

  const handleAnswer = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setCurrentIndex(0);

    // Save score to background
    const score = quiz.questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;

    chrome.runtime.sendMessage({
      type: MessageType.SUBMIT_QUIZ,
      payload: { quizId: quiz.id, score },
    });
  };

  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount === totalQuestions && !submitted;

  // Score display after submission
  if (submitted && results) {
    const percentage = Math.round((results.score / results.total) * 100);
    const scoreClass =
      percentage >= 80
        ? 'score-circle--great'
        : percentage >= 50
        ? 'score-circle--good'
        : 'score-circle--poor';

    return (
      <div className="animate-fade-in">
        {/* Score Summary */}
        <div className="flex flex-col items-center py-6">
          <div className={`score-circle ${scoreClass}`}>
            <span className="text-3xl font-bold">{results.score}/{results.total}</span>
            <span className="text-xs text-text-secondary mt-1">{percentage}%</span>
          </div>
          <h2 className="text-lg font-bold mt-4 text-text-primary">
            {percentage >= 80
              ? t.quizScoreGreat
              : percentage >= 50
              ? t.quizScoreGood
              : t.quizScorePoor}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {results.score}/{results.total} {t.quizCorrect}
          </p>
        </div>

        {/* Review all questions */}
        <div className="space-y-4 mt-2">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            {t.quizExplanation}
          </h3>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className={`animate-fade-in stagger-${index + 1}`}>
              <QuizCard
                question={question}
                index={index}
                total={totalQuestions}
                selectedAnswer={answers[question.id]}
                isSubmitted={true}
                onSelect={() => {}}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pb-4">
          <button className="btn-secondary flex-1" onClick={onReset}>
            ✨ {t.quizNewQuiz}
          </button>
          <button
            className="btn-primary flex-1"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setCurrentIndex(0);
            }}
          >
            🔄 {t.quizRetry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Source info */}
      {quiz.pageTitle && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-bg-glass border border-border text-xs text-text-muted truncate">
          📄 {quiz.pageTitle}
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-text-secondary">
            {t.quizQuestion} {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs text-text-muted">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <QuizCard
        question={currentQuestion}
        index={currentIndex}
        total={totalQuestions}
        selectedAnswer={answers[currentQuestion.id]}
        isSubmitted={false}
        onSelect={(answer) => handleAnswer(currentQuestion.id, answer)}
      />

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-4">
        <button
          className="btn-secondary flex-1"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
        >
          ← {t.quizPrevious}
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button className="btn-primary flex-1" onClick={handleNext}>
            {t.quizNext} →
          </button>
        ) : (
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            ✅ {t.quizSubmit}
          </button>
        )}
      </div>

      {/* Quick nav dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className="w-2.5 h-2.5 rounded-full transition-all duration-200"
            style={{
              background:
                i === currentIndex
                  ? 'var(--color-accent-primary)'
                  : answers[q.id]
                  ? 'var(--color-accent-secondary)'
                  : 'var(--color-bg-glass)',
              border: '1px solid var(--color-border)',
              transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
            }}
            title={`${t.quizQuestion} ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
