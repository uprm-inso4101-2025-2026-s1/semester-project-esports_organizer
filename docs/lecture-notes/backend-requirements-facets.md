# Lecture Topic Task – Backend Requirements Engineering & Requirements Facets

*Course context: Requirements Engineering & Requirements Facets (Lecture Topic Task, backend-focused)*

This document applies the lecture concepts of **Requirements Engineering** and **Requirements Facets** to the backend of the Esports Organizer / tournament platform. It focuses on the behavior of our backend services, Firebase/Firestore emulator, APIs, and scripts inside this repository.

The goal is to:

- Capture clear, testable backend requirements for the Esports Organizer system.
- Classify these requirements into **BPR**, **Domain**, **Interface**, and **Machine** facets.
- Provide concrete ideas for how each requirement can be validated (tests, checks, or metrics).

---

## 1. Lecture recap (backend perspective)

### 1.1 What is a requirement?

From the lecture, a **requirement** is a statement that specifies a property or behavior that the future system **must** or **shall** exhibit. It describes the **system-to-be**, not the current implementation. Good requirements:

- Use "must" or "shall" to express obligation.
- Are stated in terms of **what** the system does, not **how** it is implemented.
- Are **objectively testable** (there is a clear way to check whether each requirement holds).

In this document we apply that definition specifically to the **backend**: APIs, Firestore data, Firebase Functions, and supporting scripts in this repo.

### 1.2 Golden rule and ideal rule (for backend)

- **Golden rule**: Every requirement must be **objectively testable**.
  - For backend: a test can be an automated API test, an emulator integration test, a script that inspects Firestore state, a log/metric check, or a measurable performance threshold.

- **Ideal rule**: For each requirement, there should be at least one **test or validation procedure** explicitly linked to it.
  - For backend: we aim to link requirements to Jest/integration tests, Firebase emulator scripts (e.g. under `.github/esports-organizer/src/scripts`), or manual test procedures.

### 1.3 Requirements facets (short recap)

From the lecture, requirements can be grouped into **facets**:

- **BPR (Business Process Reengineering)**
  - Requirements that describe how the system will change, automate, or improve existing business processes.
  - Backend example: automating tournament creation and match scheduling that organizers used to do manually.

- **Domain requirements**
  - Describe **what** must hold in the **application domain**, often as domain rules, invariants, or capabilities.
  - Backend example: storing tournaments, teams, brackets, users, roles, communities correctly in Firestore.

- **Interface requirements**
  - Describe **how the machine and domain interact**, including:
    - Shared data: how domain data is initialized, synchronized, and updated.
    - Machine–machine / API interactions between frontend, backend, and external services.
  - Backend example: structure of API endpoints, Firestore document shapes, emulator seed/clear scripts.

- **Machine requirements**
  - Non-functional properties of the machine: performance, dependability, maintainability, platform constraints, documentation.
  - Backend example: response time for key APIs, how the system behaves under Firestore/network errors, logging.

In the rest of this document, we classify requirements for the Esports Organizer backend using these facets.

---

## 2. Backend domain requirements (WHAT the backend must support)

These requirements describe what the backend **must** store and support in the esports tournament domain. They are written from the backend perspective and use domain terminology (tournaments, teams, matches, brackets, players, organizers, roles, communities).

Each requirement below includes:

- **Type/Facet** – which facet(s) it belongs to.
- **Stakeholder(s)** – who cares about this requirement.
- **Test idea** – how we can verify it.

### DR-1: Store and retrieve complete tournament structures

- **Type/Facet**: [Domain]
- **Stakeholder(s)**: Tournament organizer, player, spectator
- **Description**: The backend **shall** store each tournament with its metadata (title, game, start time, location), participating teams/players, and full bracket structure (rounds, matches, participants, results) in Firestore so that the complete tournament state can be reconstructed from the database.
- **Test idea**: Use a seed script or API to create a tournament with a known bracket. Then read the tournament back (via a backend function, service, or direct Firestore query in the emulator) and assert that metadata, teams, matches, and bracket hierarchy match the expected fixture.

### DR-2: Persist and expose team membership

- **Type/Facet**: [Domain]
- **Stakeholder(s)**: Player, team captain, tournament organizer
- **Description**: The backend **must** maintain for each team a persistent list of members (players) and their roles (e.g., captain) so that team composition is consistent across tournaments and profile views.
- **Test idea**: Create a team and add players via a backend API or service. Query the team document/collection and verify that all members and roles are present. Update membership (e.g., remove a player) and verify that subsequent queries and dependent features (e.g., tournament registration) see the updated composition.

### DR-3: Record match results and keep standings/brackets consistent

