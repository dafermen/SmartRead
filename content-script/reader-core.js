(function exposeSmartReadCore(root, factory) {
  if (root.SmartReadCore) {
    if (typeof module === 'object' && module.exports) module.exports = root.SmartReadCore;
    return;
  }

  const api = factory();
  root.SmartReadCore = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const DEFAULT_SETTINGS = Object.freeze({
    language: 'en-US',
    voiceURI: '',
    rate: 1,
    volume: 1,
    uiLanguage: 'en',
    highContrast: false,
  });

  const REMOVED_SELECTORS = [
    'script',
    'style',
    'noscript',
    'svg',
    'nav',
    'aside',
    'header',
    'footer',
    'form',
    'button',
    'input',
    'textarea',
    'select',
    '[aria-hidden="true"]',
    '[hidden]',
    '#smartread-panel',
  ].join(',');

  function normalizeText(text) {
    return String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/[\t ]+\n/g, '\n')
      .replace(/\n[\t ]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[\t ]{2,}/g, ' ')
      .trim();
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function sanitizeSettings(candidate = {}) {
    return {
      language: typeof candidate.language === 'string' && candidate.language
        ? candidate.language
        : DEFAULT_SETTINGS.language,
      voiceURI: typeof candidate.voiceURI === 'string' ? candidate.voiceURI : '',
      rate: clampNumber(candidate.rate, 0.25, 2, DEFAULT_SETTINGS.rate),
      volume: clampNumber(candidate.volume, 0, 1, DEFAULT_SETTINGS.volume),
      uiLanguage: 'en',
      highContrast: candidate.highContrast === true,
    };
  }

  function chunkLongText(text, maxChars = 220) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const chunks = [];
    let current = '';

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= maxChars) {
        current = next;
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }

    if (current) chunks.push(current);
    return chunks;
  }

  function fallbackSentenceSplit(text) {
    return String(text || '')
      .replace(/([.!?…]+)(\s+|$)/g, '$1|')
      .replace(/([;:])(\s+|$)/g, '$1|')
      .replace(/\n+/g, '|')
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function splitSentences(text, language = 'en-US') {
    const clean = normalizeText(text);
    if (!clean) return [];

    let parts = [];
    if (typeof Intl === 'object' && typeof Intl.Segmenter === 'function') {
      try {
        const segmenter = new Intl.Segmenter(language, { granularity: 'sentence' });
        parts = Array.from(segmenter.segment(clean), ({ segment }) => segment.trim()).filter(Boolean);
      } catch (_error) {
        parts = fallbackSentenceSplit(clean);
      }
    } else {
      parts = fallbackSentenceSplit(clean);
    }

    return parts.flatMap((part) => (part.length > 280 ? chunkLongText(part) : [part]));
  }

  function getElementText(node) {
    if (!node?.cloneNode) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll?.(REMOVED_SELECTORS).forEach((element) => element.remove());
    return normalizeText(clone.innerText || clone.textContent || '');
  }

  function isVisible(node, view) {
    if (!node || node.hidden || node.getAttribute?.('aria-hidden') === 'true') return false;
    if (!view?.getComputedStyle) return true;
    const style = view.getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
  }

  function scoreReadableNode(node) {
    const text = getElementText(node);
    if (text.length < 120) return { score: 0, text };

    const links = Array.from(node.querySelectorAll?.('a') || []);
    const linkTextLength = links.reduce((sum, link) => sum + normalizeText(link.innerText).length, 0);
    const linkDensity = text.length ? linkTextLength / text.length : 1;
    const paragraphs = node.querySelectorAll?.('p').length || 0;
    const headings = node.querySelectorAll?.('h1, h2, h3').length || 0;
    const controls = node.querySelectorAll?.('button, input, select, textarea').length || 0;
    const semanticBonus = node.matches?.('article, main, [role="main"], [itemprop="articleBody"]') ? 900 : 0;
    const score = text.length + paragraphs * 90 + headings * 55 + semanticBonus
      - linkDensity * text.length * 1.35 - controls * 45;

    return { score: Math.max(0, score), text };
  }

  function extractReadableContent(doc) {
    if (!doc?.body) return { text: '', root: null, sourceType: 'none' };
    const view = doc.defaultView;
    const feed = doc.querySelector('[role="feed"]');

    if (feed && isVisible(feed, view)) {
      const posts = Array.from(feed.querySelectorAll(':scope > [role="article"], [role="article"]'))
        .filter((node) => isVisible(node, view))
        .map((node) => getElementText(node))
        .filter((text) => text.length >= 80)
        .slice(0, 30);
      if (posts.length >= 2) {
        return { text: normalizeText(posts.join('\n\n')), root: feed, sourceType: 'feed' };
      }
    }

    const selectors = [
      'article',
      '[itemprop="articleBody"]',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '#main-content',
      '#content',
      '[data-testid="post_message"]',
      '[role="article"]',
    ];
    const candidates = [];
    const seen = new Set();

    for (const selector of selectors) {
      for (const node of doc.querySelectorAll(selector)) {
        if (!seen.has(node) && isVisible(node, view)) {
          seen.add(node);
          candidates.push(node);
        }
      }
    }

    for (const node of doc.querySelectorAll('section, div')) {
      if (candidates.length >= 180) break;
      if (!seen.has(node) && isVisible(node, view)) {
        seen.add(node);
        candidates.push(node);
      }
    }

    let best = null;
    let bestResult = { score: 0, text: '' };
    for (const node of candidates) {
      const result = scoreReadableNode(node);
      if (result.score > bestResult.score) {
        best = node;
        bestResult = result;
      }
    }

    if (best && bestResult.text) {
      return { text: bestResult.text, root: best, sourceType: 'candidate' };
    }

    return { text: getElementText(doc.body), root: doc.body, sourceType: 'body' };
  }

  return {
    DEFAULT_SETTINGS,
    normalizeText,
    clampNumber,
    sanitizeSettings,
    splitSentences,
    getElementText,
    scoreReadableNode,
    extractReadableContent,
  };
});
