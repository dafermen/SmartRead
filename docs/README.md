# SmartRead documentation map

Documentation standard v1.0 adoption · 2026-10-02. Primary language: English. Project type: Chrome Manifest V3 extension with a separate public installation website.

## Start with your goal

- Try the extension: read the [introduction and installation steps](../README.md), then [troubleshooting](TROUBLESHOOTING.md).
- Develop: read [current status](CURRENT_STATUS.md), [development](DEVELOPMENT.md), [architecture](ARCHITECTURE.md), and [message contracts](API.md).
- Prepare a release: follow [testing](TESTING.md), the [release checklist](RELEASE_CHECKLIST.md), [deployment](DEPLOYMENT.md), and [operations](OPERATIONS.md).

## Canonical sources

| Topic | Authoritative source |
| --- | --- |
| Implemented behavior, validation and next actions | [Current status](CURRENT_STATUS.md) |
| User controls and installation | [README](../README.md) |
| Security and permissions | [Security](SECURITY.md) |
| Data handling and voice limitations | [Privacy](PRIVACY.md) |
| Changes over time | [Changelog](CHANGELOG.md) |
| Store submission | [Store submission](STORE_SUBMISSION.md) |
| Contribution and maintenance | [Contributing](CONTRIBUTING.md) |

The public [installation and documentation site](https://smartread.innovalogic.tech/) is not a browser-hosted version of the extension and does not establish Chrome Web Store availability. The extension runs after installation in Chrome.

## Project-specific rules

There is no application backend, account system or backend secret configuration. Native speech voices may differ by browser or operating system. Store publication, extension packaging and website updates are separate operations.

Markdown files remain the source of truth. Register new chapters in `docs/app.js`, preserve existing document ids and hash-based routes, and retain the same-tab return link to the popup. Do not move the current status or create a second competing copy in the repository root.

## Maintenance and acceptance

Update the relevant source whenever behavior, permissions, installation or release steps change. Record actual command results and manual checks with a date; historical results are not fresh executions. Use real screenshots with synthetic content and descriptive alternative text.

The extension release checklist and manual clean-profile testing remain pending in the current status. This documentation update does not complete those gates. For a documentation change, validate local links, JavaScript syntax when navigation changes, and the existing automated suite; test the affected portal navigation before publishing it.
