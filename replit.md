# Elevator Cabin Matcher — AI Lead Magnet SaaS Platform

## Overview

A production-ready multi-tenant SaaS platform for an AI-powered elevator design tool. Elevator companies get an embeddable widget, brand customization, cabin design control, WhatsApp leads, usage tracking dashboard, and subscription-based usage limits.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **AI**: OpenAI GPT-4.1 vision via Replit AI Integrations
- **API codegen**: Orval (contract-first OpenAPI)
- **Object Storage**: Replit Object Storage (GCS-backed, presigned URL upload flow)
- **Build**: esbuild

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Artifacts

### Frontend Elevator Matcher: `artifacts/elevator-matcher/` (preview path: `/`)
- Single-page multi-step flow: Upload → AI Analysis → Results → WhatsApp Lead
- Dark luxury aesthetic with gold accents
- Circular match score gauge, spec annotation lines, animated transitions
- WhatsApp CTA with pre-filled message

### SaaS Dashboard: `artifacts/dashboard/` (preview path: `/dashboard`)
- Dark gold luxury UI; React + Vite + Wouter + TanStack Query
- Pages: overview, cabins, leads, branding, widget-embed, usage
- Auth: token = base64(`${tenantId}:${sha256(password+SESSION_SECRET)}`), stored in localStorage as `em_token`
- WouterRouter base = `import.meta.env.BASE_URL.replace(/\/$/, "")` → resolves to `/dashboard`
- Cabin management: add with drag-and-drop image upload OR URL, enable/disable, delete
- Demo: demo@ascend.com / demo1234 (pro plan, 500 req/mo, 6 cabins, 5mo usage history)

### API Server: `artifacts/api-server/` (preview path: `/api`)
- `GET /api/cabins` — list cabin designs (public)
- `GET /api/cabins/:id` — get single cabin
- `POST /api/analysis/match` — AI vision analysis + matching
- `POST /api/leads` — capture lead
- `GET /api/tenants/login` / `POST /api/tenants/register` — auth
- `GET /api/tenants/me` / `PATCH /api/tenants/me` — profile
- `GET /api/tenants/me/cabins` / `PATCH /api/tenants/me/cabins/:id` — cabin toggle
- `POST /api/admin/cabins` / `DELETE /api/admin/cabins/:id` — cabin CRUD
- `GET /api/tenants/me/leads` — leads list
- `GET /api/tenants/me/usage` — usage history
- `POST /api/storage/uploads/request-url` — presigned GCS URL for direct upload
- `GET /api/storage/objects/:path` — serve uploaded objects
- `GET /api/widget/widget.js` — embeddable widget JS

## Object Storage Upload Flow

1. Client → `POST /api/storage/uploads/request-url` with `{name, size, contentType}` (JSON only, no file)
2. Server returns `{uploadURL, objectPath}` — uploadURL is a presigned GCS URL
3. Client → `PUT uploadURL` with the file bytes directly to GCS
4. Store `objectPath` in DB; serve via `GET /api/storage/objects/:path`
5. Dashboard cabins page: Upload File tab (drag-and-drop zone) or Image URL tab

## Database Schema (lib/db/src/schema/)

- `cabins` — elevator cabin designs with specs, image URLs, tags
- `tenants` — SaaS customers with plan, whatsapp, branding settings
- `tenantCabins` — join table: which cabins each tenant has enabled
- `leads` — captured leads with cabin match and score
- `usageEvents` — per-month usage tracking per tenant

## API Codegen Notes

- OpenAPI spec lives in `lib/api-spec/openapi.yaml`
- Orval zod output uses `mode: "single"` (generates `lib/api-zod/src/generated/api.ts`)
- `lib/api-zod/src/index.ts` exports only from `./generated/api` (no api.schemas)
- React-query client uses `mode: "split"` in `lib/api-client-react`

## Tenant Auth Pattern

```
token = base64(`${tenantId}:${sha256(password + SESSION_SECRET)}`)
```
Stored in localStorage as `em_token`. `requireAuth` middleware exported from `routes/tenants.ts`.
