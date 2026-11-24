# Workout Log — workout tracker

Functional static app project for Sultan. Assessment is optional. Includes home-equipment workout suggestions, custom routines, per-set logs, rest timer, running logs, goals, consistency levels, screenshot attachments, Live Text parsing, and JSON backup/restore.

## Get it onto your iPhone

A GitHub repository holds source code; an iPhone does not execute a repository by itself. This project includes everything needed for GitHub Pages hosting and Home Screen installation, without an App Store build or signing account.

1. Open https://dirhaya.github.io/Workout-App/ in Safari. The existing repository is Dirhaya/Workout-App.
2. Updates publish through the existing GitHub Pages deployment.
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

Use **Log → Read screenshot automatically** and choose a photo, paste an image from the clipboard, or use the paste area. Tesseract.js reads English Garmin strength tables locally, separates columns and groups sets by exercise. Review exercise matches, reps, loads, date and units before saving. Wrapped exercise names are supported. Missing loads remain unknown; set times are not total workout duration. Only visible rows are imported. The source image is held in memory, not uploaded or stored with the import. The editable extracted draft autosaves.

OCR is not perfect. Cropped columns, different layouts and recognition errors require correction. Photo selection is the fallback when Safari clipboard access is unavailable. Internet is needed for initial OCR assets; browser caching is not a guarantee of offline OCR. Garmin account synchronization is not provided.

## Training and levels

Two strength sessions form the starting plan. Available barbell totals are 20, 40, 60 and 80 kg; a 20 kg jump is not routine progression. Assessment records controlled performance, not true muscle maximums. XP measures consistency and is capped per day; it is not a fitness percentile. Clinical concerns and unfamiliar technique need appropriate human guidance.

## Files and updates

- `index.html`: UI and application logic.
- `manifest.webmanifest`, `icons/`: installation metadata and app icons.
- `sw.js`: offline caching. Increment the cache version when releasing updates. An updated worker activates after old app windows close.
- `.nojekyll`: plain static hosting.
- `tests/check.cjs`: automated logic checks.

No secrets, API keys or build step are required. Optional OCR and assistant features download third-party runtime/model assets.

## Documentation

- Apple installation: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Research links are included inside **Profile → Tips & research**.

## Compatibility

The internal browser-storage key is retained so existing workout records and backups remain compatible. The legacy cache prefix is retained for cleanup, with a new cache version.

## Version 2.0 update

This updates the existing app and retains the `arise-v1` storage key to preserve installed users' records. No assessment is required.

- 90 built-in exercises, plus user-created movements with explicit muscle tags. Custom workout templates can be edited.
- Home, full-body, upper/lower and push/pull/legs templates, plus Cindy, Annie, Fran and Grace references. Advanced benchmarks are editable references, not automatic prescriptions.
- Log → Paste workout accepts one line per exercise, such as `Bench press: 3 x 8 at 40 kg, RIR 2`. Missing data remains blank; unknown names must be resolved before saving. Verify kg versus pounds and per-dumbbell versus total load. Runs still use Quick log.
- Front/back muscle map shows weekly recorded set exposure, including assisting muscles. It is not a measure of hypertrophy or recovery. Tap a region to see history and comparable exercise results. Summary-only historical sessions cannot be assigned retrospectively without structured data.
- Input drafts autosave on the device. Completed-set logging remains explicit so unfinished work is not counted. Backups include custom movements.
- The app checks for published updates on opening, returning online, foregrounding, and every minute while visible. Downloaded updates apply on the home/progress screen; active workouts, forms and logging screens defer reload. Offline devices update after reconnecting. iOS background execution is not assumed.
- The existing app was subsequently divided into feature modules. `sw.js` cache version is bumped. Version appears at the bottom of the app. Existing users should open online once to receive this first update.

Automated checks cover new parsing and mapping, data compatibility and fractional-minute formatting. Browser rendering and physical iPhone behavior still require device verification.


## Version 2.1 — screenshot reader and local assistant

**Log → Ask the on-device assistant → Download & load model** loads SmolLM2-360M-Instruct (ONNX q8, about 363 MB of weights plus runtime files). Inference runs in a browser worker using WebAssembly, while the app is open. It is a text model; Tesseract handles images separately. No prompts or workout records are sent to an inference server. Model/runtime hosts see ordinary download requests.

The assistant receives relevant app guidance and optionally the last two workout logs. It has no write tools. It can make mistakes and is not a form checker or medical advisor. Stop / unload terminates the worker and releases model memory. OCR unloads the assistant to avoid running both together. Browser suspension may interrupt processing. Downloads may be cached or evicted; first use requires internet. No paid service or API key is required.

Pinned dependencies:
- Transformers.js 3.8.1: https://github.com/huggingface/transformers.js
- Model: https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX (revision fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9)
- Original model / license: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Tesseract.js 6.0.1 / core 6.0.0: https://github.com/naptha/tesseract.js

