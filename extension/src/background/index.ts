// ============================================================
// Smart Quiz — Background Service Worker
// Manages context menus, side panel, and API communication
// ============================================================

import {
  MessageType,
  type ExtensionMessage,
  type GenerateQuizRequest,
  type GenerateSummaryRequest,
  type QuizSet,
  type Summary,
} from '@shared/types';
import { apiClient } from '../lib/api';

// --- Context Menu Setup ---

chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu
  chrome.contextMenus.create({
    id: 'smart-quiz-parent',
    title: '🧠 Smart Quiz',
    contexts: ['selection'],
  });

  // Summarize option
  chrome.contextMenus.create({
    id: 'smart-quiz-summarize',
    parentId: 'smart-quiz-parent',
    title: '📝 Tóm tắt đoạn này',
    contexts: ['selection'],
  });

  // Generate quiz option
  chrome.contextMenus.create({
    id: 'smart-quiz-generate',
    parentId: 'smart-quiz-parent',
    title: '🧠 Tạo Quiz từ đoạn này',
    contexts: ['selection'],
  });
});

// --- Side Panel Configuration ---

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[Smart Quiz] Side panel error:', error));

// --- Context Menu Click Handler ---

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !info.selectionText) return;

  const selectedText = info.selectionText.trim();
  const sourceUrl = tab.url || '';
  const pageTitle = tab.title || '';

  // Open side panel on the current tab
  await chrome.sidePanel.open({ tabId: tab.id });

  if (info.menuItemId === 'smart-quiz-generate') {
    await handleGenerateQuiz(selectedText, sourceUrl, pageTitle, tab.id);
  } else if (info.menuItemId === 'smart-quiz-summarize') {
    await handleGenerateSummary(selectedText, sourceUrl, pageTitle, tab.id);
  }
});

// --- Quiz Generation ---

async function handleGenerateQuiz(
  text: string,
  sourceUrl: string,
  pageTitle: string,
  tabId: number
): Promise<void> {
  // Notify side panel: loading
  broadcastMessage({
    type: MessageType.QUIZ_LOADING,
    payload: { text: text.substring(0, 200) + '...' },
  });

  try {
    const request: GenerateQuizRequest = {
      text,
      numQuestions: 5,
      sourceUrl,
      pageTitle,
    };

    const response = await apiClient.generateQuiz(request);

    if (response.success && response.data) {
      // Save to local storage for history
      await saveToHistory('quiz', response.data);

      broadcastMessage({
        type: MessageType.QUIZ_READY,
        payload: response.data,
      });
    } else {
      broadcastMessage({
        type: MessageType.QUIZ_ERROR,
        payload: { error: response.error || 'Không thể tạo quiz' },
      });
    }
  } catch (error) {
    console.error('[Smart Quiz] Generate quiz error:', error);
    broadcastMessage({
      type: MessageType.QUIZ_ERROR,
      payload: {
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo quiz',
      },
    });
  }
}

// --- Summary Generation ---

async function handleGenerateSummary(
  text: string,
  sourceUrl: string,
  pageTitle: string,
  tabId: number
): Promise<void> {
  broadcastMessage({
    type: MessageType.SUMMARY_LOADING,
    payload: { text: text.substring(0, 200) + '...' },
  });

  try {
    const request: GenerateSummaryRequest = {
      text,
      format: 'both',
      sourceUrl,
      pageTitle,
    };

    const response = await apiClient.generateSummary(request);

    if (response.success && response.data) {
      await saveToHistory('summary', response.data);

      broadcastMessage({
        type: MessageType.SUMMARY_READY,
        payload: response.data,
      });
    } else {
      broadcastMessage({
        type: MessageType.SUMMARY_ERROR,
        payload: { error: response.error || 'Không thể tạo tóm tắt' },
      });
    }
  } catch (error) {
    console.error('[Smart Quiz] Generate summary error:', error);
    broadcastMessage({
      type: MessageType.SUMMARY_ERROR,
      payload: {
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tóm tắt',
      },
    });
  }
}

// --- Message Broadcasting ---

function broadcastMessage(message: ExtensionMessage): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // Side panel might not be open yet, that's okay
  });
}

// --- Message Listener (from Side Panel) ---

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === MessageType.REQUEST_HISTORY) {
    getHistory().then(sendResponse);
    return true; // async response
  }

  if (message.type === MessageType.SUBMIT_QUIZ) {
    // Quiz scoring is done client-side, just save the result
    const payload = message.payload as { quizId: string; score: number };
    updateQuizScore(payload.quizId, payload.score).then(sendResponse);
    return true;
  }
});

// --- Local Storage Helpers ---

async function saveToHistory(type: 'quiz' | 'summary', data: QuizSet | Summary): Promise<void> {
  const key = type === 'quiz' ? 'quiz_history' : 'summary_history';
  const result = await chrome.storage.local.get(key);
  const history: (QuizSet | Summary)[] = result[key] || [];

  history.unshift(data);

  // Keep last 50 items
  if (history.length > 50) {
    history.splice(50);
  }

  await chrome.storage.local.set({ [key]: history });
}

async function getHistory(): Promise<{ quizzes: QuizSet[]; summaries: Summary[] }> {
  const result = await chrome.storage.local.get(['quiz_history', 'summary_history']);
  return {
    quizzes: result.quiz_history || [],
    summaries: result.summary_history || [],
  };
}

async function updateQuizScore(quizId: string, score: number): Promise<void> {
  const result = await chrome.storage.local.get('quiz_history');
  const history: QuizSet[] = result.quiz_history || [];

  const quiz = history.find((q) => q.id === quizId);
  if (quiz) {
    quiz.score = score;
    quiz.status = 'completed';
    quiz.completedAt = new Date().toISOString();
    await chrome.storage.local.set({ quiz_history: history });
  }
}
