# Firebase Emulator Triggers for Match Updates (Local Dev Guide)

This guide shows how to run Firestore + Functions emulators, seed data, and verify the onUpdate trigger that reacts when a match status transitions to `FINAL`—all locally, no deploys.

> Run commands from the repository root (the folder that contains `package.json` and `firebase.json`) unless explicitly noted.

## Structure (JS only)
```
.github/esports-organizer/
  package.json           # frontend app (Vite)
  src/
    functions/
      package.json
      index.js           # exports { onMatchFinalized }
      onMatchFinalized.js# Firestore onUpdate trigger + lock + derived write
      recalc.js          # placeholder recalc()
    scripts/
      seedEmulator.js    # seeds sample tournament + matches
      markFinal.js       # sets a match status to FINAL
      verifyDerived.js   # prints tournaments/{tid}/derived/bracket

firebase.json             # functions.source -> .github/esports-organizer/src/functions
.firebaserc               # default: demo-esports-organizer
```

## Prerequisites
- Node.js 18+
- Java 11+ (required by Firestore emulator)
  - On macOS (Homebrew):
    - `brew install openjdk@17`
    - `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` (add to `~/.zshrc`)
- Firebase CLI (already a devDependency at the repo root: `firebase-tools`)

## Install deps
From the repo root:

```zsh
# Install root tools + Cloud Functions deps
npm run setup

# Alternatively:
# 1) root deps
npm ci
# 2) Cloud Functions deps
npm --prefix .github/esports-organizer/src/functions ci
```

Tip: If you happen to `cd` into `.github/esports-organizer`, the relative prefix above changes:
```zsh
# when your CWD is .github/esports-organizer
npm --prefix ./src/functions ci
```

## Start dev stack (Emulators + Frontend)
Root emulator ports (from repo root `firebase.json`):
- Firestore: 127.0.0.1:58180
- Functions: 127.0.0.1:5002
- Emulator UI: 127.0.0.1:4000

Recommended single command (starts emulators + Vite):
```zsh
npm run dev
```
Open the Emulator UI:
```zsh
npm run ui
```

Optional: start only the emulators (no frontend):
```zsh
npm run emulator:start
```

## Seed sample data
Open a second terminal while emulators are running:
```zsh
npm run seed
```
This creates tournament `tourn_demo_1` and matches `m1`, `m2`, `m3`.

What the "seed" is and why:
- Purpose: purely for local testing and demos until real tournament data shows up in Firestore.
- Scope: writes sample docs to the Firestore Emulator only (never touches production).
- Safety: idempotent to run as needed; use it to reset the demo dataset before testing triggers again.
- IDs: uses a fixed tournament ID (`tourn_demo_1`) so other scripts can reference it consistently.

## Trigger the function and verify
```zsh
# Flip a match to FINAL (defaults to tourn_demo_1 m2)
npm run mark:final

# Verify derived doc was written
npm run verify:derived
```
Expected output includes a JSON with `lastRecalcAt`, `sourceMatchId`, and `updatedBy`.

### Scripts overview (what each script does)
- seed
  - Populates the Firestore Emulator with a demo tournament (`tourn_demo_1`) and 3 matches (`m1`, `m2`, `m3`).
  - Usage:
    ```zsh
    npm run seed
    ```
- mark:final
  - Sets a match status to `FINAL` to simulate a completed game and trigger the function.
  - Defaults: tournament `tourn_demo_1`, match `m2`.
  - Usage:
    ```zsh
    # default ids
    npm run mark:final
    # custom ids: npm run mark:final -- <tournamentId> <matchId>
    npm run mark:final -- tourn_demo_1 m3
    ```
- verify:derived
  - Reads and prints the derived bracket document written by the trigger: `tournaments/{tid}/derived/bracket`.
  - Usage:
    ```zsh
    # default tournament
    npm run verify:derived
    # custom tournament id
    npm run verify:derived -- tourn_demo_1
    ```
- clear:lock
  - Deletes the lightweight lock at `tournaments/{tid}/internal/recalc_lock` used to avoid duplicate concurrent recalcs.
  - Run if you suspect a stuck lock during local testing.
  - Usage:
    ```zsh
    npm run clear:lock
    ```
- emulator:start / dev / ui
  - emulator:start: runs Firestore + Functions emulators only.
  - dev: starts emulators + the frontend (Vite) together for a unified local environment.
  - ui: prints and opens the Emulator UI at http://127.0.0.1:4000.
  - Usage:
    ```zsh
    npm run emulator:start
    npm run dev
    npm run ui
    ```

## Troubleshooting
- Duplicate path ENOENT for functions package.json
  - Symptom:
    - `ENOENT: no such file or directory, open '.../.github/esports-organizer/.github/esports-organizer/src/functions/package.json'`
  - Cause: running `npm --prefix .github/esports-organizer/src/functions ...` while your CWD is already `.github/esports-organizer` duplicates the path.
  - Fix:
    - Run from repo root:
      ```zsh
      npm --prefix .github/esports-organizer/src/functions ci
      ```
    - Or, when inside `.github/esports-organizer`:
      ```zsh
      npm --prefix ./src/functions ci
      ```
    - Or just use:
      ```zsh
      npm run install:functions
      ```

- Emulator ports busy / won’t start
```zsh
# Check listeners
lsof -iTCP -sTCP:LISTEN -n | egrep ":(58180|5002|4000)\s" || true
# Free ports (or simply re-run the unified dev command which does this automatically)
npm run dev
```

- Java not found: install OpenJDK and set JAVA_HOME as shown above, then retry.

## Notes
- If you need any help please DM me on Discord (Yeudiel).
- Everything here is for local testing purposes; when real tournament data flows into Firestore, these scripts serve as examples/reference for how the trigger behaves.
- The trigger is intentionally minimal—no real bracket logic yet.
- Lock doc path: `tournaments/{tid}/internal/recalc_lock` prevents duplicate concurrent recalcs.
- You can edit code under `.github/esports-organizer/src/functions` and restart the emulators to reload.
