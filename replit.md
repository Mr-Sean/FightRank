# MMA Ratings

## Overview

MMA Ratings is a full-stack web application where users can rate and discuss MMA fights. Users can register/login, browse fights from various promotions (UFC, etc.), rate fights with a 5-star system, and leave comments. There's also an admin panel for creating and managing fights.

The app follows a monorepo structure with a React frontend and Express backend, using PostgreSQL (via Supabase) for data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state (caching, fetching, mutations)
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Theming**: Dark mode by default, configurable via `theme.json` and a custom ThemeProvider. The `@replit/vite-plugin-shadcn-theme-json` plugin syncs theme settings.
- **Pages**: Home (landing), Fights (browse/rate/comment), Auth (login/register), Admin (create fights), 404
- **Path aliases**: `@/` maps to `client/src/`, `@db` maps to `db/`

### Backend
- **Framework**: Express.js with TypeScript, run via `tsx` in development
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Authentication**: Passport.js with local strategy (username/password), session-based auth using `express-session` with `memorystore`
- **Password Hashing**: Node.js `crypto.scrypt` with random salt
- **Build**: esbuild bundles server code for production; Vite builds the client to `dist/public`
- **Dev Server**: Vite middleware is integrated into Express in development mode for HMR

### Database
- **Database**: PostgreSQL hosted on Supabase
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Connection**: Uses `drizzle-orm/neon-serverless` driver with WebSocket support (`ws` package)
- **Connection String**: `SUPABASE_DATABASE_URL` environment variable (required)
- **Schema Migration**: `drizzle-kit push` (via `npm run db:push`)
- **Schema Tables**:
  - `users` — id, username (unique), password (hashed), created_at
  - `fights` — id, title, fighter1, fighter2, promotion (default "UFC"), date, created_at
  - `ratings` — id, user_id (FK→users), fight_id (FK→fights), rating (1-5), created_at; unique constraint on (user_id, fight_id)
  - `comments` — id, user_id (FK→users), fight_id (FK→fights), content, created_at
- **Relations**: Fights have many ratings and comments; ratings and comments belong to a user and a fight

### Key Scripts
- `npm run dev` — Start development server with HMR
- `npm run build` — Build client (Vite) and server (esbuild) for production
- `npm start` — Run production build
- `npm run db:push` — Push Drizzle schema to database

## External Dependencies

- **Supabase**: PostgreSQL database hosting. Connection via `SUPABASE_DATABASE_URL` environment variable. Uses Neon serverless driver for WebSocket-based connections.
- **Drizzle ORM + Drizzle Kit**: Database ORM and migration tooling for PostgreSQL
- **Passport.js**: Authentication middleware with local strategy
- **Radix UI**: Headless UI component primitives (used via shadcn/ui)
- **TanStack React Query**: Async server state management
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Lightweight React router
- **date-fns**: Date formatting utilities
- **Recharts**: Charting library (available via shadcn chart component)
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Calendar/date picker component
- **vaul**: Drawer component
- **nanoid**: Unique ID generation
- **cmdk**: Command palette component