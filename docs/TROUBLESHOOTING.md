# Troubleshooting

## Chrome cannot load the extension

- Select the folder that directly contains `manifest.json`.
- Confirm that the manifest is valid JSON.
- Read the detailed error shown in `chrome://extensions`.

## The popup opens without controls

- Select **Reload** in `chrome://extensions`.
- Close and reopen the popup.
- Inspect the popup and read the first console error.
- Confirm that `popup.html`, `popup.css`, and `popup.js` come from the same version.

## `SmartRead reader core was not loaded`

- Reload SmartRead in `chrome://extensions`.
- Refresh the affected web page to remove the older injected script.
- Open the popup again.
- Version `0.2.1` and later inject the core and content script sequentially.

## No audio is heard

- Test on a regular website, not `chrome://`, Chrome Web Store, or an internal PDF.
- Confirm that the operating system has an installed voice.
- Raise both SmartRead and system volume.
- Start a new reading after changing the voice.

## Selection cannot be read

- Select visible text before opening the popup.
- Refresh the page after updating the extension.
- Test the context menu to isolate a popup-selection issue.

## Speed or volume is not applied

- Move the slider and release it to save.
- Confirm that the displayed value changes.
- On a restricted page, the preference is saved for the next valid reading session.

## Error locations

- Popup: right-click and select **Inspect**.
- Service worker: use its link in `chrome://extensions`.
- Content script: open DevTools on the target page.

Include the first error, Chrome version, SmartRead version, URL type, and reproduction
steps in every report.
