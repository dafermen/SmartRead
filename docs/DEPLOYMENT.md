# Deployment

## Deployment types

- Development: unpacked folder loaded through `chrome://extensions`.
- Release testing: clean ZIP tested in a separate Chrome profile.
- Production: publication through Chrome Web Store.

## Prerequisites

1. Complete `docs/RELEASE_CHECKLIST.md`.
2. Resolve all critical and high-severity defects.
3. Update `manifest.json`, `CHANGELOG.md`, and documentation.
4. Confirm permissions, privacy, licenses, icons, and English copy.

## Safe packaging

Run:

```powershell
npm run package
```

`scripts/package-extension.ps1` creates a ZIP under `dist/` from an explicit allowlist.
The package includes runtime code, icons, and bundled documentation. It excludes
`.git/`, `.github/`, tests, environment files, temporary files, secrets, and design
sources.

## Package verification

1. Extract the ZIP into an empty folder.
2. Load it as an unpacked extension in a clean Chrome profile.
3. Repeat acceptance, regression, and compatibility tests.
4. Confirm that the documentation button works from the packaged extension.
5. Store the ZIP, checklist, and evidence under the same version number.

## Rollback

- Preserve the last approved package.
- Record the reason for withdrawal.
- Restore the last stable store version.
- Open a regression issue and add the scenario to the test suite.