The model is a modest download-size choice, not a guarantee of accuracy or speed on every phone. Logic tests and native Tesseract experiments were run; browser inference, browser OCR and physical iPhone performance have not been verified. A download/runtime error leaves the normal workout app and built-in app guide available. Existing workout data and the storage key are preserved.

## Version 2.2 — System interface and weekly program

The updated interface uses compact workout rows (inspired by Strong) and a weekly training map (inspired by Hevy), with original blue System panels, Hunter rank and weekly quests. No artwork or source code from those apps is copied.

The supplied eight-week routine is available under Today and Train → Weekly quests:
Monday full body A, Tuesday easy run, Wednesday full body B, Thursday mobility, Friday quality run, Saturday full body C, Sunday rest. The image's inconsistent week labels are normalized to weeks 1–8. Easy-run durations use the two-week ranges in the main Run 1 panel. Tempo and intervals alternate. Generic bpm ranges are not personal zone measurements.

Each gym quest opens an overview with set targets and Swap controls. Alternatives preserve the training role, not equivalent load or biomechanics. Saved routine substitutions affect future sessions; active-session substitutions reset unrecorded values and cannot replace completed sets. Logging, not opening a plan, earns XP. Three planned sets are provided; partial sessions remain supported.

Schedule lets you set a Monday start and Dubai reminder time. Export reminders creates an ICS calendar with 56 dated events and 15-minute alerts. The user must import the file into a calendar and enable its notifications. Re-exporting can duplicate events; changes in the app do not edit imported events. In-app quest notices appear on first open each day. This static app does not run an independent push-notification server or promise delivery while closed.

### Source boundaries

- index.html: document shell and explicit script order.
- styles.css / system.css: base layout and System theme.
- app.js: existing workout, goals, profile and session behavior.
- storage.js: guarded local persistence and read-failure protection.
- catalog.js: exercises and custom routine editing.
- text-import.js / image-import.js: reviewed import paths.
- muscles.js / body-map.js: activity calculations and original interactive SVG anatomy.
- drafts.js: input drafts and backup validation.
- updates.js / sw.js: guarded update activation and release-level asset caching.
- assistant.js / assistant-worker.js: optional local model lifecycle.
- program.js: weekly program, alternatives and calendar export.
- bootstrap.js: initial render.

The legacy storage key remains unchanged. This is an incremental refactor, not a claim that all technical debt is gone. Existing global UI handlers remain for compatibility. Tests use simulated DOM and worker stubs; real Safari rendering, iOS calendar import and model performance still require device verification.

## Version 2.2.1 — lighter assistance and separate reminder times

The assistant now answers common app and workout questions from its local guide immediately. The optional on-device model is SmolLM2-135M-Instruct-ONNX, int8 (about 136 MB of weights, plus runtime). The model receives shorter prompts and produces shorter answers, reducing memory pressure, though iPhone memory and runtime performance remain unverified. The older 360M model is no longer loaded by the app; browser caches may retain previously downloaded files until iOS clears them.

The calendar schedule defaults to runs at 06:00 and gym at 18:00 Dubai time. Both are independently editable under Today → Schedule; recovery has a 19:00 reminder. Export a fresh calendar file after changing times. Previously imported calendar events are independent and need removal if you want to avoid duplicate alerts.


## Version 2.2.2 — your updated weekly schedule

The weekly quests are now Monday easy run, Tuesday gym A, Wednesday mobility/recovery, Thursday gym B, Friday quality run, Saturday home gym C, and Sunday rest. The Saturday routine uses chair squats, incline push-ups, band rows, glute bridges, band overhead presses, hanging knee raises and a side plank. It assumes only the barbell/plates, rack, adjustable bench, pull-up/dip station, bands and bodyweight you listed. If you already saved a Saturday replacement requiring a machine or dumbbells, the schedule displays the original home movement; it does not erase the saved replacement. Only home-compatible replacements are offered on Saturday. Logged sessions and completed quest keys are unchanged.

Calendar export follows the new day order at your saved gym and run reminder times. If you imported an older ICS file, remove its old events from your calendar before importing the new one; app updates cannot change already imported calendar entries.


## Version 2.3 — exercise alternatives and short bodyweight quests

Each gym quest (Tuesday A, Thursday B and Saturday home C) shows a named bodyweight option beside an exercise when one is available, and an **Alternatives** button that opens comparable choices. Some shoulder and pulling machine movements have no equivalent no-equipment replacement; the UI explicitly describes the substitute as a lighter pattern instead of claiming identical strength training. Home-gym Saturday alternatives remain limited to your equipment.

