# Frontend - React & Tailwind

## Stack
- **Build Tool:** Vite
- **UI Library:** React (TypeScript)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Routing:** React Router v7
- **Forms:** React Hook Form & Zod
- **Auth:** Auth0
- **Maps:** React Leaflet

## Frontend Conventions
- **Components:** Use functional components with hooks.
- **Styling:** Use Tailwind CSS utility classes. Prefer CSS variables for theme-consistent colors.
- **State:** Use Zustand for global state (stores located in `src/stores/`).
- **API Calls:** Use the centralized axios instance in `src/lib/axios.ts`.
- **Validation:** Use Zod schemas for form validation and API response validation.
- **Types:** Define shared types in `src/types/`.

## Workflow
- Use `npm run dev` for local development.
- Build with `npm run build`.

## UI/UX Standards
- Ensure responsive design for mobile and desktop.
- Use `sonner` for toast notifications.
- Follow the established design pattern in `src/components/ui/`.
