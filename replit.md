# Nimaya Trader

## Overview

Live Deriv trading dashboard built as a frontend-only React + Vite app inside a pnpm workspace monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite 7, Tailwind CSS, Radix UI, wouter, TanStack Query
- **Charts**: Recharts, Chart.js (with zoom + datalabels plugins)
- **Validation**: Zod (`zod/v4`)

## Artifacts

- `artifacts/nimaya-trader` — main web app (served at `/`)
- `artifacts/mockup-sandbox` — design/canvas sandbox

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/nimaya-trader run dev` — run the trader frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