**Start short bodyweight quest** opens five familiar movement patterns with one set each: chair squat, push-up (scale to a wall if needed), prone back raise, glute bridge and a plank. No planned reps are marked complete. Record only actual sets and actual duration; finished short sessions count toward that day's weekly quest and consistency XP under the same daily cap. The full quest and saved exercise swaps stay available.

## Version 2.3.1 — quest logging fix and iPhone simplicity

Regular quest logging no longer redirects to profile setup. Gym quests open their set logger directly; run quests open their run form. Profile remains optional for ordinary logging and is still required for the guided assessments. An existing session with the same quest resumes; another quest cannot replace an unfinished session. Personalization values remain editable in Profile.

Today now puts the current quest and weekly schedule above an expandable muscle map. The interface uses iPhone system typography, grouped dark surfaces, standard blue actions and larger controls. Hunter rank and weekly quests remain.

Typing updates the in-memory draft immediately and batches disk persistence after 300 ms. Changes, navigation and page exit flush drafts. Muscle history is indexed once per screen instead of rescanned for each SVG region. Removed two redundant startup renders. These changes reduce storage writes and repeated computation; no measured iPhone speed improvement is claimed.

Regression checks cover incomplete profiles, ordinary gym/run logging, resumed sessions, guided assessment gating, and memory/disk draft behavior. Physical Safari rendering remains unverified; the available Chromium executable could not launch under this environment's socket restrictions.


## Version 2.4 — record on Garmin, import into a quest

A strength quest now has **Import Garmin workout**. Record the sets using Strength on the Instinct 2X, save and sync to Garmin Connect, then select the set-table screenshots from that quest. There is no Garmin account connection and the app cannot send a workout to the watch.

Choose up to eight screenshots at once, processed sequentially on the device, or use Add screenshots to append more. The importer groups exercises, retains set values, and saves the reviewed result as one strength session with the selected quest key. Overlapping rows are skipped only when their source set number and recognised values match; conflicting repeated set numbers are excluded pending review. Rows without readable source numbers are kept, so verify overlaps manually. Different detected weight units cannot be combined. Only the latest screenshot preview stays in memory.

Check the workout date, units and visible sets before saving. Total duration, RIR and missing loads are never invented. An activity summary with calories and heart rate has no exercise/rep/load table and cannot be used for muscle attribution. A blank live logger for the same quest is cleared after a successful import; a logger with completed sets must first be finished or discarded. Failed persistence leaves the import draft available.

Test coverage includes screenshot row merging, overlap/conflict handling, mixed-unit protection, quest completion credit, missing effort/duration handling and save failure recovery. Browser OCR accuracy and physical iPhone performance still depend on screenshot layout and device behavior.


## Version 2.5 — save fixes and structured Garmin file import

**Live logger fixes:** Save workout collects sets with reps entered, including sets not individually marked with +. Untouched planned sets stay out. RIR, load and total minutes may be unknown for ordinary sessions; assessment validation remains stricter. Gym sessions no longer use the home barbell's restricted weight increments. A failed final save restores the active session in memory and leaves a visible error instead of claiming success. Saving navigates directly to the muscle map.

**Simpler Garmin review:** One exercise match per group, remembered for future imports. Set values are in collapsible rows, date and units stay visible, and saving itself confirms the review; no separate confirmation checkbox. Unknown reps can remain unknown and still contribute a recorded set to muscle activity. No performance comparisons are made with missing reps/load/effort. Included unknown exercise names still require a match so muscles are not guessed. A confirmed kg/lb choice is remembered. Screenshots remain available as a fallback.

**Original FIT import:** Quest → Import Garmin workout → Choose Garmin .FIT file. The original activity file can be exported using the settings gear on the Garmin Connect website. Unzip an export in iPhone Files if necessary. File decoding runs in a worker with official @garmin/fitsdk 21.222.0, loaded from jsDelivr. It reads active strength sets, reps, scaled kg loads, source exercise names, activity date and elapsed duration; rest messages are omitted. It does not receive the Garmin account, send the file to a server, or infer missing exercises from the planned quest. Files without strength sets are rejected with a screenshot fallback. Original files may not contain exercise-name corrections later made in Connect. Review the names before saving.

Checks include whole-session save with missing effort/duration, unrestricted ordinary gym load, failed-save recovery, nullable import reps, remembered exercise matching and linked-quest saving. A local generated binary activity was encoded/decoded with Garmin's official SDK to verify active/rest separation, exercise naming, 45 kg loads, reps, activity date and elapsed minutes; a corrupted CRC was rejected. The CDN download and physical Safari behavior have not been verified in this environment.

Sources:
- Garmin activity export: https://support.garmin.com/en-SG/?faq=W1TvTPW8JZ6LfJSfK512Q8
- Official SDK / FIT Protocol license: https://github.com/garmin/fit-javascript-sdk
- Reader distribution: https://cdn.jsdelivr.net/npm/@garmin/fitsdk@21.222.0/src/index.js
