# Monorepo Structure

Complete reference for the Mantra monorepo organization.

---

## Overview

```
mantra/
├── apps/                        # Runnable applications
│   ├── frontend/                # React SPA (Vite)
│   └── backend/                 # Node.js API (future)
├── packages/                    # Shared libraries
│   ├── shared-types/            # TypeScript types
│   └── api-client/              # Typed fetch client (future)
├── supabase/                    # Supabase infrastructure
├── docs/                        # Documentation (future)
└── Root config files
```

---

## Apps

### Frontend (`apps/frontend/`)

**Runnable React SPA built with Vite**

```
apps/frontend/
├── src/
│   ├── components/              # React components
│   ├── data/                    # API hooks & repo layer
│   ├── pages/                   # Page components
│   ├── types/                   # Local type definitions
│   ├── lib/                     # Utilities
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # React Context
│   ├── layouts/                 # App layouts
│   ├── test/                    # Test setup
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── vite.config.ts               # Build configuration
├── tsconfig.json                # TypeScript config
├── components.json              # shadcn CLI config
└── package.json
```

**Key Commands**:
```bash
npm run dev              # Start dev server (port 8080)
npm run build            # Production build
npm run preview          # Preview production
npm run test             # Run tests
npm run lint             # Lint code
```

**Entry Point**: `http://localhost:8080`

### Backend (`apps/backend/`)

**Planned Node.js API server**

```
apps/backend/
├── src/
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Auth, validation, errors
│   ├── services/                # Business logic
│   ├── db/                      # Database queries
│   ├── lib/                     # Utilities
│   ├── types/                   # Local extensions
│   └── index.ts                 # Server entry point
├── migrations/                  # SQL migrations
├── tests/                       # Test files
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment template
└── package.json
```

**Planned Commands**:
```bash
npm run dev              # Start dev server (port 3001)
npm run build            # Build for production
npm start                # Start production server
npm run test             # Run tests
```

---

## Packages

### Shared Types (`packages/shared-types/`)

**Shared TypeScript definitions used by frontend & backend**

```
packages/shared-types/
├── src/
│   ├── index.ts                 # All exports
│   ├── types/                   # Type definitions
│   │   ├── user.ts
│   │   ├── client.ts
│   │   ├── matter.ts
│   │   └── ...
│   └── utils.ts                 # Helper functions
├── package.json                 # Private package
└── tsconfig.json
```

**Usage**:
- **Frontend**: `import { Client } from "@/types";`
- **Backend**: `import { Client } from "@mantra/shared-types";`

**Key Types**:
- `User`, `Role`, `AuthResponse`
- `Client`, `CreateClientInput`, `UpdateClientInput`
- `Matter`, `MatterStatus`
- `Invoice`, `InvoiceStatus`
- `Timesheet`
- `Collaborator`
- `FirmSettings`
- Helper functions: `isAdminRole()`, `formatRole()`, `getRolePermissions()`

### API Client (`packages/api-client/`)

**Typed fetch client for backend API** (future)

```
packages/api-client/
├── src/
│   ├── index.ts                 # Main export
│   ├── client.ts                # API client factory
│   ├── endpoints/               # Typed endpoint definitions
│   └── types.ts                 # Client-specific types
├── package.json
└── tsconfig.json
```

**Future Usage**:
```tsx
import { createApiClient } from "@mantra/api-client";

const api = createApiClient({
  baseUrl: "http://localhost:3001",
  token: authToken,
});

const clients = await api.clients.list();
const client = await api.clients.create({ name: "..." });
```

---

## Supabase

### Configuration (`supabase/`)

```
supabase/
├── functions/                   # Serverless Edge Functions (Deno)
│   ├── r2-sign-put/             # Generate R2 upload URLs
│   ├── r2-sign-get/             # Generate R2 download URLs
│   └── _shared/                 # Shared utilities
├── migrations/                  # SQL migrations
├── config.toml                  # Supabase project config
└── seed.sql                     # Seed data (optional)
```

**Edge Functions** handle:
- File upload signing (Cloudflare R2)
- File download signing
- Webhooks (future)
- Scheduled tasks (future)

---

## Root Configuration

### Key Files

```
.env.example                     # Environment variables template
.gitignore                       # Git ignore rules
package.json                     # Root workspace config
.eslintrc.cjs                    # ESLint configuration
tsconfig.json                    # Root TypeScript config
README.md                        # Project overview
ARCHITECTURE.md                  # Architecture guide
DEVELOPMENT.md                   # Development guide
MONOREPO.md                      # This file
```

### npm Workspaces

The project uses npm workspaces (can upgrade to pnpm):

