# Doskvol Portal — app

This is the web app for the Blades in the Dark campaign tracker. For the full project overview (features, architecture, sync model, deployment), see the [root README](../README.md).

## Quick start

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev
```

## Scripts

| Command           | What it does                               |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Vite dev server with HMR                   |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally         |
| `npm run lint`    | Run ESLint                                 |

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · shadcn/ui · Supabase (Postgres + Realtime). Path alias `@/` → `src/`.

See [`src/lib/`](src/lib/) for the data layer (`db.ts`, `store.tsx`, `session.tsx`) and [`src/components/`](src/components/) for the views.
