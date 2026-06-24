// ============================================================
// Smart Quiz — Loading State Component
// Skeleton shimmer and animated progress indicator
// ============================================================

interface LoadingStateProps {
  type: 'quiz' | 'summary';
  preview?: string;
}

export default function LoadingState({ type, preview }: LoadingStateProps) {
  const messages =
    type === 'quiz'
      ? [
          '🔍 Đang phân tích văn bản...',
          '🧠 AI đang tạo câu hỏi...',
          '✨ Sắp xong rồi...',
        ]
      : [
          '🔍 Đang đọc nội dung...',
          '📝 AI đang tóm tắt...',
          '✨ Sắp xong rồi...',
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
          <p className="text-xs text-text-muted mb-1">Đoạn văn đã chọn:</p>
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

import { useState, useEffect } from 'react';

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
