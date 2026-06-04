# Doskvol Portal — a Blades in the Dark campaign tracker

A real-time web app for running a [Blades in the Dark](https://bladesinthedark.com/) campaign at the table. The whole crew joins one campaign with a 4-digit code, claims a seat, and shares a live view of characters, the crew, factions, clocks, scores, and the map of Doskvol — every change syncs to everyone instantly.

Built for my own group's campaign, so it leans toward "fast to use during a session" over "exhaustive character builder."

> The actual application lives in [`app/`](app/). The PDFs in the repo root are the reference rulebook sheets the data is modeled from.

---

## Features

- **Characters** — full scoundrel sheets: the 12 action ratings, stress & trauma, harm & healing clock, armor, load & gear, coin/stash, the four XP tracks, special abilities (per playbook), contacts, and notes. Tracks who's playing each character ("Played by").
- **Crew** — crew type, tier & hold, rep, heat, wanted level, treasury, special abilities, upgrades, and claims (the per-crew-type claims map).
- **Scores** — run a heist through its lifecycle (planning → active → completed): target, plan & engagement position, payoff, heat/rep, and score-scoped clocks.
- **Clocks** — progress clocks (4/6/8/12 segments), long-term or score-scoped. The GM controls whether each is visible to players.
- **Factions** — the canonical Doskvol factions pre-loaded, with the −3…+3 status scale, tier, hold, and notes.
- **Map** — a draggable token/chip board over an uploadable map image of the city.
- **Overview** — an at-a-glance dashboard pulling the most important status from every section.

### Roles

You join either the single **GM** seat or a **player** seat (one per character). The GM gets campaign-wide controls — Setup Mode, reset, managing clocks/factions/crew, and sees hidden clocks; players edit their own character and see only what the GM has shared.

---

## Tech stack

- **React 19** + **TypeScript**, bundled with **Vite**
- **Tailwind CSS v4** + **shadcn/ui** components, **lucide-react** icons
- **Supabase** (Postgres + Realtime) for storage and live sync
- Path alias `@/` → `app/src/`

State is held in a React context (`GameProvider`); there's no page router — the top-level views are tabs.

### How sync works

Each campaign uses one Supabase Realtime channel with three layers:

1. **Broadcast** — instant fire-and-forget ops to peers for snappy updates.
2. **Postgres changefeed** — a durable backstop so a client that missed a broadcast still converges; an `updated_at` guard prevents stale echoes from reverting newer writes.
3. **Presence** — tracks who's online and which seat they hold.

Every entity (`characters`, `crews`, `factions`, `clocks`, `scores`, `map_tokens`) is one row in the Supabase `bitd` schema with a JSONB `data` column holding the full typed object. Field-level edits go through a `merge_entity` RPC that does a server-side shallow JSONB merge, so two people editing different fields of the same record don't clobber each other.

A brand-new, empty campaign auto-seeds with demo data (sample crew, characters, factions, clocks) on first open.

---

## Running locally

```bash
cd app
npm install

# configure Supabase credentials
cp .env.example .env
# then edit .env with your project's values

npm run dev
```

The app needs a Supabase project with the `bitd` schema and `merge_entity` RPC (see `app/supabase/`).

### Environment variables

| Variable                 | Description                  |
| ------------------------ | ---------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project API URL     |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key   |

These are inlined at build time by Vite, so they must be present when you build.

### Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR    |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally     |
| `npm run lint`    | Run ESLint                            |

---

## Deployment

Hosted on **AWS Amplify**, configured by [`amplify.yml`](amplify.yml). Amplify builds from the `app/` subdirectory: it runs `npm ci`, writes any `VITE_*` console variables into `.env` so Vite can inline them, runs `npm run build`, and publishes `app/dist`.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Amplify console before deploying. Pushing to `main` triggers a build.

---

## Project layout

```
app/
  src/
    components/        # top-level views: Overview, CharacterSheet, CrewSheet,
                       # FactionTracker, ClockDashboard, GameMap, ScorePanel,
                       # CharacterCreate, LoginGate
      trackers/        # focused sub-widgets (stress, harm, XP, clocks, coin, …)
      ui/              # shadcn/ui primitives
    lib/
      supabase.ts      # Supabase client (bitd schema)
      db.ts            # saveEntity / mergeEntity / load helpers
      store.tsx        # GameProvider context + realtime wiring
      session.tsx      # join-code auth, seats, presence
      types.ts         # entity types + game enums
      game-data.ts     # canonical factions, playbook/crew abilities, XP triggers
      demo-data.ts     # starter campaign seed
  supabase/            # schema / RPC reference
```
