# Project Structure

## Overview

This project has been refactored with a proper scalable architecture:

- **Axios** for API requests with interceptors
- **Zustand** for state management (auth, listings, UI)
- **shadcn/ui** base components (Button, Input, Card, Dialog, Badge)
- **Path aliases** configured via Vite and TypeScript

## Folder Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (shadcn style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── index.ts
│   ├── auth-modal.tsx
│   ├── filter-panel.tsx
│   ├── listing-detail.tsx
│   ├── listing-form.tsx
│   ├── map-view.tsx
│   ├── navbar.tsx
│   ├── review-section.tsx
│   ├── saved-listings.tsx
│   └── star-rating.tsx
├── hooks/               # Custom React hooks
│   ├── use-auth.ts       # Auth operations with auto-fetch
│   ├── use-listings.ts   # Listings management hooks
│   └── index.ts
├── lib/                 # Utilities and configurations
│   ├── utils.ts         # cn(), format helpers, debounce
│   ├── constants.ts     # app constants
│   └── axios.ts         # Axios instance with interceptors
├── services/
│   └── api/             # API modules organized by feature
│       ├── auth.ts
│       ├── listings.ts
│       ├── reviews.ts
│       ├── saved.ts
│       └── index.ts
├── stores/              # Zustand stores
│   ├── auth-store.ts
│   ├── listings-store.ts
│   ├── ui-store.ts
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── app.tsx
├── main.tsx
└── index.css
```

## Usage Examples

### Using Stores

```tsx
import { use-auth-store, use-listings-store, useUIStore } from "@/stores";

// Auth
const { user, login, logout } = use-auth-store();

// Listings with selectors
const listings = use-listings((state) => state.listings);
const { fetchListings, createListing } = use-listings-store();

// UI
const { openauth-modal, closeauth-modal } = useUIStore();
```

### Using Hooks

```tsx
import { use-auth, use-listingsManager, uselisting-detail } from "@/hooks";

// Auth with auto-fetch
const { user, isAuthenticated, isLoading } = use-auth();

// Listings with automatic fetching
const { listings, filters, isLoading } = use-listingsManager();

// Single listing
const { listing, isLoading } = uselisting-detail(listingId);
```

### Using API Services

```tsx
import { listingsApi, authApi, reviewsApi, savedApi } from "@/services/api";

const listings = await listingsApi.getAll({ search: "district 1" });
const listing = await listingsApi.getById(id);
```

### Using UI Components

```tsx
import { Button, Input, Card, Dialog, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

// Button variants
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline" isLoading={loading}>Save</Button>

// Class merging
<div className={cn("base-class", conditional && "conditional-class")} />
```

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:

- `@/` -> `src/`
- `@/components/` -> `src/components/`
- `@/lib/` -> `src/lib/`
- `@/hooks/` -> `src/hooks/`
- `@/stores/` -> `src/stores/`
- `@/services/` -> `src/services/`

## Key Features

1. **Axios Interceptors**: Automatic token injection, error handling (401 redirects)
2. **Zustand Persistence**: Auth state persists to localStorage
3. **Type Safety**: Full TypeScript support with strict mode
4. **Component Composition**: shadcn/ui pattern for flexible components
5. **Store Selectors**: Performance optimized with granular subscriptions
