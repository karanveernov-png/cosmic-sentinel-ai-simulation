# Cosmic Sentinel AI — Frontend

**From Space Signals to Earth Safety**

A frontend-only React + TypeScript application built for the GRAVITON national
hackathon. It demonstrates an AI-powered space-to-Earth incident intelligence
platform whose central idea is:

> Individual alerts can be important. Understanding their relationships can be
> even more important.

This repo is **only the frontend**. It runs entirely on an in-memory mock
dataset today, and is structured so that swapping in the real FastAPI backend
later requires no changes to any page or component — see
[Connecting the real backend](#connecting-the-real-backend) below.

---

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks (tsc -b) and produces a production build in dist/
npm run test      # runs the Vitest suite (engine + component tests)
npm run lint      # oxlint
```

Node 20+ recommended.

---

## What's here

| Area | Where |
|---|---|
| 8 routed pages (Overview, Incident Intelligence, Compound Intelligence, Space Weather, Earth Disasters, Communications, Response Planning, System Sources) | `src/pages/` |
| Deterministic, documented **Compound Threat Intelligence Engine** | `src/engine/` |
| Data-provider pattern (mock today, HTTP-ready) | `src/providers/` |
| Mock demonstration dataset, clearly labelled as such everywhere in the UI | `src/data/` |
| Shared app state (incidents, activity, live compound relationships) | `src/context/AppDataContext.tsx` |
| Interactive Leaflet map with a real tile-unavailable fallback | `src/components/maps/IncidentMap.tsx` |
| Printable response report (`window.print()` → Save as PDF) | `src/pages/ResponsePlanningPage.tsx` |
| Unit tests proving the 3 required demo scenarios behave correctly | `src/engine/*.test.ts` |

## The Compound Threat Intelligence Engine

This is the project's central differentiator, and it's implemented as a pure,
synchronous, fully documented TypeScript module with no hidden state —
`src/engine/compoundThreatEngine.ts` + `src/engine/scoringConfig.ts`.

Given two incidents, `scoreCompoundPair()` returns a full `ScoreBreakdown`:
a base score, every rule that was checked (triggered or not) with its point
value and a plain-English explanation, a final clamped score (0–100), and a
derived priority. Nothing here is a trained model — it is a transparent,
inspectable rule set, and the UI says so.

**The one guarantee the whole app leans on:** every rule *except* geographic
overlap itself requires geographic overlap to have already triggered. An
incident with no geographic relationship to another can only ever receive a
net adjustment of zero — never a bonus, never a penalty. That's what makes
"an outage in an unrelated region does not escalate a flood warning
elsewhere" true by construction, not just by convention. It's covered by
tests in `compoundThreatEngine.test.ts`.

Three demonstration scenarios (`src/engine/scenarioBuilder.ts`) run real mock
incidents through this exact engine and reliably produce a clear gradient:

- **Related** (flood + confirmed comms outage, same region): score **98**, Critical
- **Uncertain** (flood + unverified comms report, same region): score **72**, High
- **Unrelated** (flood in Region A + outage in Region B): score **62** — unchanged from the flood's own base severity

A second, independent function — `detectCompoundGroups()` in
`compoundDetection.ts` — runs the same engine live across the *entire*
current incident set (not just the three fixed scenarios), which is what
powers the Overview page's compound panel and what re-evaluates everything
after the "Simulate Communication Outage" action on the Communications page.

## Data-provider architecture (backend-ready)

No page or component ever imports mock data or a provider directly. The call
chain is always:

```
Page component → services/*.ts → providers/index.ts (activeDataProvider) → mockDataProvider | httpDataProvider
```

`src/providers/dataProvider.ts` defines the `DataProvider` interface.
`mockDataProvider.ts` implements it against the in-memory dataset in
`src/data/`. `httpDataProvider.ts` implements the exact same interface
against a configurable FastAPI backend via `src/services/api/apiClient.ts`.

### Connecting the real backend

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_DATA_PROVIDER=http` and `VITE_API_BASE_URL` to the backend's
   base URL.
3. That's it — restart `npm run dev`. Every page keeps working unchanged
   because it only ever talked to the `DataProvider` interface.

The proposed REST endpoints in `httpDataProvider.ts` are a starting
suggestion, not a fixed contract — adjust the paths to match whatever the
backend team actually ships. The important part is the return types: keep
them matching `src/types/*.ts` and the frontend needs no further changes.
The backend can also become the authoritative source of `ScoreBreakdown` —
the UI renders whatever breakdown it's given, whether computed locally by
`scoreCompoundPair()` or returned from the backend.

## Design notes

- Dark, restrained space-operations aesthetic — deep navy surfaces, a single
  cyan accent, amber/red/green used strictly semantically (warning / critical
  / healthy), not decoratively. No gradients-as-wallpaper, no fake terminal
  text, no everything-glows.
- Map markers use CSS-shape `div` icons (circle / diamond / triangle /
  square) keyed to category, colored by priority — no external icon image
  assets to break in a bundler.
- If map tiles can't be reached (offline demo environment, blocked network),
  the map shows an explicit "tiles unavailable" state with the same incident
  data as a list, rather than a blank or broken map.
- The interface clock is the browser's real local time — nothing is
  hardcoded, and relative incident timestamps (`formatRelativeTime`) are
  computed from real `Date` math.
- Verification status (verified / unverified / simulated) is tracked
  completely independently from priority, per the spec — a simulated
  incident can carry a high demonstration priority without being conflated
  with a real one.

## Project structure

```
src/
  app/            App.tsx, router.tsx
  components/
    layout/       Sidebar, Header, AppLayout
    dashboard/    MetricCard, ActivityFeed, CompoundThreatPanel, ScoreBreakdownPanel, StatusStrip
    incidents/    IncidentDetailPanel
    maps/         IncidentMap (React Leaflet + fallback)
    charts/       KpTrendChart (Recharts)
    shared/       Badges (priority / verification / data-status / compound)
  pages/          One file per route, listed above
  engine/         compoundThreatEngine, scoringConfig, scenarioBuilder,
                  compoundDetection, responsePlanBuilder (+ *.test.ts)
  providers/      dataProvider (interface), mockDataProvider, httpDataProvider, index
  services/       incidentService, intelligenceService, responseService, sourceService
  context/        AppDataContext (shared incidents/activity/live compound state)
  hooks/          useClock, useAsyncData
  types/          incident, intelligence, response, source, api
  data/           mockIncidents, mockSpaceWeather, mockSources, mockActivity
  utils/          time (relative-timestamp resolution + formatting), format (enum labels)
  config/         environment.ts (provider selection)
  styles/         global.css (design tokens + primitives)
```

## Known limitations (intentional, for an MVP)

- The mock "Simulate Communication Outage" action picks a random demo
  region; it's meant to show the live recalculation workflow, not to be a
  realistic incident generator.
- The map's tile-availability check uses a 5-second heuristic (any
  successful tile load within 5s = available). Good enough for a demo
  environment; a production build would want a more robust check.
- No authentication — out of scope per the project brief.
- Bundle size triggers Vite's default 500kB chunk warning (Leaflet +
  Recharts are the bulk of it). Fine for a hackathon demo; a follow-up pass
  could lazy-load the map and chart routes with `React.lazy`.
