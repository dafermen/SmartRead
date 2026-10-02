# Mandatory pre-deployment checklist

Version: ______  
Date: ______  
Owner: ______  
Chrome and operating system: ______  
Evidence link: ______

## Release rule

Every section must be `PASS` or a justified `N/A`. Any failure, pending mandatory
check, or open critical/high-severity defect blocks deployment.

## 1. Acceptance testing

- [ ] Read selected text and full-page content.
- [ ] Play, pause, resume, stop, previous, and next work.
- [ ] Speed, volume, voice, and speech language work from the popup.
- [ ] Closing and reopening the popup preserves preferences.
- [ ] All user-facing interface text is English.

Status/evidence: ______________________________

## 2. Unit testing

- [ ] `npm test` completes successfully.
- [ ] Modified pure functions have success, boundary, and error cases.
- [ ] The manifest and declared entry points are valid.

Status/evidence: ______________________________

## 3. Properties and invariants

- [ ] Current index always remains within sentence bounds.
- [ ] Speed remains between `0.25` and `2`.
- [ ] Volume remains between `0` and `1`.
- [ ] Interface language remains `en`.
- [ ] Pause/resume does not duplicate sentences.
- [ ] Stop leaves a consistent state.

Status/evidence: ______________________________

## 4. Mutation testing

- [ ] Tests detect mutations in critical logic.
- [ ] Surviving mutants are reviewed and covered or justified.

Status/evidence: ______________________________

## 5. Fuzzing

- [ ] Random text does not freeze or create loops.
- [ ] Malformed or deeply nested HTML fails safely.
- [ ] Invalid messages and settings are rejected or normalized.

Status/evidence: ______________________________

## 6. Integration testing

- [ ] Popup, service worker, reader core, and content script work together.
- [ ] Local preferences and session state persist correctly.
- [ ] Context menus and shortcuts target the correct tab.
- [ ] Setting changes apply to the active or next reading.

Status/evidence: ______________________________

## 7. Contract testing

- [ ] Every message in `docs/API.md` has a producer and consumer.
- [ ] Responses always include `ok`.
- [ ] Unknown messages return controlled errors.
- [ ] Partial settings preserve omitted preferences.
- [ ] State events respect the correct `tabId`.

Status/evidence: ______________________________

## 8. End-to-end testing

- [ ] Install the extension from a clean folder.
- [ ] Complete the primary flow on controlled fixtures.
- [ ] Test one static page and one dynamic page.
- [ ] Reloading or navigating does not leave ghost audio.
- [ ] The bundled documentation portal opens from the popup.

Status/evidence: ______________________________

## 9. Regression testing

- [ ] Repeat every previously fixed defect scenario.
- [ ] Controls remain visible after initialization.
- [ ] Reader core loads before the content script.
- [ ] Opening and closing the popup preserves state and preferences.
- [ ] Selection, page reading, shortcuts, and context menu still work.

Status/evidence: ______________________________

## 10. Security testing

- [ ] Manifest permissions are minimal and justified.
- [ ] There are no secrets, unexpected telemetry, or remote code.
- [ ] Page content is treated as untrusted input.
- [ ] Page content is not inserted through unsafe `innerHTML`.
- [ ] Dependencies and licenses were reviewed.

Status/evidence: ______________________________

## 11. Concurrency and resilience

- [ ] Rapid clicks do not create multiple simultaneous voices.
- [ ] Starting a session in another tab stops the previous reading.
- [ ] Closing the popup during an action does not corrupt state.
- [ ] A suspended/restarted service worker recovers valid state.
- [ ] Messaging errors do not freeze the interface.

Status/evidence: ______________________________

## 12. Performance and resources

- [ ] A long page starts within an acceptable time.
- [ ] Memory does not grow continuously.
- [ ] Event listeners are not duplicated.
- [ ] The popup uses no interval polling.
- [ ] Large text does not noticeably freeze the page.

Status/evidence: ______________________________

## 13. Compatibility and deployment

- [ ] The declared minimum Chrome version works.
- [ ] Windows and another target environment are tested or justified.
- [ ] Voice-available and no-voice scenarios are handled.
- [ ] Regular, dynamic, and restricted pages behave as expected.
- [ ] The package contains only allowlisted files and a valid manifest.
- [ ] Version, changelog, privacy, icons, and store copy are current.
- [ ] The final package passes a clean installation.
- [ ] A rollback package and plan exist.

Status/evidence: ______________________________

## Approval

- [ ] Every section is `PASS` or an approved `N/A`.
- [ ] No critical or high-severity defects remain open.
- [ ] The version is authorized for deployment.

Final result: `GO / NO-GO`  
Approval: ______________________________
