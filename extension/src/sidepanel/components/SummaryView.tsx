// ============================================================
// Smart Quiz — Summary View Component
// Displays bullet points and flashcards from AI summary
// ============================================================

import { useState } from 'react';
import type { Summary } from '@shared/types';
import { useI18n } from '../useI18n';

interface SummaryViewProps {
  summary: Summary;
  onReset: () => void;
}

type ViewMode = 'bullets' | 'flashcards';

export default function SummaryView({ summary, onReset }: SummaryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('bullets');
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const text = summary.bulletPoints.map((bp) => `• ${bp}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      {/* Source info */}
      {summary.pageTitle && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-bg-glass border border-border text-xs text-text-muted truncate">
          📄 {summary.pageTitle}
        </div>
      )}

      {/* View mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="tab-nav flex-1">
          <button
            className={`tab-btn ${viewMode === 'bullets' ? 'tab-btn--active' : ''}`}
            onClick={() => setViewMode('bullets')}
          >
            📋 {t.summaryBullets}
          </button>
          <button
            className={`tab-btn ${viewMode === 'flashcards' ? 'tab-btn--active' : ''}`}
            onClick={() => setViewMode('flashcards')}
            disabled={summary.flashcards.length === 0}
            style={{ opacity: summary.flashcards.length === 0 ? 0.4 : 1 }}
          >
            🃏 {t.summaryFlashcards}
          </button>
        </div>
      </div>

      {/* Bullet Points View */}
      {viewMode === 'bullets' && (
        <div>
          <div className="glass-card p-4">
            <ul className="space-y-3">
              {summary.bulletPoints.map((point, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2.5 animate-slide-in stagger-${Math.min(index + 1, 5)}`}
                >
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent-primary mt-2" />
                  <span className="text-sm text-text-primary leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Copy button */}
          <button
            className="btn-secondary w-full mt-3 justify-center"
            onClick={handleCopy}
          >
            {copied ? '✅ Copied!' : `📋 Copy`}
          </button>
        </div>
      )}

      {/* Flashcards View */}
      {viewMode === 'flashcards' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted text-center mb-2">
            {t.summaryClickToFlip}
          </p>
          {summary.flashcards.map((card, index) => (
            <div
              key={index}
              className={`flashcard ${flippedCards.has(index) ? 'flashcard--flipped' : ''} animate-fade-in stagger-${Math.min(index + 1, 5)}`}
              onClick={() => toggleFlip(index)}
            >
              <div className="flashcard__inner">
                <div className="flashcard__face flashcard__front">
                  <div>
                    <div className="text-xs text-accent-secondary font-semibold mb-2">
                      {t.summaryFront} {index + 1}
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      {card.front}
                    </p>
                  </div>
                </div>
                <div className="flashcard__face flashcard__back">
                  <div>
                    <div className="text-xs text-accent-primary font-semibold mb-2">
                      {t.summaryBack}
                    </div>
                    <p className="text-sm text-text-primary">{card.back}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 pb-4">
        <button className="btn-primary w-full justify-center" onClick={onReset}>
          ✨ {t.summaryNewSummary}
        </button>
      </div>
    </div>
  );
}
