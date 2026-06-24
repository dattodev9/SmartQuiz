// ============================================================
// Smart Quiz — Loading State Component
// Skeleton shimmer and animated progress indicator
// ============================================================

import { useState, useEffect } from 'react';
import { useI18n } from '../useI18n';

interface LoadingStateProps {
  type: 'quiz' | 'summary';
  preview?: string;
}

export default function LoadingState({ type, preview }: LoadingStateProps) {
  const { t } = useI18n();

  const messages =
    type === 'quiz'
      ? [
          `🔍 ${t.loadingStep1}...`,
          `🧠 ${t.loadingStep2Quiz}...`,
          `✨ ${t.loadingStep3}...`,
        ]
      : [
          `🔍 ${t.loadingStep1}...`,
          `📝 ${t.loadingStep2Summary}...`,
          `✨ ${t.loadingStep3}...`,
        ];

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      {/* Animated Brain Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-bg-glass border-2 border-accent-primary/30 flex items-center justify-center animate-pulse-glow">
          <span className="text-3xl">{type === 'quiz' ? '🧠' : '📝'}</span>
        </div>
        {/* Spinner ring */}
        <div
          className="absolute inset-[-4px] rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: 'var(--color-accent-primary)',
            borderRightColor: 'var(--color-accent-secondary)',
          }}
        />
      </div>

      {/* Animated message cycling */}
      <div className="text-center mb-6">
        <LoadingMessages messages={messages} />
      </div>

      {/* Preview of selected text */}
      {preview && (
        <div className="w-full max-w-[280px] px-4 py-3 rounded-lg bg-bg-glass border border-border">
          <p className="text-xs text-text-muted mb-1">{t.loadingPreview}:</p>
          <p className="text-xs text-text-secondary italic line-clamp-3 leading-relaxed">
            "{preview}"
          </p>
        </div>
      )}

      {/* Skeleton cards */}
      <div className="w-full mt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg animate-shimmer"
            style={{
              height: type === 'quiz' ? '80px' : '48px',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// --- Loading Messages (cycling) ---

function LoadingMessages({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <p className="text-sm text-text-secondary font-medium transition-opacity duration-300">
      {messages[index]}
    </p>
  );
}
