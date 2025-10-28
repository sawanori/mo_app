# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a mobile-friendly restaurant ordering system built with Next.js 13.5. The application consists of a customer-facing ordering interface and an admin dashboard for order management. It uses static export (SSG) for deployment as a static site.

## Technology Stack

- **Framework**: Next.js 13.5 with App Router
- **Language**: TypeScript 5.2
- **UI Components**: Radix UI with custom components via shadcn/ui
- **State Management**: Zustand with persistence middleware
- **Styling**: Tailwind CSS 3.3 with animations
- **Forms**: React Hook Form with Zod validation
- **Theme**: Dark mode support via next-themes
- **Charting**: Recharts for admin dashboards
- **Export**: Static HTML export via `output: 'export'`

## Project Structure

```
app/
  ├── page.tsx                 # Home page (menu & hero section)
  ├── layout.tsx               # Root layout with theme & toaster
  ├── payment/page.tsx         # Payment page
  ├── cart/page.tsx            # Cart/checkout page
  ├── account/page.tsx         # User account page
  ├── order-history/page.tsx   # Order history page
  ├── admin/                   # Admin dashboard (auth-protected)
  │   ├── layout.tsx
  │   ├── page.tsx
  │   ├── login/page.tsx       # Admin login
  │   └── orders/page.tsx      # Order management
  └── types/orders.ts          # Order-related types
components/
  ├── ui/                      # shadcn/ui components
  ├── navigation.tsx           # Main header/nav bar
  ├── hero-section.tsx         # Hero banner
  ├── menu-wrapper.tsx         # Menu container with categories
  ├── menu-section.tsx         # Menu items display
  ├── category-nav.tsx         # Category filter/navigation
  ├── product-modal.tsx        # Item add-to-cart modal
  ├── order-details-modal.tsx  # Order details viewer
  ├── order-confirmation.tsx   # Order status display
  ├── admin-header.tsx         # Admin nav bar
  ├── theme-provider.tsx       # Theme initialization
  └── ...
lib/
  ├── utils.ts                 # Utility functions
  └── store/
      ├── auth.ts              # Auth store (Zustand)
      ├── cart.ts              # Cart store with persistence
      ├── menu.ts              # Menu data store
      ├── categories.ts        # Categories store
      ├── featured.ts          # Featured items store
      └── orders.ts            # Orders store
```

## Architecture & Key Concepts

### State Management (Zustand)

All global state is managed in `lib/store/` using Zustand with persistence middleware:

- **`auth.ts`**: Admin authentication state. Uses simple email/password validation (hardcoded credentials in mock mode). Auth state is persisted to `auth-storage` cookie for server-side middleware checking.
- **`cart.ts`**: Cart items with add/remove/update quantity operations. Persisted to `cart-storage`. The `total()` function computes the cart total in real-time.
- **`menu.ts`**, **`categories.ts`**, **`featured.ts`**, **`orders.ts`**: Store menu data, category filters, featured items, and order history respectively.

Each store uses the `persist` middleware to save state to localStorage automatically.

### Admin Authentication & Middleware

- **Admin routes protected**: The `middleware.ts` file guards `/admin/*` (except `/admin/login`) by checking the `auth-storage` cookie for `isAuthenticated: true`.
- **Note**: This is cookie-based client state checking. For production, implement real session/JWT authentication.
- **Login credentials (mock)**: Configured via environment variables `NEXT_PUBLIC_ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_PASSWORD` (see `.env.example`)

### UI Component System

The project uses shadcn/ui (Radix UI + Tailwind) components located in `components/ui/`. Key custom components:

- **`product-modal.tsx`**: Modal to add items to cart with quantity selection
- **`order-details-modal.tsx`**: View detailed order information
- **`menu-wrapper.tsx`**: Container that manages category filtering and menu display
- **`category-nav.tsx`**: Category selector component
- **`navigation.tsx`**: Main header with cart icon, account link, and theme toggle

### Styling & Theme

- **Tailwind CSS**: Primary styling framework with custom animations via `tailwindcss-animate`
- **Dark Mode**: Powered by `next-themes`, theme toggle available in navigation
- **Color Scheme**: Uses Tailwind's default palette with semantic color classes
- **Configuration**: `tailwind.config.ts` and `postcss.config.js` handle preprocessing

### Static Export

This app is configured for static export (`output: 'export'` in `next.config.js`). Key implications:

- No server-side rendering or API routes
- All data/state must be client-side or pre-built
- Images use `unoptimized: true` to avoid Next.js Image optimization
- All external images allowed via `remotePatterns` wildcard
- ESLint errors are ignored during build (`ignoreDuringBuilds: true`)

## Development Commands

```bash
# Start development server on http://localhost:3000
npm run dev

# Build static site to `out/` directory
npm run build

# Start production server (if not exporting)
npm start

# Run ESLint
npm run lint
```

## Common Development Tasks

### Adding a New Menu Item
1. Edit the menu store in `lib/store/menu.ts` to add the item
2. Update `lib/store/categories.ts` if a new category is needed
3. Item will automatically appear in the menu via `menu-wrapper.tsx`

### Creating a New Page
1. Create a new folder in `app/` (e.g., `app/new-page/`)
2. Add a `page.tsx` file
3. For client components with state, add `'use client'` directive at the top
4. Next.js App Router automatically creates the route

### Implementing Admin Dashboard Feature
1. Create component in `components/` (e.g., `admin-dashboard.tsx`)
2. Add it to `app/admin/page.tsx`
3. Use `useAuthStore()` to check authentication state
4. Access order data via `lib/store/orders.ts`

### Adding Form Validation
1. Import `useForm` from `react-hook-form` and schema from `zod`
2. Define Zod schema for validation rules
3. Use `useForm` hook with Zod resolver from `@hookform/resolvers`
4. Components in `components/ui/` (like Form, Input, Button) are pre-integrated for forms

## Mobile-First Design

This app is optimized exclusively for **smartphone devices** (portrait and landscape orientations). Desktop/tablet responsiveness is not a priority.

### Layout Structure

Both portrait and landscape use the same **2-column layout**:
- **Left sidebar**: Sub-categories displayed vertically (w-24 in portrait, w-40 in landscape)
- **Right content**: Menu items with 1:1 image thumbnails (80x80px)
- Images are 1:1 aspect ratio (not landscape)

### Responsive Behavior

- **Portrait (Vertical)**:
  - Width: `max-w-sm` (384px)
  - Left sidebar width: 96px (w-24)
  - Menu items: flex row with 80px square image + text/price on right
  - Hero section: aspect-video (16:9)

- **Landscape (Horizontal)**:
  - Width: `max-w-4xl` (896px)
  - Left sidebar width: 160px (w-40)
  - Menu items: same flex layout, but more space available
  - Hero section: aspect-[21/9] (wider)

### Container Constraints

- All breakpoints use `portrait:` and `landscape:` media queries from `tailwind.config.ts`
- No `sm:`, `md:`, `lg:` breakpoints
- Fixed container size ensures content stays readable on small screens

## Important Notes

- **"Use Client" Components**: Any component using Zustand stores, hooks, or event handlers must have `'use client'` at the top
- **Persistent State**: Cart and auth state persist across sessions via localStorage
- **Admin Security**: Current auth is mock. Replace with real backend authentication before production
- **Image Paths**: All images use remote URLs (configured in `next.config.js`) or public folder
- **Type Safety**: Order types defined in `types/orders.ts` (OrderStatus, OrderItem, etc.)
- **Mobile Optimization**: All CSS uses portrait/landscape media queries, not desktop breakpoints
