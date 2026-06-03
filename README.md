# Accommodation Finder Web

Frontend client for Accommodation Finder, a React application for searching, viewing, saving, and managing accommodation listings.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Axios
- Auth0
- Leaflet / React Leaflet

## Getting Started

### Prerequisites

- Node.js
- npm

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a local environment file from the example:

```bash
cp .env.example .env
```

Then update the values:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_API_URL=http://localhost:3000
```

## Available Scripts

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
src/
├── components/      # Shared UI and feature components
├── config/          # Environment and app configuration
├── features/        # Feature-specific helpers and constants
├── hooks/           # Reusable React hooks
├── lib/             # Utilities and shared helpers
├── pages/           # Route-level pages
├── routes/          # App routing
├── schemas/         # Validation schemas
├── services/        # API clients
├── stores/          # Zustand stores
└── types/           # TypeScript types
```

## Path Aliases

The project uses `@/` as an alias for `src/`.

Example:

```ts
import { Button } from "@/components/ui";
import { listingsApi } from "@/services/api";
```

## Notes

- API requests are configured through `VITE_API_URL`.
- Auth is configured through Auth0 environment variables.
- Production assets are generated in `dist/`.
