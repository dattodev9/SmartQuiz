// ============================================================
// Smart Quiz — Type-Safe Message Passing
// Utilities for chrome.runtime message communication
// ============================================================

import type { ExtensionMessage, MessageType } from '@shared/types';

/**
 * Send a message to the background service worker
 */
export function sendMessage(message: ExtensionMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

/**
 * Listen for messages from the background service worker
 */
export function onMessage(
  callback: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(callback);
}

/**
 * Remove a message listener
 */
export function offMessage(
  callback: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.removeListener(callback);
}

/**
 * Create a typed message
 */
export function createMessage(type: MessageType, payload?: unknown): ExtensionMessage {
  return { type, payload };
}
