# AGENTS Instructions

## Scope and workflow
- Project root: `C:\Projects\SmartRead`
- Current Codex task status: extension prototype already functional, popup works and visual refresh applied.
- Main goal: keep implementing in short, visible phases.

## Required behaviors for future Codex sessions
- Do not use commands that delete or reset files unless user explicitly asks.
- Do not revert unrelated changes or previous user-approved UI updates.
- Keep edits focused and minimal: prefer small, targeted patches.
- Preserve existing message ids and DOM ids in popup/content scripts (`smartreadStatus`, `readSelection`, `readPage`, `previous`, `play`, `pause`, `stop`, `next`, `languageSelect`, `voiceSelect`, etc.) unless asked for a compatibility migration.
- Never assume file locations; check the path explicitly before patching.
- Do not modify `manifest.json` keys unless the user approves.
- Avoid touching files in other directories unless directly needed by the request.

## Technical notes already in use
- Popup UI files:
  - `popup/popup.html`
  - `popup/popup.css`
  - `popup/popup.js`
- Background logic: `background/service-worker.js`
- Content script logic: `content-script/content-script.js`
- The legacy `options/` page was removed; all user settings belong in the popup.

## Collaboration/communication style
- Use brief progress updates every few actions.
- Prefer user-friendly, non-technical language unless asking for technical details.

## Session continuity protocol
- Start by checking `CURRENT_STATUS.md`.
- Continue from section `Next Actions`.
- If any task is blocked, add one-liner status update to `CURRENT_STATUS.md` before asking user for decision.
- Keep `CURRENT_STATUS.md` current after every substantive edit.

## Quality guardrails
- Keep popup and options behavior stable; avoid layout-only changes that alter element ids or ids used by event handlers.
- Do not introduce new libraries.
- Keep all product interface and project documentation text in English. Speech-language choices may remain multilingual.

## Documentation and release gate
- Keep architecture and behavior documentation under `docs/`.
- Update `CHANGELOG.md` for user-visible changes.
- Update message contracts in `docs/API.md` whenever a producer or consumer changes.
- Update `docs/SECURITY.md` and `docs/PRIVACY.md` before adding permissions, network access, telemetry, or external services.
- Do not describe a version as ready for deployment until `docs/RELEASE_CHECKLIST.md` is complete.
- Every one of the 13 test families must be `PASS` or explicitly justified as `N/A`.
- A failed or pending critical/high-risk check blocks deployment.
- Keep test assets under `test/` using `unit`, `integration`, `contract`, `e2e`, and `fixtures`.
- Keep popup state event-driven; do not restore interval polling.
- Keep the documentation button opening bundled `docs/index.html`.
- Keep existing Markdown files as the documentation source of truth; update `docs/app.js` navigation when documents are added or renamed.
- Keep documentation routing hash-based and never introduce `/docs/docs/` paths.
- Preserve the native same-tab `Back to SmartRead` link to `../popup/popup.html`.
- Build release ZIP files through `scripts/package-extension.ps1` or an equivalent allowlist process.
