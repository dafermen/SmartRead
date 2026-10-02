# ADR 0001: Manifest V3 and native speech

- Status: Accepted
- Date: 2026-07-28

## Context

SmartRead needs to read web content with simple installation, few dependencies, and
local privacy.

## Decision

Use Chrome Manifest V3, content scripts, and `SpeechSynthesis`. Keep direct JavaScript,
HTML, and CSS without a framework or build process while complexity remains modest.

## Consequences

- The extension can be loaded directly from the repository.
- Page text is not sent to a server.
- Voice availability and quality depend on the system.
- The service worker may be suspended, so state recovery is required.
- Chrome internal pages remain outside extension access.

## Alternatives considered

- React: adds build tooling and dependencies without enough benefit for the current popup.
- Remote TTS: adds voice choices but introduces network, cost, and privacy risks.
