# Technology Stack & Build System

## Architecture

**Monorepo Structure**: Frontend and backend applications in a single repository with shared tooling and coordinated deployments.

## Frontend Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development server and optimized builds)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state, React Hook Form for forms
- **Routing**: React Router DOM v6
- **UI Components**: Custom components following design guidelines
- **Math Rendering**: KaTeX for mathematical expressions
- **File Generation**: jsPDF, html2canvas, docx for document exports
- **Testing**: Playwright for E2E testing

## Backend Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with middleware for security, logging, rate limiting
- **Database**: PostgreSQL with direct SQL queries (no ORM)
- **Authentication**: JWT tokens with refresh mechanism, bcrypt for password hashing
- **AI Integration**: OpenAI API (GPT-4)
- **File Processing**: Multer for uploads, Tesseract.js for OCR
- **Testing**: Jest with Supertest for API testing

## Development Tools

- **TypeScript**: Strict configuration with path mapping
- **ESLint**: Consistent code style across frontend and backend
- **Husky**: Git hooks for code quality
- **Nodemon**: Backend development server with auto-reload
- **Concurrently**: Run frontend and backend simultaneously

## Database

- **PostgreSQL 12+** with uuid-ossp extension
- **Migrations**: SQL files with idempotent startup migrations
- **Schema**: Users, conversations, messages, generated_files, credits, notifications

## Common Commands

### Development
```bash
# Start both frontend and backend
npm run dev

# Start individual services
npm run dev:frontend
npm run dev:backend

# Install all dependencies
npm run install:all
```

### Building
```bash
# Build both applications
npm run build

# Build individual applications
npm run build:frontend
npm run build:backend
```

### Testing
```bash
# Run backend tests
npm run test

# Run smoke tests
npm run test:smoke

# Run E2E tests (frontend)
cd frontend && npm run test:e2e
```

### Database Management
```bash
# Initialize database
cd backend && npm run db:init

# Run migrations
npm run db:migrate:phase11

# Check schema
npm run db:check-schema
```

### Code Quality
```bash
# Lint all code
npm run lint

# Type checking
npm run type-check
```

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret
OPENAI_API_KEY=your-key
```

## Deployment

- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local, Coolify for production
- **Frontend**: Nginx serving static files with API proxy
- **Backend**: Node.js with health checks at `/api/health`
- **Database**: External PostgreSQL with automatic migrations

## Code Organization

### Frontend Path Mapping
```typescript
"@/*": ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/pages/*": ["./src/pages/*"]
"@/hooks/*": ["./src/hooks/*"]
"@/services/*": ["./src/services/*"]
"@/types/*": ["./src/types/*"]
"@/utils/*": ["./src/utils/*"]
```

### Backend Structure
- `src/database/` - DB connection, migrations, utilities
- `src/middleware/` - Auth, metrics, audit, logging
- `src/models/` - SQL-backed data models
- `src/routes/` - Express route handlers
- `src/types/` - Shared TypeScript types

## Performance Optimizations

- **Frontend**: Code splitting for PDF/chart libraries, lazy loading
- **Backend**: Compression, rate limiting, connection pooling
- **Build**: Source maps, chunk optimization, tree shaking