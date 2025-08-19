# Project Structure & Organization

## Monorepo Layout

```
skolni_portal/
├── frontend/                 # React + Vite + TypeScript application
├── backend/                  # Node.js + Express + TypeScript API
├── Docs/                     # Project documentation
├── .cursor/                  # Cursor IDE configuration
├── .kiro/                    # Kiro AI assistant configuration
├── .git/                     # Git repository
├── node_modules/             # Root dependencies (concurrently, husky)
├── package.json              # Root package with workspace scripts
├── PRD.md                    # Product Requirements Document
└── README.md                 # Project overview and setup
```

## Frontend Structure (`frontend/`)

```
frontend/
├── public/                   # Static assets
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Basic UI components (Button, Input, Card)
│   │   ├── layout/          # Layout components (Header, Sidebar, Footer)
│   │   └── features/        # Feature-specific components (ChatInterface, CreditDisplay)
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages (Login, Register)
│   │   ├── dashboard/       # Main dashboard
│   │   └── chat/            # AI chat interface
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service functions
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles and Tailwind config
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── tests/                   # Playwright E2E tests
├── dist/                    # Build output
├── package.json             # Frontend dependencies
├── tsconfig.json            # TypeScript configuration with path mapping
├── tailwind.config.js       # Tailwind CSS with custom design system
├── vite.config.ts           # Vite build config with code splitting
└── Dockerfile               # Multi-stage build with nginx
```

## Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── database/            # Database layer
│   │   ├── migrations/      # SQL migration files
│   │   ├── init.ts          # Database initialization
│   │   └── connection.ts    # PostgreSQL connection
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── metrics.ts       # Application metrics
│   │   ├── audit.ts         # Audit logging
│   │   └── validation.ts    # Request validation
│   ├── models/              # Data models (SQL-backed)
│   │   ├── User.ts          # User model
│   │   ├── Message.ts       # Chat message model
│   │   ├── GeneratedFile.ts # File generation model
│   │   └── Credit.ts        # Credit system model
│   ├── routes/              # Express route handlers
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── ai.ts            # AI assistant endpoints
│   │   ├── users.ts         # User management
│   │   ├── files.ts         # File operations
│   │   └── credits.ts       # Credit management
│   ├── types/               # Shared TypeScript types
│   └── index.ts             # Application entry point
├── uploads/                 # File upload storage
├── dist/                    # Build output
├── package.json             # Backend dependencies
├── tsconfig.json            # Strict TypeScript configuration
├── nodemon.json             # Development server config
├── jest.config.js           # Testing configuration
└── Dockerfile               # Production build
```

## Documentation Structure (`Docs/`)

```
Docs/
├── implementation_plan.md    # Development phases and milestones
├── design_guidelines.md     # UI/UX design specifications
├── project_structure.md     # Detailed project architecture
├── workflow.md              # Development processes
├── TEST_PLAN_FULL.md        # Comprehensive testing strategy
├── TEST_PLAN_PHASE2.md      # Phase-specific testing
└── context.aisc             # AI context file
```

## Component Organization Patterns

### Frontend Components

**UI Components (`components/ui/`)**
- Atomic, reusable components
- No business logic
- Follow design system guidelines
- Examples: `Button.tsx`, `Input.tsx`, `Card.tsx`, `Modal.tsx`

**Layout Components (`components/layout/`)**
- Page structure and navigation
- Examples: `Header.tsx`, `Sidebar.tsx`, `Layout.tsx`

**Feature Components (`components/features/`)**
- Business logic components
- Feature-specific functionality
- Examples: `ChatInterface.tsx`, `CreditDisplay.tsx`, `UserProfile.tsx`

### Backend Route Organization

**API Structure (`/api`)**
- `/auth` - Authentication (register, login, logout, refresh)
- `/users` - User management (profile, credits)
- `/ai` - AI assistant (chat, history)
- `/files` - File operations (upload, download, generate)
- `/credits` - Credit system (balance, purchase, history)
- `/admin` - Administrative endpoints (metrics, system)

## File Naming Conventions

### Frontend
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase (`apiService.ts`)
- **Types**: PascalCase (`UserTypes.ts`)
- **Utils**: camelCase (`formatDate.ts`)

### Backend
- **Models**: PascalCase (`User.ts`)
- **Routes**: camelCase (`authRoutes.ts`)
- **Middleware**: camelCase (`authMiddleware.ts`)
- **Types**: PascalCase (`ApiTypes.ts`)
- **Database**: camelCase (`connection.ts`)

## Import/Export Patterns

### Frontend Path Mapping
```typescript
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/services/apiService'
import type { User } from '@/types/UserTypes'
```

### Backend Imports
```typescript
import { User } from '../models/User'
import { authMiddleware } from '../middleware/auth'
import type { ApiResponse } from '../types/ApiTypes'
```

## Configuration Files

### Root Level
- `package.json` - Workspace scripts and shared dependencies
- `.gitignore` - Git ignore patterns for monorepo
- `env.template` - Environment variable template

### Frontend Config
- `tsconfig.json` - TypeScript with path mapping
- `tailwind.config.js` - Design system configuration
- `vite.config.ts` - Build optimization and code splitting
- `playwright.config.ts` - E2E testing configuration

### Backend Config
- `tsconfig.json` - Strict TypeScript configuration
- `jest.config.js` - Testing setup
- `nodemon.json` - Development server configuration
- `.env.example` - Environment variables template

## Development Workflow

### Local Development
1. Root level: `npm run dev` (starts both frontend and backend)
2. Individual: `npm run dev:frontend` or `npm run dev:backend`
3. Database: `cd backend && npm run db:init`

### Code Quality
- ESLint configuration for both frontend and backend
- Husky git hooks for pre-commit checks
- TypeScript strict mode with path mapping
- Consistent formatting and naming conventions