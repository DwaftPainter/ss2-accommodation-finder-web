# UI Standardization

This app uses React, Vite, Tailwind CSS v4, and a small local UI layer in `src/components/ui`.

## Design Tokens

- Primary color: emerald/teal (`emerald-500`, `emerald-600`, `teal-600`)
- Backgrounds: `bg-slate-50` for app pages, `bg-white` for cards/modals
- Text: `text-slate-950` for headings, `text-slate-700` for body, `text-slate-500` for secondary copy
- Borders: `border-slate-200`
- Radius: `rounded-lg` for controls, `rounded-xl` for cards and panels
- Shadows: prefer `shadow-sm`; reserve stronger shadows for overlays/modals
- Focus: visible emerald focus rings for keyboard navigation

## Layout Rules

- Use `SectionContainer` for page content width and responsive padding.
- Use `PageHeader` for screen and section headings.
- Keep page backgrounds light and consistent with `AppSurface` or `bg-slate-50`.
- Use mobile-first grids: 1 column on mobile, then 2/3/4 columns at larger breakpoints.
- Avoid horizontal overflow; horizontal carousels should use `scrollbar-hide`.

## Reusable Components

- `Button`: primary, secondary, outline, ghost, destructive, link, loading, disabled
- `Input`: default text input styling with consistent focus state
- `Card`: white surface with consistent border, radius, and shadow
- `Badge`: neutral, success, warning, destructive, outline
- `FormField`: label, helper text, and error text wrapper
- `LoadingState`, `EmptyState`, `ErrorState`: consistent async states
- `ListingCard`, `ListingGrid`: standard accommodation card and responsive grid
- `Dialog` and auth/listing modals should use the same white surface, radius, and hidden scrollbar pattern

## Forms

- Labels use `text-sm font-medium text-slate-700`.
- Inputs use 44px minimum height, `rounded-lg`, white background, slate border, emerald focus ring.
- Errors use `text-xs text-rose-600`.
- Place primary submit actions at the bottom right on desktop and full width on mobile.

## Listing UI

- Listing images use square or fixed aspect-ratio containers with `object-cover`.
- Prices use `₫` and `formatListingPrice`.
- Location text uses `formatAddress`.
- Rating uses an amber star with one decimal when available.
- Listing cards should be clickable articles, with real buttons for save/share actions.

## Accessibility

- Use real `button` elements for actions.
- Inputs must have visible labels or explicit `aria-label`.
- Images need meaningful `alt` text.
- Keep focus states visible and do not remove outlines without replacement.
