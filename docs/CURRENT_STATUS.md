# CURRENT STATUS - SmartRead

## Updated

- 2026-10-01
- Current version: `0.4.1`

## Current phase

- User experience stabilization and release-quality foundations.
- The unpacked Chrome extension has a functional text-to-speech engine.
- The popup is the only interface required for playback and settings.
- The product interface and all project documentation are English-only.
- Speech voices may use other languages; interface language does not follow speech language.

## Completed functionality

- Read selected text and the main content of a page.
- Play, pause, resume, stop, previous sentence, and next sentence.
- Reading status, current sentence, and progress.
- Speed from `0.25x` to `2.00x` directly in the popup.
- Volume from `0%` to `100%` directly in the popup.
- Voice and speech-language selection.
- Local preference persistence.
- First-use tutorial and friendly error messages.
- Save confirmation, keyboard navigation, native tooltips, and high contrast.
- Reset settings and bundled documentation access.
- Current-sentence highlighting through the CSS Highlights API with a fallback.
- Event-driven popup updates without interval polling.
- Per-tab state stored in `chrome.storage.session`.
- Protection against duplicate content-script listeners.
- Sequential injection of `reader-core.js` before `content-script.js`.
- Dynamic-feed and semantic-content extraction.
- Final PNG icons in 16, 32, 48, and 128 pixel sizes.
- Safe ZIP packaging through an explicit allowlist.
- One-command access to the Chrome development page through `npm run dev`.
- Documentation portal and package paths aligned with the files stored under `docs/`.
- Public GitHub documentation includes real screenshots of the popup and documentation portal.
- Repository security baseline covers secrets, permissions, dependencies, remote code, and CI permissions.

## Architecture notes

- `content-script/reader-core.js` contains testable extraction and segmentation logic.
- `content-script/content-script.js` owns page interaction and speech playback.
- `background/service-worker.js` coordinates tabs, commands, state, and injection.
- `popup/` contains the complete user-facing settings experience.
- The legacy `options/` page was removed.

## Documentation and quality

- `docs/` contains architecture, contracts, development, testing, deployment,
  operations, security, privacy, troubleshooting, and store-submission guidance.
- `docs/RELEASE_CHECKLIST.md` defines 13 mandatory test families.
- `.github/` includes CI and issue/pull-request templates.
- `test/` is organized into unit, integration, contract, E2E, and fixture areas.
- `docs/index.html` is now a responsive documentation application that renders the existing Markdown sources.
- Documentation includes grouped navigation, local search, per-page TOC, previous/next links, and light/dark themes.
- `Back to SmartRead` returns to `popup/popup.html` in the same tab.
- Documentation routing uses `#doc=<id>` and avoids duplicated `/docs/docs/` paths.

## Pending validation

Automated validation completed on 2026-10-01:

- `npm test` passed syntax checks and all 6 unit tests.
- `npm run package` created `dist/SmartRead-0.4.1.zip` successfully.
- Chrome loaded and reloaded unpacked version `0.4.1` successfully.
- Popup and bundled documentation opened successfully in Chrome.
- Static secret and dangerous-API scans found no exposed credentials or remote executable code.

Manual validation still required:

- Refresh any page that previously loaded an older content script.
- Complete the first-use tutorial.
- Verify selection and full-page reading.
- Verify speed, volume, voice, reset, contrast, and documentation.
- Verify highlighting on static and dynamic pages.
- Verify per-tab state and prevention of simultaneous readings.
- Complete the mandatory release checklist.
- Test the final ZIP in a clean Chrome profile.
- Confirm the compact header and modern color system at narrow popup widths.
- Validate documentation navigation, search, themes, internal links, and mobile drawer in Chrome.

## Recommended next actions

1. Complete manual acceptance testing in Chrome.
2. Fix any defects found during the acceptance pass.
3. Expand unit and contract tests.
4. Add automated E2E coverage with a real Chrome profile.
5. Prepare Chrome Web Store assets and privacy-policy hosting.

## Quick continuation guide

- Project path: `C:\Projects\SmartRead`.
- Read `docs/AGENTS.md` and `docs/CURRENT_STATUS.md` first.
- Keep all interface and documentation text in English.
- Keep speed and volume visible in the popup.
- Do not restore the legacy options page or interval polling.
- Preserve message and DOM identifiers unless a coordinated migration is documented.
- Do not mark a version ready until `docs/RELEASE_CHECKLIST.md` is complete.
