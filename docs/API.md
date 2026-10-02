# Internal message contracts

SmartRead exposes no HTTP API. Its internal API consists of messages exchanged by the
popup, service worker, and content script.

## Command envelope

```json
{
  "type": "smartread_command",
  "action": "SMARTREAD_PLAY",
  "tabId": 123
}
```

## Commands

| Action | Additional data | Expected result |
| --- | --- | --- |
| `SMARTREAD_START_SELECTION` | Optional `payload` | Prepare and read selected text. |
| `SMARTREAD_START_PAGE` | None | Extract and read page content. |
| `SMARTREAD_PLAY` | None | Start or resume. |
| `SMARTREAD_PAUSE` | None | Pause active speech. |
| `SMARTREAD_RESUME` | None | Resume speech. |
| `SMARTREAD_STOP` | None | Cancel the reading session. |
| `SMARTREAD_PREVIOUS` | None | Move back one sentence. |
| `SMARTREAD_NEXT` | None | Move forward one sentence. |
| `SMARTREAD_TOGGLE` | None | Toggle play and pause. |
| `SMARTREAD_SET_SETTINGS` | Partial `settings` | Save and apply preferences. |
| `SMARTREAD_GET_STATE` | None | Return playback state and progress. |
| `SMARTREAD_GET_VOICES` | None | Return available system voices. |

## Preferences

```json
{
  "uiLanguage": "en",
  "language": "en-US",
  "voiceURI": "",
  "rate": 1,
  "volume": 1,
  "highContrast": false
}
```

Required invariants:

- `uiLanguage` is always `en`.
- `rate` remains between `0.25` and `2`.
- `volume` remains between `0` and `1`.
- Partial settings objects do not remove omitted properties.

## State events

The content script publishes:

```json
{ "type": "smartread_state_changed", "state": {} }
```

The service worker associates the sender's tab, caches the state, and broadcasts:

```json
{ "type": "smartread_state_update", "tabId": 123, "state": {} }
```

The popup ignores events whose `tabId` does not match the active tab.

## Errors

Every operation returns `ok: true` or `ok: false`. Stable error codes include:

- `NO_SELECTION`
- `NO_READABLE_TEXT`
- `VOICE_ERROR`
- `PAGE_RESTRICTED`
- `TAB_UNAVAILABLE`
- `CONNECTION_ERROR`
- `UNKNOWN_COMMAND`

User-facing messages must be safe, concise, and in English. They must not include
secrets or full page content.

Changing a message name or shape requires updating producers, consumers,
documentation, and contract tests in the same change.
