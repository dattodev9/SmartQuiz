// ============================================================
// Smart Quiz — Main Application
// Side Panel layout with tab navigation and state management
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  MessageType,
  type ExtensionMessage,
  type QuizSet,
  type Summary,
} from '@shared/types';
import { SUPPORTED_LOCALES, type Locale } from '../lib/i18n';
import { useI18n } from './useI18n';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';
import HistoryView from './components/HistoryView';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

type Tab = 'quiz' | 'summary' | 'history';
type AppState = 'idle' | 'loading' | 'ready' | 'error';

interface AppData {
  quiz?: QuizSet;
  summary?: Summary;
  loadingType?: 'quiz' | 'summary';
  loadingPreview?: string;
  error?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('quiz');
  const [appState, setAppState] = useState<AppState>('idle');
  const [data, setData] = useState<AppData>({});
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { locale, t, setLocale } = useI18n();

  // Load saved theme on mount
  useEffect(() => {
    chrome.storage.local.get(['theme'], (result) => {
      const savedTheme = result.theme || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    });
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    chrome.storage.local.set({ theme: newTheme });
  }, [theme]);

  // Listen for messages from background script
  const handleMessage = useCallback(
    (message: ExtensionMessage) => {
      switch (message.type) {
        case MessageType.QUIZ_LOADING: {
          const payload = message.payload as { text: string };
          setAppState('loading');
          setData({
            loadingType: 'quiz',
            loadingPreview: payload.text,
          });
          setActiveTab('quiz');
          break;
        }

        case MessageType.QUIZ_READY: {
          const quiz = message.payload as QuizSet;
          setAppState('ready');
          setData({ quiz });
          setActiveTab('quiz');
          break;
        }

        case MessageType.QUIZ_ERROR: {
          const payload = message.payload as { error: string };
          setAppState('error');
          setData({ error: payload.error });
          break;
        }

        case MessageType.SUMMARY_LOADING: {
          const payload = message.payload as { text: string };
          setAppState('loading');
          setData({
            loadingType: 'summary',
            loadingPreview: payload.text,
          });
          setActiveTab('summary');
          break;
        }

        case MessageType.SUMMARY_READY: {
          const summary = message.payload as Summary;
          setAppState('ready');
          setData({ summary });
          setActiveTab('summary');
          break;
        }

        case MessageType.SUMMARY_ERROR: {
          const payload = message.payload as { error: string };
          setAppState('error');
          setData({ error: payload.error });
          break;
        }
      }
    },
    []
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [handleMessage]);

  // Load a quiz from history
  const handleLoadQuiz = useCallback((quiz: QuizSet) => {
    setData({ quiz });
    setAppState('ready');
    setActiveTab('quiz');
  }, []);

  // Load a summary from history
  const handleLoadSummary = useCallback((summary: Summary) => {
    setData({ summary });
    setAppState('ready');
    setActiveTab('summary');
  }, []);

  // Reset to idle state
  const handleReset = useCallback(() => {
    setAppState('idle');
    setData({});
  }, []);

  // Close lang menu when clicking outside
  useEffect(() => {
    if (!showLangMenu) return;
    const close = () => setShowLangMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showLangMenu]);

  // Render content based on state
  const renderContent = () => {
    if (appState === 'loading') {
      return (
        <LoadingState
          type={data.loadingType || 'quiz'}
          preview={data.loadingPreview}
        />
      );
    }

    if (appState === 'error') {
      return <ErrorState message={data.error} onRetry={handleReset} />;
    }

    switch (activeTab) {
      case 'quiz':
        if (data.quiz) {
          return <QuizView quiz={data.quiz} onReset={handleReset} />;
        }
        return <IdleState type="quiz" />;

      case 'summary':
        if (data.summary) {
          return <SummaryView summary={data.summary} onReset={handleReset} />;
        }
        return <IdleState type="summary" />;

      case 'history':
        return (
          <HistoryView
            onLoadQuiz={handleLoadQuiz}
            onLoadSummary={handleLoadSummary}
          />
        );

      default:
        return <IdleState type="quiz" />;
    }
  };

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === locale);

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-lg">
            🧠
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-text-primary leading-tight">
              {t.appName}
            </h1>
            <p className="text-xs text-text-muted">{t.appTagline}</p>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              className="theme-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setShowLangMenu(!showLangMenu);
              }}
              title={currentLocale?.label}
            >
              {currentLocale?.flag || '🌐'}
            </button>
            {showLangMenu && (
              <div
                className="absolute right-0 top-full mt-1 bg-bg-card border border-border rounded-lg shadow-card z-50 overflow-hidden min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-bg-glass-hover ${
                      locale === loc.code
                        ? 'text-accent-primary font-semibold bg-bg-glass'
                        : 'text-text-secondary'
                    }`}
                    onClick={() => {
                      setLocale(loc.code as Locale);
                      setShowLangMenu(false);
                    }}
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? t.switchToLight : t.switchToDark}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'quiz' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <span>🎯</span>
            {t.tabQuiz}
          </button>
          <button
            className={`tab-btn ${activeTab === 'summary' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <span>📝</span>
            {t.tabSummary}
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span>📚</span>
            {t.tabHistory}
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {renderContent()}
      </main>
    </div>
  );
}

// --- Idle State Component ---

function IdleState({ type }: { type: 'quiz' | 'summary' }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-bg-glass flex items-center justify-center mb-5 animate-pulse-glow">
        <span className="text-4xl">{type === 'quiz' ? '🎯' : '📝'}</span>
      </div>
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        {type === 'quiz' ? t.idleQuizTitle : t.idleSummaryTitle}
      </h2>
      <p className="text-sm text-text-secondary leading-relaxed max-w-[260px]">
        {t.idleInstruction}{' '}
        <strong className="text-accent-primary">
          {type === 'quiz' ? t.idleQuizAction : t.idleSummaryAction}
        </strong>{' '}
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-text-muted">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        {t.idleWaiting}
      </div>
    </div>
  );
}
