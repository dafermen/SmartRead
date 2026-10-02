# Local development

## Requirements

- Google Chrome 109 or later.
- A code editor.
- Node.js 20 or later for automated checks.
- No server, bundler, or dependency installation is required.

## Run locally

After SmartRead has been loaded once as an unpacked extension, run:

```powershell
npm run dev
```

This opens `chrome://extensions` in the installed Chrome profile. Chrome intentionally
keeps loading and reloading unpacked extensions as an explicit developer action.

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Load `C:\Projects\SmartRead` as an unpacked extension.
4. Select **Reload** after each code change.
5. Refresh the target web page after changing a content script.

## Debugging contexts

- Popup: right-click inside it and select **Inspect**.
- Service worker: open its link from the extension card.
- Content script: use DevTools on the target page.
- Storage: use DevTools, Application, Extension storage.

## Development rules

- Keep all interface and documentation text in English.
- Preserve DOM and message identifiers unless a coordinated migration is required.
- Do not add permissions without a security and privacy review.
- Do not use remote code or secrets in the extension.
- Keep the popup as the primary interface.
- Keep state updates event-driven.
- Update `CURRENT_STATUS.md` after substantive changes.
- Update `CHANGELOG.md` for user-visible changes.

## Baseline checks

```powershell
npm test
```

Then perform the manual Chrome test related to the change.

## Documentation portal

`docs/index.html` is a static documentation application with no external dependencies.
`docs/app.js` defines navigation and renders the existing Markdown files. When adding
or renaming a document, update `documentationSections` in `docs/app.js`, confirm that
all relative Markdown links resolve, and test both desktop and mobile navigation.

Documentation routes use hash identifiers such as `#doc=architecture`; do not create
duplicated `/docs/docs/` paths. Keep `Back to SmartRead` as a native same-tab link to
`../popup/popup.html` so the documentation router cannot intercept it.
