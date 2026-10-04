(() => {
  const CONTENT_VERSION = '0.5.0';
  if (globalThis.__smartReadContentLoaded === CONTENT_VERSION) return;
  if (globalThis.__smartReadContentLoaded) {
    document.getElementById('smartread-panel')?.remove();
    speechSynthesis.cancel();
  }
  const core = globalThis.SmartReadCore;
  if (!core) {
    console.warn('SmartRead reader core is not available yet.');
    return;
  }
  globalThis.__smartReadContentLoaded = CONTENT_VERSION;

  const STORAGE_KEY = 'smartReadSettings';
  const translations = {
    en: {
      ready: 'Ready', reading: 'Reading', paused: 'Paused', stopped: 'Stopped', completed: 'Completed', error: 'Needs attention',
      noSelection: 'Select some visible text first, then try again.',
      noText: 'SmartRead could not find readable text on this page.',
      noVoice: 'Chrome could not start a voice. Check the selected voice and system audio.',
      sentencePrefix: 'Sentence', play: 'Play', pause: 'Pause', stop: 'Stop', previous: 'Previous', next: 'Next', close: 'Hide panel',
    },
  };

  let settings = { ...core.DEFAULT_SETTINGS };
  let voices = [];
  let utterance = null;
  let currentSentences = [];
  let currentIndex = -1;
  let status = 'ready';
  let sessionSource = '';
  let sessionRoot = document.body;
  let panel = null;
  let controls = {};
  let lastError = '';
  let lastErrorCode = '';
  let playbackGeneration = 0;
  let panelDismissed = false;
  let stateEmissionQueued = false;

  const t = (key) => translations.en[key] || key;

  function getState() {
    return {
      status,
      hasText: currentSentences.length > 0,
      currentIndex,
      total: currentSentences.length,
      currentSentence: currentIndex >= 0 ? currentSentences[currentIndex] : '',
      canPrevious: currentIndex > 0,
      canNext: currentIndex >= 0 && currentIndex < currentSentences.length - 1,
      hasVoices: voices.length > 0,
      settings,
      error: lastError,
      errorCode: lastErrorCode,
    };
  }

  function emitStateChange() {
    if (stateEmissionQueued) return;
    stateEmissionQueued = true;
    queueMicrotask(() => {
      stateEmissionQueued = false;
      chrome.runtime.sendMessage({ type: 'smartread_state_changed', state: getState() }).catch(() => {});
    });
  }

  function injectStyles() {
    if (document.getElementById('smartread-style')) return;
    const style = document.createElement('style');
    style.id = 'smartread-style';
    style.textContent = `
      ::highlight(smartread-current) { background: #ffe36e; color: #132f38; text-decoration: underline 2px #e46f51; }
      .smartread-highlight-fallback { background: #ffe36e !important; color: #132f38 !important; outline: 2px solid #e46f51 !important; }
      #smartread-panel { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; width: min(360px, calc(100vw - 32px)); border: 1px solid #9cc9c5; border-radius: 16px; padding: 12px; color: #18323d; background: rgba(255,253,248,.97); box-shadow: 0 14px 38px rgba(24,50,61,.24); font-family: "Trebuchet MS", sans-serif; }
      #smartread-panel[data-hidden='true'] { display: none; }
      #smartread-panel[data-contrast='true'] { color: #fff; background: #000; border: 3px solid #ffdf00; }
      #smartread-status { margin-bottom: 8px; color: #176b73; font-size: 12px; font-weight: 800; }
      #smartread-panel[data-contrast='true'] #smartread-status { color: #ffdf00; }
      #smartread-sentence { min-height: 38px; max-height: 72px; overflow: hidden; padding: 9px; border-radius: 9px; background: #edf6f4; font-family: Georgia, serif; font-size: 13px; line-height: 1.35; }
      #smartread-panel[data-contrast='true'] #smartread-sentence { color: #fff; background: #161616; border: 1px solid #fff; }
      #smartread-actions { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 6px; margin-top: 10px; }
      #smartread-actions button, #smartread-close { min-height: 34px; border: 0; border-radius: 9px; color: #fff; background: #176b73; cursor: pointer; font: 700 11px "Trebuchet MS", sans-serif; }
      #smartread-actions button[disabled] { opacity: .42; cursor: not-allowed; }
      #smartread-close { width: 100%; margin-top: 7px; color: #7d3a2c; background: #fff0e9; }
      #smartread-panel[data-contrast='true'] button { color: #000; background: #ffdf00; outline: 1px solid #fff; }
    `;
    document.documentElement.appendChild(style);
  }

  function buildPanel() {
    if (panel?.isConnected) return;
    injectStyles();
    panel = document.createElement('section');
    panel.id = 'smartread-panel';
    panel.dataset.hidden = 'true';
    panel.setAttribute('aria-label', 'SmartRead');
    panel.innerHTML = `
      <div id="smartread-status" role="status"></div>
      <div id="smartread-sentence" aria-live="polite"></div>
      <div id="smartread-actions">
        <button id="smartread-prev" data-action="prev" type="button"></button>
        <button id="smartread-play" data-action="play" type="button"></button>
        <button id="smartread-pause" data-action="pause" type="button"></button>
        <button id="smartread-stop" data-action="stop" type="button"></button>
        <button id="smartread-next" data-action="next" type="button"></button>
      </div>
      <button id="smartread-close" type="button"></button>
    `;
    document.body.appendChild(panel);
    controls = {
      status: panel.querySelector('#smartread-status'), sentence: panel.querySelector('#smartread-sentence'),
      prev: panel.querySelector('#smartread-prev'), play: panel.querySelector('#smartread-play'), pause: panel.querySelector('#smartread-pause'),
      stop: panel.querySelector('#smartread-stop'), next: panel.querySelector('#smartread-next'), close: panel.querySelector('#smartread-close'),
    };
    panel.addEventListener('click', (event) => {
      const action = event.target?.dataset?.action;
      if (action === 'prev') commandPrevious();
      if (action === 'play') commandPlay();
      if (action === 'pause') commandPause();
      if (action === 'stop') commandStop();
      if (action === 'next') commandNext();
      if (event.target?.id === 'smartread-close') {
        panelDismissed = true;
        panel.dataset.hidden = 'true';
      }
    });
  }

  function clearHighlight() {
    if (globalThis.CSS?.highlights) CSS.highlights.delete('smartread-current');
    document.querySelectorAll('.smartread-highlight-fallback').forEach((node) => {
      const parent = node.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(node.textContent || ''), node);
        parent.normalize();
      }
    });
  }

  function findSentenceRange(sentence, root = document.body) {
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('#smartread-panel, script, style, noscript, [hidden], [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    let searchable = '';
    const positions = [];
    let previousSpace = false;
    let node;
    while ((node = walker.nextNode())) {
      const value = node.textContent || '';
      for (let offset = 0; offset < value.length; offset += 1) {
        const char = value[offset];
        if (/\s/.test(char)) {
          if (searchable && !previousSpace) {
            searchable += ' ';
            positions.push({ node, offset });
          }
          previousSpace = true;
        } else {
          searchable += char;
          positions.push({ node, offset });
          previousSpace = false;
        }
      }
    }
    const needle = core.normalizeText(sentence).replace(/\s+/g, ' ');
    const startIndex = searchable.indexOf(needle);
    if (startIndex < 0 || !positions[startIndex] || !positions[startIndex + needle.length - 1]) return null;
    const start = positions[startIndex];
    const end = positions[startIndex + needle.length - 1];
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset + 1);
    return range;
  }

  function highlightSentence(sentence) {
    clearHighlight();
    if (!sentence) return;
    const range = findSentenceRange(sentence, sessionRoot);
    if (!range) return;
    if (globalThis.CSS?.highlights && typeof globalThis.Highlight === 'function') {
      CSS.highlights.set('smartread-current', new Highlight(range));
      range.startContainer.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (range.startContainer === range.endContainer) {
      const span = document.createElement('span');
      span.className = 'smartread-highlight-fallback';
      range.surroundContents(span);
      span.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function updatePanel() {
    buildPanel();
    panel.dataset.contrast = String(settings.highContrast);
    controls.status.textContent = t(status);
    controls.prev.textContent = '◀'; controls.prev.title = t('previous'); controls.prev.setAttribute('aria-label', t('previous'));
    controls.play.textContent = '▶'; controls.play.title = t('play'); controls.play.setAttribute('aria-label', t('play'));
    controls.pause.textContent = 'Ⅱ'; controls.pause.title = t('pause'); controls.pause.setAttribute('aria-label', t('pause'));
    controls.stop.textContent = '■'; controls.stop.title = t('stop'); controls.stop.setAttribute('aria-label', t('stop'));
    controls.next.textContent = '▶▶'; controls.next.title = t('next'); controls.next.setAttribute('aria-label', t('next'));
    controls.close.textContent = t('close');
    controls.play.disabled = status === 'reading';
    controls.pause.disabled = status !== 'reading';
    controls.stop.disabled = !['reading', 'paused'].includes(status);
    controls.prev.disabled = currentIndex <= 0;
    controls.next.disabled = currentIndex < 0 || currentIndex >= currentSentences.length - 1;
    controls.sentence.textContent = currentIndex >= 0
      ? `${t('sentencePrefix')} ${currentIndex + 1}/${currentSentences.length}: ${currentSentences[currentIndex]}`
      : lastError;
    if (['reading', 'paused'].includes(status) && !panelDismissed) panel.dataset.hidden = 'false';
    if (currentIndex >= 0 && ['reading', 'paused'].includes(status)) highlightSentence(currentSentences[currentIndex]);
    emitStateChange();
  }

  function refreshVoices() {
    voices = speechSynthesis.getVoices();
    return voices;
  }

  function resolveVoice() {
    const requestedLanguage = String(settings.language || '').toLowerCase().replace('_', '-');
    const requestedBase = requestedLanguage.split('-')[0];
    if (settings.voiceURI) {
      const selected = voices.find((voice) => voice.voiceURI === settings.voiceURI);
      const selectedBase = String(selected?.lang || '').toLowerCase().split(/[-_]/)[0];
      if (selected && selectedBase === requestedBase) return selected;
    }
    return voices.find((voice) => String(voice.lang || '').toLowerCase().replace('_', '-') === requestedLanguage)
      || voices.find((voice) => String(voice.lang || '').toLowerCase().split(/[-_]/)[0] === requestedBase)
      || null;
  }

  function fail(errorCode, message) {
    playbackGeneration += 1;
    speechSynthesis.cancel();
    status = 'error';
    lastErrorCode = errorCode;
    lastError = message;
    panelDismissed = false;
    updatePanel();
    return { ok: false, errorCode, error: message, state: getState() };
  }

  function speakCurrentSentence() {
    if (!currentSentences.length || currentIndex < 0) return;
    const generation = ++playbackGeneration;
    const text = currentSentences[currentIndex];
    utterance = new SpeechSynthesisUtterance(text);
    const voice = resolveVoice();
    utterance.voice = voice;
    utterance.lang = voice?.lang || settings.language;
    utterance.rate = settings.rate;
    utterance.volume = settings.volume;
    utterance.onstart = () => {
      if (generation !== playbackGeneration) return;
      status = 'reading';
      updatePanel();
    };
    utterance.onend = () => {
      if (generation !== playbackGeneration || status !== 'reading') return;
      if (currentIndex < currentSentences.length - 1) {
        currentIndex += 1;
        speakCurrentSentence();
      } else {
        status = 'completed';
        clearHighlight();
        updatePanel();
      }
    };
    utterance.onerror = () => {
      if (generation !== playbackGeneration) return;
      fail('VOICE_ERROR', t('noVoice'));
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    status = 'reading';
    updatePanel();
  }

  function startReadingFromText(text, root) {
    const source = core.normalizeText(text);
    if (!source) return fail('NO_READABLE_TEXT', t('noText'));
    sessionSource = source;
    sessionRoot = root || document.body;
    currentSentences = core.splitSentences(source, settings.language);
    currentIndex = 0;
    lastError = '';
    lastErrorCode = '';
    panelDismissed = false;
    speakCurrentSentence();
    return { ok: true, state: getState() };
  }

  function commandStartSelection(payload = {}) {
    const selection = window.getSelection();
    const selected = payload.selectedText || selection?.toString?.() || '';
    if (!core.normalizeText(selected)) return fail('NO_SELECTION', t('noSelection'));
    const root = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : document.body;
    return startReadingFromText(selected, root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement);
  }

  function commandStartPage() {
    const extracted = core.extractReadableContent(document);
    if (!extracted.text) return fail('NO_READABLE_TEXT', t('noText'));
    return startReadingFromText(extracted.text, extracted.root);
  }

  function commandPlay() {
    if (status === 'paused') {
      speechSynthesis.resume();
      status = 'reading';
      updatePanel();
    } else if (currentSentences.length) {
      if (currentIndex < 0) currentIndex = 0;
      speakCurrentSentence();
    } else if (sessionSource) {
      currentSentences = core.splitSentences(sessionSource, settings.language);
      currentIndex = 0;
      speakCurrentSentence();
    }
    return { ok: true, state: getState() };
  }

  function commandPause() {
    if (status === 'reading') {
      speechSynthesis.pause();
      status = 'paused';
      updatePanel();
    }
    return { ok: true, state: getState() };
  }

  function commandStop() {
    playbackGeneration += 1;
    speechSynthesis.cancel();
    currentIndex = -1;
    currentSentences = [];
    sessionSource = '';
    status = 'stopped';
    lastError = '';
    lastErrorCode = '';
    clearHighlight();
    if (panel) panel.dataset.hidden = 'true';
    emitStateChange();
    return { ok: true, state: getState() };
  }

  function commandPrevious() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      speakCurrentSentence();
    }
    return { ok: true, state: getState() };
  }

  function commandNext() {
    if (currentIndex >= 0 && currentIndex < currentSentences.length - 1) {
      currentIndex += 1;
      speakCurrentSentence();
    }
    return { ok: true, state: getState() };
  }

  function commandToggle() {
    return status === 'reading' ? commandPause() : commandPlay();
  }

  function applySettings(next) {
    settings = core.sanitizeSettings({ ...settings, ...(next || {}) });
    chrome.storage.local.set({ [STORAGE_KEY]: settings });
    if (currentIndex >= 0 && ['reading', 'paused'].includes(status)) {
      const remainPaused = status === 'paused';
      speakCurrentSentence();
      if (remainPaused) {
        setTimeout(() => {
          speechSynthesis.pause();
          status = 'paused';
          updatePanel();
        }, 0);
      }
    } else {
      updatePanel();
    }
    return { ok: true, state: getState() };
  }

  function getVoicesForPopup() {
    refreshVoices();
    return voices.map((voice) => ({ name: voice.name, lang: voice.lang, default: !!voice.default, voiceURI: voice.voiceURI }));
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
      const type = message?.type === 'smartread_command' ? message.action : message?.type;
      let result;
      if (type === 'SMARTREAD_START_SELECTION') result = commandStartSelection(message?.payload || {});
      else if (type === 'SMARTREAD_START_PAGE') result = commandStartPage();
      else if (type === 'SMARTREAD_PLAY' || type === 'SMARTREAD_RESUME') result = commandPlay();
      else if (type === 'SMARTREAD_PAUSE') result = commandPause();
      else if (type === 'SMARTREAD_STOP') result = commandStop();
      else if (type === 'SMARTREAD_PREVIOUS') result = commandPrevious();
      else if (type === 'SMARTREAD_NEXT') result = commandNext();
      else if (type === 'SMARTREAD_TOGGLE') result = commandToggle();
      else if (type === 'SMARTREAD_SET_SETTINGS') result = applySettings(message.settings || message.payload?.settings || {});
      else if (type === 'SMARTREAD_GET_STATE') result = { ok: true, ...getState() };
      else if (type === 'SMARTREAD_GET_VOICES') result = { ok: true, voices: getVoicesForPopup() };
      else result = { ok: false, errorCode: 'UNKNOWN_COMMAND', error: `Unknown SmartRead command: ${type}` };
      sendResponse(result);
    } catch (error) {
      sendResponse({ ok: false, errorCode: 'UNEXPECTED_ERROR', error: String(error?.message || error) });
    }
    return false;
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
      settings = core.sanitizeSettings(changes[STORAGE_KEY].newValue);
      updatePanel();
    }
  });

  async function boot() {
    const response = await chrome.runtime.sendMessage({ type: 'smartread_get_settings' });
    settings = core.sanitizeSettings(response?.settings || {});
    refreshVoices();
    buildPanel();
    updatePanel();
    speechSynthesis.addEventListener('voiceschanged', () => {
      refreshVoices();
      emitStateChange();
    });
  }

  boot().catch((error) => fail('BOOT_ERROR', String(error?.message || error)));
})();
