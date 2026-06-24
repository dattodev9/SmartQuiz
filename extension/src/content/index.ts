// ============================================================
// Smart Quiz — Content Script
// Lightweight script injected into web pages for text extraction
// ============================================================

import { MessageType } from '@shared/types';

// Listen for messages from background script requesting clean text
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === MessageType.GET_SELECTION) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const cleanText = cleanExtractText(selection);
      sendResponse({ text: cleanText });
    } else {
      sendResponse({ text: '' });
    }
    return true;
  }
});

/**
 * Extracts and cleans text from the current selection.
 * Removes HTML artifacts, ads, scripts, and normalizes whitespace.
 */
function cleanExtractText(selection: Selection): string {
  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  // Create a temporary container
  const container = document.createElement('div');
  container.appendChild(fragment);

  // Remove unwanted elements
  const unwantedSelectors = [
    'script',
    'style',
    'noscript',
    'iframe',
    'svg',
    'canvas',
    'nav',
    'footer',
    'header',
    '[role="banner"]',
    '[role="navigation"]',
    '[role="complementary"]',
    '.ad',
    '.ads',
    '.advertisement',
    '[data-ad]',
    '[class*="sponsor"]',
    '[class*="promo"]',
  ];

  unwantedSelectors.forEach((selector) => {
    container.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Extract text content
  let text = container.textContent || container.innerText || '';

  // Normalize whitespace
  text = text
    .replace(/\s+/g, ' ')        // collapse multiple spaces
    .replace(/\n\s*\n/g, '\n')   // collapse multiple newlines
    .trim();

  return text;
}

// Minimal console log to confirm injection (dev only)
console.log('[Smart Quiz] Content script loaded');
