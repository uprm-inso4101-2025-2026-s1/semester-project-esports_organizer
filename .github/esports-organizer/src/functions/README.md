# Bracket Recalculation Listeners

This folder contains Firebase Functions that listen for tournament domain events and enqueue recalculation jobs to keep brackets consistent and up-to-date.

Highlights
- Event-driven triggers for: matches, participants, seeding, and tournament settings.
- Per-tournament debounced queue with simple deduplication.
- Per-tournament lock to prevent concurrent recalculation.
- Retry with exponential backoff and alerting after repeated failures.
- Scope-based recomputation for single-elimination brackets: pre-start seeding + initial matchups, and downstream propagation in-progress.

Main modules
- `onMatchFinalized.js` — listens to `tournaments/{tid}/matches/{mid}` updates, enqueues events: MatchReported, MatchCorrected, MatchReverted, MatchFinalized.
- `participantsTriggers.js` — listens to `tournaments/{tid}/participants/{pid}` writes, enqueues: ParticipantAdded, ParticipantRemoved, ParticipantReplaced, SeedingUpdated.
- `seedingTriggers.js` — listens to `tournaments/{tid}/seeding/{sid}` writes, enqueues: SeedingUpdated.
- `settingsTriggers.js` — listens to tournament and settings updates, enqueues: TournamentSettingsUpdated.
- `adminCommands.js` — listens to admin command docs, enqueues: AdminForceRecalculate.
- `recalcQueue.js` — helper to enqueue events with best-effort dedupe.
- `recalcScheduler.js` — processes per-tournament queue with locking, backoff, and a scheduled drain.
- `recalc.js` — computes recalculation scope (full/seeding/partial) and performs recomputation (single-elim baseline).

Behavior summary
- Pre-start (status NOT_STARTED/SETUP): deterministically reseeds participants, generates initial matches (power-of-two bracket with byes auto-advanced), clears old matches to keep idempotent, and scaffolds downstream rounds.
- In-progress: when matches change (reported/corrected/reverted/finalized), winners are propagated only downstream. Corrections clear invalidated winners and cascade.
- Admin force: full recompute; pre-start behaves like seeding rebuild, in-progress performs global downstream propagation.

Local testing (Emulator)
1. Start the emulator and web app (from repo root) using the provided npm scripts.
2. Seed or interact with the app to produce events, or manually enqueue a force recalc using the helper script in `src/scripts/`.
3. Inspect queue and derived outputs using the `verifyQueue`/`verifyDerived` helper scripts.

Notes
- Current implementation targets single-elimination. Extending to double-elimination or custom formats will require enriching match documents with additional routing metadata and updating `recalc.js` accordingly.
