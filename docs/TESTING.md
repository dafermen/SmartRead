# Testing strategy

## Principle

SmartRead combines isolated JavaScript, Chrome APIs, external page DOM, and system
speech. No single test level covers the complete product, so testing is layered.

## Extension testing pyramid

- Unit: normalization, segmentation, scoring, bounds, and pure transformations.
- Property: invariants over generated text and settings.
- Contract: messages between popup, service worker, and content script.
- Integration: storage, injection, commands, and speech lifecycle.
- E2E: the real extension loaded in Chrome against controlled pages.
- Manual: audio quality, system voices, accessibility, and user experience.

## Mandatory pre-deployment families

1. Acceptance.
2. Unit.
3. Properties and invariants.
4. Mutation testing.
5. Fuzzing.
6. Integration.
7. Contract.
8. End-to-end.
9. Regression.
10. Security.
11. Concurrency and resilience.
12. Performance and resources.
13. Compatibility and deployment.

Detailed criteria and evidence requirements are in `docs/RELEASE_CHECKLIST.md`.

## Result policy

- A critical or high-severity failure blocks the release.
- A pending mandatory test blocks the release.
- `N/A` requires a reason, residual-risk statement, and approval.
- Evidence identifies SmartRead version, Chrome version, and environment.
- Automated tests are repeatable; manual tests have documented steps.

## Test data

Use local fixtures without personal data:

- Short, long, empty, and whitespace-only text.
- Accents, emoji, RTL text, and non-Latin alphabets.
- Pages with `article`, `main`, menus, feeds, and dynamic content.
- Deeply nested markup, hidden content, and control characters.