```json
{
  "name": "mantra",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**Benefits**:
- Single `npm install` installs all apps
- Shared `node_modules`
- Cross-workspace dependency resolution
- Version consistency

**Usage**:
```bash
# Install all workspaces
npm install

# Run script in specific workspace
npm run -w apps/frontend dev
npm run -w apps/backend build

# Run script in all workspaces
npm run -w '*' test
```

---

## Dependency Management

### Shared Dependencies

Installed at root (accessible to all apps):

```json
{
  "devDependencies": {
    "typescript": "^5.8.3",
    "eslint": "^9.32.0"
  }
}
```

### App-Specific Dependencies

Each app has its own `package.json`:

**Frontend** (`apps/frontend/package.json`):
- React, React Router, TanStack Query
- Tailwind CSS, shadcn/ui
- Vite, Vitest

**Backend** (`apps/backend/package.json`):
- Express or Hono
- Drizzle ORM
- Supabase client

---

## Build & Deploy

### Development

Start everything locally:

```bash
# Terminal 1: Frontend
npm run -w apps/frontend dev

# Terminal 2: Backend (when ready)
npm run -w apps/backend dev

# Terminal 3: Supabase (if local)
supabase start
```

### Production

```bash
# Build frontend
npm run -w apps/frontend build

# Build backend
npm run -w apps/backend build

# Deploy frontend (Vercel)
cd apps/frontend && vercel deploy

# Deploy backend (Supabase, Fly.io, etc.)
cd apps/backend && fly deploy
```

---

## Adding New Workspace

### New App

```bash
# Create directory
mkdir -p apps/newapp

# Create package.json
cd apps/newapp
npm init -y

# Add to root workspaces (automatic with npm v8+)
npm install
```

### New Package

```bash
# Create directory
mkdir -p packages/newpkg/src

# Create package.json
cd packages/newpkg
npm init -y

# Add to root workspaces
npm install
```

---

## File Organization Best Practices

### Import Paths

Use workspace aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@mantra/shared-types": ["../../packages/shared-types/src"],
      "@mantra/api-client": ["../../packages/api-client/src"]
    }
  }
}
```

Then import normally:

```ts
// Frontend
import { Client } from "@/types";
import { useClients } from "@/data/hooks";
import { Button } from "@/components/ui/button";

// Backend
import { Client } from "@mantra/shared-types";
```

### Avoiding Circular Dependencies

```
✅ Frontend → Shared Types
✅ Backend → Shared Types
❌ Frontend → Backend (direct)
❌ Backend → Frontend
```

Use types only from `@mantra/shared-types` for cross-app communication.

---

## Common Tasks

### Update Dependencies

```bash
# All apps
npm update

# Single app
npm update -w apps/frontend

# Check for outdated packages
npm outdated -w apps/frontend
```

### Run Tests

```bash
# All
npm run test

# Frontend only
npm run -w apps/frontend test

# Backend only
npm run -w apps/backend test
```

### Run Linter

```bash
# All apps
npm run lint

# Frontend
npm run -w apps/frontend lint
```

### Add Dependency to Specific App

```bash
# Frontend
npm install -w apps/frontend react-query

# Backend
npm install -w apps/backend express
```

---

## CI/CD Workflow

### GitHub Actions (Planned)

```
Push to main
  ├─ Lint code
  ├─ Run tests (frontend + backend)
  ├─ Build frontend
  ├─ Build backend
  ├─ Deploy frontend (Vercel)
  └─ Deploy backend (Supabase/Fly.io)
```

### Branch Strategy

```
main                    # Production (protected)
  ↑
develop                 # Integration
  ↑
feat/feature-name       # Feature development
fix/bug-name            # Bug fixes
chore/maintenance       # Maintenance
```

---

## Migration Path

### Phase 1: Current State ✓
- Frontend: Fully functional with mocked data
- Backend: Supabase setup only

### Phase 2: Backend API
- Implement backend endpoints
- Create database migrations
- Add authentication

### Phase 3: Integration
- Replace mock data with API calls
- Add E2E tests
- Deploy to production

### Phase 4: Enhancement
- PDF generation
- Email integration
- Advanced reporting

---

## Troubleshooting

### Clean Install

```bash
# Remove all node_modules and lock files
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm package-lock.json

# Reinstall everything
npm install
```

### Workspace Resolution Issues

```bash
# Rebuild workspace symlinks
npm install

# Or upgrade npm
npm install -g npm@latest
```

### TypeScript Errors

```bash
# Check all workspaces
npm run -w '*' type-check

# Or per app
npx tsc -w apps/frontend --noEmit
```

---

## Resources

- [npm Workspaces Docs](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**Last Updated**: March 2026
