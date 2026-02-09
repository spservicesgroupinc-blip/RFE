# GitHub Copilot Instructions

## Project Description

RFE is a comprehensive spray foam estimation and project management application. It's a React-based single-page application (SPA) using Vite for build tooling, TypeScript for type safety, and Neon Serverless PostgreSQL as the database backend with integrated authentication.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router DOM v7
- **Authentication**: Neon Auth (@neondatabase/auth)
- **Database**: Neon Serverless PostgreSQL (@neondatabase/serverless)
- **Styling**: Tailwind CSS (utility classes)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with jspdf-autotable
- **Deployment**: Netlify with Neon integration

## Project Structure

```
/
├── components/          # React components (Calculator, Dashboard, etc.)
├── context/            # React context providers
├── lib/
│   ├── auth-client.ts  # Frontend auth client configuration
│   └── backend/        # Backend utilities for API operations
├── database/           # SQL schema files
├── scripts/            # Database setup and migration scripts
├── services/           # Business logic and API services
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── backend/            # Netlify serverless functions
└── App.tsx             # Main application component with routing

```

## Coding Standards

### TypeScript
- Always use TypeScript, never plain JavaScript
- **Avoid using `any` type** - prefer `unknown` or proper type definitions
- Use interfaces for object shapes
- Leverage type inference where possible
- Use strict mode (enabled in tsconfig.json)

### React
- Use functional components with hooks (no class components)
- Prefer arrow functions for components
- Use React 19 features and patterns
- Import React explicitly when using JSX
- Use proper hook dependencies and avoid stale closures

### Naming Conventions
- **Components**: PascalCase (e.g., `SprayFoamCalculator.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase

### Code Style
- Use 2 spaces for indentation (consistent with existing code)
- Prefer template literals over string concatenation
- Use optional chaining (?.) and nullish coalescing (??)
- Keep functions small and focused
- Extract complex logic into separate utility functions

## Database & Authentication

### Neon Database
- Use **pooled connection** (port 6543) for application queries
- Use **direct connection** (port 5432) for migrations only
- Database is multi-tenant with `company_id` for data isolation
- Connection string stored in `NETLIFY_DATABASE_URL` environment variable
- Uses `@netlify/neon` package for database operations

### Authentication
- Use `@neondatabase/auth` for all authentication
- Auth URL configured in `VITE_NEON_AUTH_URL` environment variable
- Session management handled by `authClient` from `lib/auth-client.ts`
- Protect routes using `authClient.useSession()` hook
- Backend operations use `getUserFromSession()` helper

### Database Schema
Core tables:
- `companies` - Organization/tenant data
- `customers` - Customer information
- `estimates` - Project estimates
- `inventory` - Material inventory
- `equipment` - Equipment tracking
- `settings` - Application settings
- `material_logs` - Material usage history
- `leads` - Sales leads
- Plus Neon Auth tables: `user`, `session`, `account`, `verification`

## Environment & Setup

### Required Environment Variables
```bash
NETLIFY_DATABASE_URL=  # Neon database connection (pooled endpoint, port 6543)
VITE_NEON_AUTH_URL=    # Neon Auth endpoint URL
```

### Development Commands
```bash
npm install            # Install dependencies
npm run dev            # Start dev server (port 3000 via vite.config.ts)
npm run build          # Build for production
npm run preview        # Preview production build
npm run verify-auth    # Verify Neon Auth setup
```

### Database Setup
- Initial setup: Run scripts from `database/` folder
- Schema with auth: Use `database/schema-with-auth.sql`
- Migrations: Scripts in `scripts/` directory

## Important Practices

### Security
- Never commit secrets or credentials
- Use environment variables for all sensitive data
- Sanitize user inputs to prevent XSS and SQL injection
- Use parameterized queries with the Neon serverless client
- Validate and verify company access before data operations

### Error Handling
- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors for debugging but don't expose internals
- Auth client uses fallback URL pattern to prevent crashes

### Testing & Validation
- Restart dev server after `.env` changes
- Test auth flow after any auth-related changes
- Verify database connections before operations
- Check browser console for client-side errors

### Performance
- Leverage Neon's autoscaling and connection pooling
- Use React lazy loading for large components
- Minimize re-renders with proper dependency arrays
- Optimize database queries with proper indexing

## What to Avoid

- ❌ Never use `any` type in TypeScript
- ❌ Don't commit `.env` files
- ❌ Avoid mixing direct and pooled database connections inappropriately
- ❌ Don't bypass authentication checks
- ❌ Avoid hardcoding values that should be configurable
- ❌ Don't create class components (use functional components)
- ❌ Avoid mutations of state directly (use proper React state management)
- ❌ Don't skip error handling in async operations

## Dependencies

### Adding New Dependencies
Before adding any new dependency:
1. Check if functionality exists in current dependencies
2. Verify the package is actively maintained
3. Consider bundle size impact
4. Check for security vulnerabilities
5. Prefer packages from the same ecosystem when possible

### Key Dependencies
- **@neondatabase/auth**: Authentication (do not replace)
- **@netlify/neon**: Database client with Netlify integration (do not replace)
- **React Router DOM**: Routing (v7+)
- **jsPDF**: PDF generation
- **Lucide React**: Icons

## Deployment

- Application deploys on Netlify
- Uses Netlify serverless functions for backend
- GitHub Actions workflow for Neon preview branches (`neon-branch-preview.yml`)
- Requires `NEON_API_KEY` secret and `NEON_PROJECT_ID` variable for CI/CD

## Documentation

- Keep inline comments minimal and meaningful
- Document complex business logic
- Update relevant `.md` files when changing significant functionality
- Use JSDoc for exported functions and types
- Refer to `QUICKSTART.md` for onboarding information
- See `NEON_AUTH_SETUP.md` for detailed auth setup

## Additional Context

This is a production application for spray foam contractors. It handles:
- Customer management
- Project estimation and quoting
- Material inventory tracking
- Equipment tracking
- PDF invoice generation
- Crew dashboards
- Job progress tracking

When making changes, consider the business impact and ensure data integrity across the multi-tenant architecture.
