# Architecture

## Overview

SmartRead is a serverless Chrome Manifest V3 extension with no build step. Speech is
performed locally through `SpeechSynthesis`.

## Components

| Component | Responsibility |
| --- | --- |
| `manifest.json` | Permissions, commands, icons, and entry points. |
| `background/service-worker.js` | Messaging, context menus, shortcuts, injection, and per-tab state. |
| `content-script/reader-core.js` | Testable text normalization, extraction, and segmentation. |
| `content-script/content-script.js` | Page interaction, highlighting, and speech playback. |
| `popup/` | Primary playback and settings interface. |
| `chrome.storage.local` | Persistent user preferences. |
| `chrome.storage.session` | Last known state for each tab and the active reading tab. |

## Main flow

1. The user starts reading from the popup, context menu, or shortcut.
2. The service worker identifies the active tab.
3. `reader-core.js` is injected, followed by `content-script.js`.
4. The content script extracts a selection, semantic article, feed, or page fallback.
5. The text is normalized and split into sentences.
6. `SpeechSynthesis` reads the current sentence with stored preferences.
7. The content script publishes state-change events.
8. The service worker associates each state with a tab and forwards it to the popup.
9. The popup renders only the state belonging to the active tab.

The popup is event-driven and must not use interval polling. Starting a new reading
session stops the previously active reading tab to prevent overlapping voices.

## Trust boundaries

- Web-page content is untrusted input.
- Internal messages require type and payload validation.
- Preferences are not secrets.
- Chrome internal pages cannot run content scripts.
- Remote code is prohibited.
- Page text must never be inserted into extension HTML through unsafe APIs.

## Decisions

Long-lived decisions are recorded under `docs/adr/`.
