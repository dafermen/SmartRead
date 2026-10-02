# Contributing to SmartRead

## Before changing code

1. Read `AGENTS.md` and `CURRENT_STATUS.md`.
2. Describe the problem and the expected user outcome.
3. Keep changes small and focused.
4. Do not change manifest permissions without a security and privacy justification.
5. Keep all interface and documentation text in English.

## Recommended workflow

1. Create a descriptive branch.
2. Implement the change without including unrelated files.
3. Add or update the appropriate tests.
4. Run `npm test`.
5. Test the unpacked extension manually in Chrome.
6. Update documentation and `CHANGELOG.md`.
7. Complete the pull-request template with evidence.

## Definition of done

A change is complete when:

- The expected behavior works in a supported Chrome version.
- Reading, popup controls, preferences, shortcuts, and navigation still work.
- Relevant automated and manual tests pass.
- Security, privacy, performance, and accessibility were considered.
- Documentation accurately reflects the new behavior.

Before publishing a version, complete `docs/RELEASE_CHECKLIST.md`.
