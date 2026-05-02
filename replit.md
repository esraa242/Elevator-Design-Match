# Elevator Cabin Matcher — AI Lead Magnet

## Overview

A production-ready AI-powered lead magnet tool for an elevator installation company. Visitors upload an interior photo, the AI analyzes their design style, and matches them to the best elevator cabin design — then converts them into a WhatsApp lead.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (at root `/`)
- **API framework**: Express 5 (at `/api`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **AI**: OpenAI GPT-5 vision via Replit AI Integrations (no key needed)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Artifacts

### Frontend: `artifacts/elevator-matcher/` (preview path: `/`)
- Single-page multi-step flow: Upload → AI Analysis → Results → WhatsApp Lead
- Dark luxury aesthetic with gold accents matching the reference design
- Circular match score gauge, spec annotation lines, animated transitions
- WhatsApp CTA with pre-filled message

### API Server: `artifacts/api-server/` (preview path: `/api`)
- `GET /api/cabins` — list all 6 pre-stored cabin designs
- `GET /api/cabins/:id` — get single cabin
- `POST /api/analysis/match` — AI vision analysis + matching (accepts base64 image)
- `POST /api/leads` — capture lead (name + WhatsApp phone)
- `GET /api/leads/stats` — lead analytics
- `GET /api/cabins/images/*.png` — serves AI-generated cabin images

## Database Schema

- `cabins` — 6 elevator cabin designs with specs and image URLs
- `leads` — captured leads with name, phone, cabin match, and score
- `conversations` + `messages` — OpenAI integration scaffolding

## Cabin Designs

1. Modern Luxury Cabin — Carrara marble, LED, black marble floor
2. Classic Royal Cabin — Walnut wood, crystal chandelier, brass
3. Contemporary Minimal Cabin — Glass panels, chrome, porcelain
4. Industrial Chic Cabin — Dark steel, concrete, Edison bulbs
5. Art Deco Prestige Cabin — Black lacquer, 24K gold geometric
6. Scandinavian Nordic Cabin — Birch wood, white lacquer, oak

## AI Integration

Uses `@workspace/integrations-openai-ai-server` with GPT-5.1 vision model.
Set up via Replit AI Integrations — no API key required.
Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
