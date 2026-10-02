# Privacy

## Current behavior

- SmartRead processes text locally in the browser.
- Speech uses `SpeechSynthesis` and voices available to the browser or system.
- Preferences are stored in `chrome.storage.local`.
- Temporary tab state is stored in `chrome.storage.session`.
- There are no accounts, servers, analytics, advertisements, or data sales.
- SmartRead does not intentionally send page text to third parties.

## Processed data

- Text selected by the user or main page content explicitly requested for reading.
- Voice, speech language, speed, volume, contrast, and interface preferences.
- Temporary playback state and current sentence index.

## Retention

Preferences remain in the local Chrome profile until changed, cleared, or removed
with the extension. Page text is retained only for the active reading session.

## Future changes

Any feature using network access, telemetry, synchronization, or external AI requires:

1. Clear user consent.
2. Updated privacy documentation and store disclosure.
3. Data minimization and security controls.
4. Permission review.
5. Privacy and security testing before release.
