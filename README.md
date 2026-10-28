# Workout Log — workout tracker

Functional, dependency-free app project for Sultan. Assessment is optional. Includes home-equipment workout suggestions, custom routines, per-set logs, rest timer, running logs, goals, consistency levels, screenshot attachments, Live Text parsing, and JSON backup/restore.

## Get it onto your iPhone

A GitHub repository holds source code; an iPhone does not execute a repository by itself. This project includes everything needed for GitHub Pages hosting and Home Screen installation, without an App Store build or signing account.

1. Create a GitHub repository named `workout-log`. Upload the **contents** of this folder to the repository root. `index.html` must be at the root, not inside another folder. Do not upload only the ZIP.
2. In repository **Settings → Pages**, choose **Deploy from a branch**, select your main branch and **/(root)**, then Save. Repository visibility/plan must support Pages. Use the exact published URL GitHub shows when deployment finishes.
3. Open that URL in Safari on your iPhone. Use **Share → Add to Home Screen**; enable **Open as Web App** if shown, then Add.
4. Launch Workout Log from its Home Screen icon while online once. Its service worker caches the app for later offline use. Test opening it in airplane mode before relying on offline access.
5. Fill in the short profile, then use **Train** or **Log**. No fitness assessment is required. Benchmarks remain unmeasured until you choose to assess.

Upload source only. Never commit exported workout backups or personal screenshots to GitHub. If GitHub's mobile upload UI is inconvenient, do the one-time upload from a computer.

## Run locally on a computer

Requires Python 3; no package installation:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://localhost:8080`. For iPhone installation and offline caching, use the HTTPS Pages URL; a downloaded HTML file or local HTTP network address is not the intended installation route.

## Tests

Requires Node 20+; no dependencies:

```sh
node tests/check.cjs
```

Checks rendering functions, profile, workout recording, XP caps, screenshot-text parsing, goal validation, backup validation and draft persistence using a simulated DOM. These are logic checks, not a real Safari or browser rendering test. Physical iPhone testing remains necessary.

## Storage and privacy

Logs, profile and compressed screenshot attachments stay in browser local storage. No app server receives workout data. The hosting provider serves the app files and may log normal website requests. Browser data can be cleared or evicted. There is no cloud sync, account recovery or encryption layer supplied by this app. Export via **Profile → Export / restore backup** regularly. Open the installed app consistently; browser and installed contexts may have separate data.

Screenshots use local space; export and remove older attachments if storage fills. A visible warning appears when saving fails. Closing then can lose unsaved changes.

## Garmin screenshot logging

Add a screenshot under **Log → Garmin screenshot**. In iPhone Photos, copy its text with Live Text and paste it into Workout Log. Parse and verify the fields, especially elapsed time, units and date, before saving. Enter unsupported fields manually. This release does not perform automatic image OCR or Garmin account synchronization.

## Training and levels

Two strength sessions form the starting plan. Available barbell totals are 20, 40, 60 and 80 kg; a 20 kg jump is not routine progression. Assessment records controlled performance, not true muscle maximums. XP measures consistency and is capped per day; it is not a fitness percentile. Clinical concerns and unfamiliar technique need appropriate human guidance.

## Files and updates

- `index.html`: UI and application logic.
- `manifest.webmanifest`, `icons/`: installation metadata and app icons.
- `sw.js`: offline caching. Increment the cache version when releasing updates. An updated worker activates after old app windows close.
- `.nojekyll`: plain static hosting.
- `tests/check.cjs`: automated logic checks.

No secrets, API keys, third-party scripts or build step are required. This ZIP is source code, not a signed `.ipa` or an already-published repository.

## Documentation

- Apple installation: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Research links are included inside **Profile → Tips & research**.

## Compatibility

The internal browser-storage key is retained so existing workout records and backups remain compatible. The legacy cache prefix is retained for cleanup, with a new cache version.