- **Type/Facet**: [Domain]
- **Stakeholder(s)**: Tournament organizer, player, spectator
- **Description**: The backend **shall** record match results (scores, winner, loser, time) and update tournament state so that standings and brackets always reflect the latest valid result and no inconsistent states (e.g., two winners for the same match) are stored.
- **Test idea**: Simulate posting match results for a bracketed tournament in the emulator. After each result, verify that downstream matches are updated appropriately (e.g., winners advance) and that invalid operations (e.g., posting a conflicting winner for a finalized match) are rejected with a clear error and do not corrupt Firestore data.

---

## 3. Backend interface requirements (HOW backend and other components interact)

These requirements describe the interfaces between the backend and:

- The Firestore emulator (data initialization and updates).
- The frontend or other services (API contracts and function calls).

### IR-1: Seed and clear tournament data in the emulator

- **Type/Facet**: [Interface]
- **Stakeholder(s)**: Backend developer, QA engineer, tournament organizer (indirectly)
- **Description**: The backend **must** provide scripts or functions to initialize (seed) core tournament, team, and user data into the Firestore emulator and to clear this data, so that development and test environments can be reliably reset to a known state.
- **Test idea**: Run the seeding script (e.g., `npm run seed` or a specific backend script) against a clean emulator. Then query the emulator (via scripts in `src/scripts` or Firestore admin SDK) and assert that the expected collections/documents exist. Run the clear script and confirm that seeded collections are removed or reset.

### IR-2: API contract for joining a tournament

- **Type/Facet**: [Interface]
- **Stakeholder(s)**: Player, tournament organizer, frontend developer
- **Description**: The backend **shall** expose an API (HTTP endpoint or Firebase Function) for joining a tournament that:
  - Accepts a clearly defined request payload (e.g., tournament ID, team ID or player ID).
  - Validates eligibility (e.g., tournament is open, team size limits, no duplicate enrollment).
  - Returns a structured response indicating success or a clear error code/message on failure.
- **Test idea**: Write API integration tests that call the join endpoint with valid and invalid payloads. For valid requests, assert that enrollment data is written to the appropriate Firestore documents. For invalid conditions (e.g., tournament closed, duplicate enrollment), assert that no write occurs and that the API response contains a meaningful error code/message.

---

## 4. Backend machine requirements (non-functional backend properties)

These requirements describe non-functional constraints on the backend, focusing on **performance** and **dependability**.

### MR-1: Performance for reading tournament details

- **Type/Facet**: [Machine-Performance]
- **Stakeholder(s)**: Player, tournament organizer, spectator, frontend developer
- **Description**: Under normal emulator or development conditions, the backend **must** return tournament details (including bracket and participants) within **500 ms** for at least **95%** of `GET tournament` requests initiated by the frontend or test harness.
- **Test idea**: Implement a performance test (script or automated test) that performs repeated `GET tournament` operations against the emulator/development backend and measures response times. Verify that at least 95% of the responses complete within 500 ms. Outliers should be logged and investigated.

### MR-2: Dependable error handling for match result submission

- **Type/Facet**: [Machine-Dependability]
- **Stakeholder(s)**: Tournament organizer, player, system admin
- **Description**: The backend **shall** handle errors during match result submission (e.g., Firestore write failures, invalid input, conflicting updates) by:
  - Not committing partial or inconsistent writes to Firestore.
  - Returning a clear error response to the caller.
  - Logging enough information (e.g., tournament ID, match ID, error type) to support debugging.
- **Test idea**: Use emulator and tests to simulate Firestore errors or invalid payloads (e.g., missing required fields, conflicting match states). Verify that no inconsistent documents are written, that the API or function returns a structured error response, and that logs contain entries that can be correlated with the failed operation.

---

## 5. Stakeholders, facets, and tests summary

For traceability, every requirement above includes:

- **Stakeholder(s)** – the roles that benefit from or depend on the requirement (organizers, players, spectators, system admins, developers, QA).
- **Facet tag(s)** – classification into [Domain], [Interface], [Machine-Performance], [Machine-Dependability].
- **Test idea** – proposed validation method (automated test, emulator script, manual check, performance measurement).

This aligns with the lecture’s **golden rule** (objectively testable requirements) and **ideal rule** (link requirements to tests).

---

## 6. Relation to repository structure

This backend-focused requirements document is meant to guide and be cross-referenced with backend modules such as:

- `.github/esports-organizer/src/services/` – client-side and service modules interacting with the backend.
- `.github/esports-organizer/src/functions/` – Firebase Functions implementing backend logic (where applicable).
- `.github/esports-organizer/src/scripts/` – scripts for seeding, clearing, and verifying emulator data (e.g., `seedEmulator.js`, `clearEmulator.js`, `forceRecalc.js`).
- `database/` – domain models and Firestore representations used by the backend.

As the project evolves, new backend requirements should be added here and linked to concrete tests and implementation artifacts.
