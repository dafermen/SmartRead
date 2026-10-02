# Changelog

Notable SmartRead changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the product version is
kept in `manifest.json`.

## [Unreleased]

No pending changes.

## [0.4.1] - 2026-10-01

### Added

- English-only product interface and project documentation.
- Automatic migration of the previous interface-language preference to English.
- `npm run dev` command that opens the Chrome extension management page.
- Real Chrome screenshots for the public GitHub README.
- Documented security baseline for secrets, permissions, dependencies, and remote code.

### Fixed

- Documentation portal paths now match the Markdown files stored under `docs/`.
- Distribution packaging no longer requires documentation files that do not exist at the project root.
- Continuation instructions consistently reference `docs/AGENTS.md` and `docs/CURRENT_STATUS.md`.

## [0.4.0] - 2026-08-01

### Added

- Professional bundled documentation shell with grouped sidebar navigation.
- Local full-document search, per-page table of contents, and previous/next navigation.
- Responsive mobile drawer, keyboard controls, and visible focus states.
- Persistent light and dark documentation themes.
- Native same-tab `Back to SmartRead` navigation.

### Changed

- Existing Markdown files remain the documentation source of truth and are rendered locally.
- Documentation routes use stable hash identifiers and cannot produce `/docs/docs/` paths.

## [0.3.2] - 2026-07-31

### Changed

- Replaced visible playback-status text with a compact color indicator beside the title.
- Preserved status names through tooltips and accessible labels.

## [0.3.1] - 2026-07-31

### Changed

- Replaced the warm palette with a modern blue, cyan, slate, and white system.
- Replaced serif interface typography with modern UI typography.
- Improved card surfaces, progress colors, hierarchy, and control states.

### Fixed

- The status badge no longer overlaps the SmartRead title in narrow popups.

## [0.3.0] - 2026-07-31

### Changed

- Standardized the popup, page panel, errors, tutorial, and documentation in English.
- Kept multilingual speech-language support separate from interface language.

## [0.2.1] - 2026-07-31

### Fixed

- Inject the reader core before the content script in two sequential operations.
- Recover tabs marked as loaded after an incomplete injection.

## [0.2.0] - 2026-07-31

### Added

- First-use tutorial, high contrast, settings reset, and documentation portal.
- Event-driven per-tab state stored in `chrome.storage.session`.
- Dynamic-content extraction and current-sentence highlighting.
- Final icons and allowlist-based ZIP packaging.
- Documentation, testing structure, CI, and contribution templates.

### Fixed

- Popup translations no longer remove form controls from the DOM.
- Duplicate content-script listeners are prevented.
- Play/pause correctly resumes from a paused state.

### Removed

- Legacy `options/` page; all settings now live in the popup.

## [0.1.0] - 2026-07-27

### Added

- First functional Manifest V3 prototype.
- Selection and full-page reading.
- Playback controls and local preferences.

## DOC-STD-20261002 — Documentation map

- Added reading paths for users, developers and maintainers.
- Clarified the difference between the installation website and the Chrome extension.
- Preserved existing manual release and store-submission requirements.
