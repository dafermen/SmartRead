# Security

## Threat model

SmartRead processes potentially malicious page content and sends commands between
extension contexts. A web page must never control popup code, selectors, or HTML.

## Rules

- Keep permissions minimal.
- Validate message type, action, and payload.
- Enforce bounds for speed, volume, indexes, and input sizes.
- Use `textContent` for page-derived text.
- Do not use `eval`, remote code, or downloaded scripts.
- Do not store secrets in code, storage, environment files, or the repository.
- Do not log complete user text.
- Review dependencies and licenses before adding them.

## Current permissions

| Permission | Reason |
| --- | --- |
| `activeTab` | Work only with the tab activated by the user. |
| `contextMenus` | Start reading from the context menu. |
| `storage` | Store local preferences and session state. |
| `scripting` | Inject the reader after a user action. |

Every new permission requires a threat description, alternative analysis, privacy
impact, and test evidence.

## Verified baseline

Security review completed on 2026-10-01 for version `0.4.1`:

- No API keys, access tokens, passwords, private keys, or secret files were detected.
- The project has no production or development package dependencies.
- The manifest has no host permissions and uses only the permissions documented above.
- No `eval`, dynamic function construction, WebSockets, or remote executable code were detected.
- The content-script HTML template is static and does not interpolate page data.
- The documentation renderer escapes Markdown text before inserting generated HTML.
- GitHub Actions uses read-only repository content permissions.

The scan is a release baseline, not a guarantee that future changes are vulnerability-free.
Repeat it before every public release.

## Secret handling

- Never commit `.env` files, private keys, certificates, tokens, or Chrome signing keys.
- `.env.example` may contain names and safe placeholders only.
- Keep Chrome Web Store credentials outside this repository.
- Revoke and rotate any credential immediately if it is committed or appears in a build artifact.

## Responsible reporting

Do not publish vulnerabilities containing sensitive information in a public issue.
Use a private owner-approved channel before public distribution.
