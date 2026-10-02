const SETTINGS_KEY = 'smartReadSettings';
const SESSION_STATES_KEY = 'smartReadTabStates';
const ACTIVE_READING_TAB_KEY = 'smartReadActiveReadingTab';

const DEFAULT_SETTINGS = {
  language: 'en-US',
  voiceURI: '',
  rate: 1,
  volume: 1,
  uiLanguage: 'en',
  highContrast: false,
};

const menuIds = {
  selection: 'smartread_read_selection',
  page: 'smartread_read_page',
};

function normalizeSettings(candidate = {}) {
  const rate = Number(candidate.rate);
  const volume = Number(candidate.volume);
  return {
    language: typeof candidate.language === 'string' && candidate.language ? candidate.language : DEFAULT_SETTINGS.language,
    voiceURI: typeof candidate.voiceURI === 'string' ? candidate.voiceURI : '',
    rate: Number.isFinite(rate) ? Math.min(2, Math.max(0.25, rate)) : DEFAULT_SETTINGS.rate,
    volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_SETTINGS.volume,
    uiLanguage: 'en',
    highContrast: candidate.highContrast === true,
  };
}

async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return normalizeSettings({ ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) });
}

async function saveSettings(partial) {
  const current = await getSettings();
  const settings = normalizeSettings({ ...current, ...(partial || {}) });
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  return settings;
}

async function getTabStates() {
  const stored = await chrome.storage.session.get(SESSION_STATES_KEY);
  return stored[SESSION_STATES_KEY] || {};
}

async function cacheTabState(tabId, state) {
  const states = await getTabStates();
  states[String(tabId)] = state;
  await chrome.storage.session.set({ [SESSION_STATES_KEY]: states });
}

async function getCachedTabState(tabId) {
  const states = await getTabStates();
  return states[String(tabId)] || null;
}

async function broadcastState(tabId, state) {
  try {
    await chrome.runtime.sendMessage({ type: 'smartread_state_update', tabId, state });
  } catch (_error) {
    // The popup is usually closed; having no receiver is expected.
  }
}

async function recordState(tabId, state) {
  await cacheTabState(tabId, state);
  if (['reading', 'paused'].includes(state?.status)) {
    await chrome.storage.session.set({ [ACTIVE_READING_TAB_KEY]: tabId });
  } else {
    const active = await chrome.storage.session.get(ACTIVE_READING_TAB_KEY);
    if (active[ACTIVE_READING_TAB_KEY] === tabId) {
      await chrome.storage.session.remove(ACTIVE_READING_TAB_KEY);
    }
  }
  await broadcastState(tabId, state);
}

function friendlyChromeError(error) {
  const message = String(error?.message || error || 'Unknown extension error');
  if (/cannot access|extensions gallery|missing host permission|chrome:\/\//i.test(message)) {
    return {
      ok: false,
      errorCode: 'PAGE_RESTRICTED',
      error: 'SmartRead cannot run on this Chrome page. Open a regular website and try again.',
    };
  }
  if (/no tab with id|tab was closed/i.test(message)) {
    return { ok: false, errorCode: 'TAB_UNAVAILABLE', error: 'The page is no longer available.' };
  }
  return { ok: false, errorCode: 'CONNECTION_ERROR', error: message };
}

async function ensureContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content-script/reader-core.js'],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content-script/content-script.js'],
  });
}

async function sendToTab(tabId, message) {
  await ensureContentScript(tabId);
  return chrome.tabs.sendMessage(tabId, message);
}

async function stopOtherReadingTab(nextTabId) {
  const stored = await chrome.storage.session.get(ACTIVE_READING_TAB_KEY);
  const previousTabId = stored[ACTIVE_READING_TAB_KEY];
  if (!previousTabId || previousTabId === nextTabId) return;

  try {
    await chrome.tabs.sendMessage(previousTabId, { type: 'SMARTREAD_STOP' });
  } catch (_error) {
    await chrome.storage.session.remove(ACTIVE_READING_TAB_KEY);
  }
}

async function handleCommand(message) {
  const tabId = message.tabId;
  if (!tabId) return { ok: false, errorCode: 'NO_ACTIVE_TAB', error: 'No active tab available.' };

  if (['SMARTREAD_START_SELECTION', 'SMARTREAD_START_PAGE'].includes(message.action)) {
    await stopOtherReadingTab(tabId);
  }

  try {
    const result = await sendToTab(tabId, message);
    if (result?.state) await recordState(tabId, result.state);
    return result && typeof result === 'object' ? result : { ok: true };
  } catch (error) {
    if (message.action === 'SMARTREAD_GET_STATE') {
      const cached = await getCachedTabState(tabId);
      if (cached) return { ok: true, ...cached, cached: true };
    }
    return friendlyChromeError(error);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(SETTINGS_KEY);
  if (!existing[SETTINGS_KEY]) await chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });

  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: menuIds.selection,
    title: 'Read selected text with SmartRead',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: menuIds.page,
    title: 'Read this page with SmartRead',
    contexts: ['page'],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) return false;

  (async () => {
    if (message.type === 'smartread_get_settings') {
      sendResponse({ ok: true, settings: await getSettings() });
      return;
    }

    if (message.type === 'smartread_save_settings') {
      sendResponse({ ok: true, settings: await saveSettings(message.settings) });
      return;
    }

    if (message.type === 'smartread_state_changed') {
      if (sender.tab?.id && message.state) await recordState(sender.tab.id, message.state);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'smartread_get_cached_state') {
      sendResponse({ ok: true, state: await getCachedTabState(message.tabId) });
      return;
    }

    if (message.type === 'smartread_command') {
      sendResponse(await handleCommand(message));
      return;
    }

    sendResponse({ ok: false, errorCode: 'UNKNOWN_MESSAGE', error: 'Unknown SmartRead message.' });
  })().catch((error) => sendResponse(friendlyChromeError(error)));

  return true;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  const action = info.menuItemId === menuIds.selection
    ? 'SMARTREAD_START_SELECTION'
    : info.menuItemId === menuIds.page
      ? 'SMARTREAD_START_PAGE'
      : '';
  if (!action) return;

  await stopOtherReadingTab(tab.id);
  try {
    await sendToTab(tab.id, {
      type: action,
      payload: action === 'SMARTREAD_START_SELECTION' ? { selectedText: info.selectionText || '' } : undefined,
    });
  } catch (_error) {
    // Restricted pages cannot be scripted; the next popup open explains this.
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) return;
  const type = command === 'smartread-toggle'
    ? 'SMARTREAD_TOGGLE'
    : command === 'smartread-stop'
      ? 'SMARTREAD_STOP'
      : '';
  if (!type) return;
  try {
    await sendToTab(tabId, { type });
  } catch (_error) {
    // Command is ignored on restricted or closed pages.
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const state = await getCachedTabState(tabId);
  if (state) await broadcastState(tabId, state);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const states = await getTabStates();
  delete states[String(tabId)];
  await chrome.storage.session.set({ [SESSION_STATES_KEY]: states });
  const active = await chrome.storage.session.get(ACTIVE_READING_TAB_KEY);
  if (active[ACTIVE_READING_TAB_KEY] === tabId) {
    await chrome.storage.session.remove(ACTIVE_READING_TAB_KEY);
  }
});
