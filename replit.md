# AI Profile Directory - Hebrew Job Profiles Platform

## Overview

This is a mobile-first web application that helps low-tech workers in Israel create and discover professional profiles. The platform uses AI to automatically generate professional profile descriptions in Hebrew, making it easy for workers in practical professions (electricians, plumbers, delivery drivers, cleaners, etc.) to establish an online professional presence without technical skills.

The application features:
- AI-powered profile generation in Hebrew (right-to-left layout)
- Public directory with search and filtering
- User authentication via Replit Auth
- Mobile-optimized interface with bottom navigation
- Profile management with privacy controls

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool

**UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling

**State Management**: 
- TanStack Query (React Query) for server state management and API caching
- Local React state (useState) for UI state like navigation between screens
- No React Router - the app uses conditional rendering based on state to switch between screens for a single-page app experience

**Styling Approach**:
- Tailwind CSS with custom theme configuration
- Mobile-first responsive design (max-width ~420-480px, centered)
- Right-to-left (RTL) layout support for Hebrew text
- Custom CSS variables for theming (defined in index.css)
- Framer Motion for animations

**Key Design Decisions**:
- Single root route (`/`) with all navigation handled via state instead of routing to maintain an app-like feel
- Bottom tab navigation pattern (Directory, Create, My Profile, Settings)
- Component-based architecture with reusable UI components from Shadcn
- Mobile-first with generous spacing and touch-friendly targets

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Build System**:
- Vite for client-side bundling
- esbuild for server-side bundling (production)
- TypeScript throughout (tsconfig with ESNext modules)

**API Design**:
- RESTful endpoints under `/api` prefix
- Session-based authentication
- JSON request/response format
- Error handling with HTTP status codes

**Key Routes**:
- `GET /api/auth/user` - Get authenticated user
- `GET /api/profiles` - Search/list profiles (with query params for filtering)
- `GET /api/profiles/:id` - Get single profile
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile
- `POST /api/profiles/:id/regenerate` - Regenerate AI content
- `GET /api/settings/:userId` - Get user settings
- `PUT /api/settings/:userId` - Update settings

**Server-Side Rendering**: 
- Development: Vite middleware for HMR
- Production: Static file serving from `dist/public`

### Data Architecture

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Schema**:

1. **users** table:
   - Primary user identity (id, email, name, profile image)
   - Created via Replit Auth integration
   - Timestamps for created/updated

2. **profiles** table:
   - User's public job profile (one-to-one with users)
   - Hebrew content fields: firstName, lastName, role, businessName, workArea
   - AI-generated fields: aboutText, summary
   - Skills array (text[])
   - Avatar/initials for display
   - isPublic flag for directory visibility
   - Foreign key to users with cascade delete

3. **settings** table:
   - User preferences (one-to-one with users)
   - profileStyle: "simple" or "detailed" (affects AI generation)
   - showInPublicSearch: boolean for directory visibility
   - Email notification preferences
   - Foreign key to users with cascade delete

4. **sessions** table:
   - PostgreSQL session store for express-session
   - Managed by connect-pg-simple

**Database Migrations**:
- Schema defined in `shared/schema.ts`
- Migrations generated in `./migrations` directory
- Drizzle Kit for schema management (`npm run db:push`)

**Data Access Pattern**:
- Storage interface abstraction (`IStorage`) implemented by `DatabaseStorage`
- All database operations go through the storage layer
- Drizzle queries use type-safe query builder

### Authentication & Authorization

**Authentication Provider**: Replit Auth (OpenID Connect)

**Session Management**:
- express-session with PostgreSQL session store (connect-pg-simple)
- HTTP-only secure cookies
- 1-week session TTL
- Session secret from environment variable

**Auth Flow**:
1. User authenticates via Replit OAuth
2. OpenID token exchange creates/updates user in database
3. Session established with user claims
4. Subsequent requests include session cookie

**Authorization**:
- `isAuthenticated` middleware checks for valid session
- User ID from session claims used for profile ownership verification
- Public profile endpoints accessible without auth
- Profile mutations require authentication and ownership

**Security Considerations**:
- CSRF protection via session-based auth
- Secure cookie configuration (httpOnly, secure flags)
- User data isolation (queries filtered by userId)

## External Dependencies

### Third-Party Services

**Replit AI Integrations**:
- OpenAI-compatible API for profile generation
- Accessed via environment variables (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)
- Used for generating Hebrew profile text (aboutText, summary, skills) based on user input
- Supports "simple" and "detailed" writing styles

**Replit Auth (OpenID Connect)**:
- User authentication and identity management
- No API keys needed - uses Replit platform integration
- Configuration via `ISSUER_URL` and `REPL_ID` environment variables

**Neon Database** (PostgreSQL):
- Serverless PostgreSQL database
- Connection via `@neondatabase/serverless` with WebSocket support
- Connection string from `DATABASE_URL` environment variable
- Database must be provisioned via Replit before deployment

### Development Tools

**Replit-Specific Plugins**:
- `@replit/vite-plugin-runtime-error-modal` - Error overlay in development
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development mode indicator

**Custom Vite Plugin**:
- `vite-plugin-meta-images` - Updates OpenGraph meta tags with deployment URL for social sharing

### Key NPM Dependencies

**Frontend**:
- React 18 + React DOM
- TanStack Query for data fetching
- Wouter for minimal client-side routing
- Framer Motion for animations
- Radix UI component primitives (20+ components)
- Tailwind CSS with @tailwindcss/vite plugin
- React Hook Form with Zod validation

**Backend**:
- Express.js web framework
- Drizzle ORM + Drizzle Zod for schema validation
- Passport.js with OpenID Client strategy
- OpenAI SDK for AI integration
- connect-pg-simple for session storage

**Shared**:
- Zod for runtime type validation
- date-fns for date utilities

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Secret for session encryption
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Replit AI endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Replit AI credentials
- `ISSUER_URL` - OpenID issuer (defaults to Replit)
- `REPL_ID` - Replit application identifier
- `NODE_ENV` - Environment mode (development/production)