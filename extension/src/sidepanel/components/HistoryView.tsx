// ============================================================
// Smart Quiz — History View Component
// Browse past quizzes and summaries
// ============================================================

import { useState, useEffect } from 'react';
import type { QuizSet, Summary } from '@shared/types';
import { MessageType } from '@shared/types';
import { useI18n } from '../useI18n';

interface HistoryViewProps {
  onLoadQuiz: (quiz: QuizSet) => void;
  onLoadSummary: (summary: Summary) => void;
}

type HistoryFilter = 'all' | 'quiz' | 'summary';

interface HistoryEntry {
  type: 'quiz' | 'summary';
  data: QuizSet | Summary;
  title: string;
  preview: string;
  date: string;
  score?: string;
}

export default function HistoryView({ onLoadQuiz, onLoadSummary }: HistoryViewProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale, t } = useI18n();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.REQUEST_HISTORY,
      }) as { quizzes: QuizSet[]; summaries: Summary[] };

      const quizEntries: HistoryEntry[] = (response.quizzes || []).map((q) => ({
        type: 'quiz' as const,
        data: q,
        title: q.pageTitle || 'Quiz',
        preview: q.sourceText.substring(0, 100) + '...',
        date: formatDate(q.createdAt, locale),
        score: q.score !== undefined ? `${q.score}/${q.totalQuestions}` : undefined,
      }));

      const summaryEntries: HistoryEntry[] = (response.summaries || []).map((s) => ({
        type: 'summary' as const,
        data: s,
        title: s.pageTitle || t.tabSummary,
        preview: s.bulletPoints[0] || s.sourceText.substring(0, 100) + '...',
        date: formatDate(s.createdAt, locale),
      }));

      // Merge and sort by date (newest first)
      const all = [...quizEntries, ...summaryEntries].sort(
        (a, b) =>
          new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
      );

      setEntries(all);
    } catch (error) {
      console.error('[Smart Quiz] Failed to load history:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

  const handleClick = (entry: HistoryEntry) => {
    if (entry.type === 'quiz') {
      onLoadQuiz(entry.data as QuizSet);
    } else {
      onLoadSummary(entry.data as Summary);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Filter */}
      <div className="tab-nav mb-4">
        <button
          className={`tab-btn ${filter === 'all' ? 'tab-btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.historyTitle}
        </button>
        <button
          className={`tab-btn ${filter === 'quiz' ? 'tab-btn--active' : ''}`}
          onClick={() => setFilter('quiz')}
        >
          🎯 {t.historyQuizzes}
        </button>
        <button
          className={`tab-btn ${filter === 'summary' ? 'tab-btn--active' : ''}`}
          onClick={() => setFilter('summary')}
        >
          📝 {t.historySummaries}
        </button>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📭</span>
          <p className="text-sm text-text-secondary">
            {t.historyEmpty}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {t.historyEmptySubtitle}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEntries.map((entry, index) => (
            <button
              key={`${entry.type}-${(entry.data as any).id}-${index}`}
              className={`glass-card w-full text-left p-3.5 cursor-pointer animate-slide-in stagger-${Math.min(index + 1, 5)}`}
              onClick={() => handleClick(entry)}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm flex-shrink-0">
                    {entry.type === 'quiz' ? '🎯' : '📝'}
                  </span>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {entry.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.score && (
                    <span className="text-xs font-semibold text-accent-secondary bg-accent-secondary/10 px-2 py-0.5 rounded-full">
                      {entry.score}
                    </span>
                  )}
                  <span className="text-xs text-text-muted">{entry.date}</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {entry.preview}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Refresh */}
      <button
        className="btn-secondary w-full mt-4 justify-center"
        onClick={loadHistory}
      >
        🔄 Refresh
      </button>
    </div>
  );
}

// --- Helpers ---

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'vi') {
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
  } else {
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  return date.toLocaleDateString(dateLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
