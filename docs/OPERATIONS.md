# Operations

SmartRead has no backend. Operating the product means managing versions, incidents,
Chrome compatibility, store status, and release quality.

## Operational signals

- User reports that include Chrome and SmartRead versions.
- Popup, service-worker, and content-script errors.
- Chrome changes affecting Manifest V3 or `SpeechSynthesis`.
- Chrome Web Store warnings or rejections.

## Incident process

1. Record impact, version, environment, and reproduction steps.
2. Assign severity.
3. Stop deployment for a privacy or security risk.
4. Reproduce in a clean Chrome profile.
5. Fix the defect and add a regression test.
6. Choose a patch release or rollback.
7. Update the changelog, troubleshooting guide, and current status.

## Severity

- Critical: data exposure, loss of control, or unusable extension.
- High: primary flow broken with no workaround.
- Medium: degraded behavior with a workaround.
- Low: minor visual or usability issue.

## Data

SmartRead currently has no telemetry. Do not add analytics or external services
without consent, privacy documentation, permission review, and security testing.
