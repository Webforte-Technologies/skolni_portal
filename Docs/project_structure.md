# 🏗️ Project Structure – EduAI-Asistent

## 📁 Monorepo Overview

The EduAI-Asistent project is organized as a monorepo containing both frontend and backend applications, along with comprehensive documentation. This structure allows for efficient development, shared tooling, and coordinated deployments.

```
skolni_portal/
├── frontend/                 # React + Vite + TypeScript application
├── backend/                  # Node.js + Express + TypeScript API
├── docs/                     # Project documentation
├── .cursor/                  # Cursor IDE configuration
├── .git/                     # Git repository
├── .gitignore               # Git ignore rules
├── PRD.md                   # Product Requirements Document
└── README.md                # Project overview and setup instructions
```

## 🎯 Frontend Structure (`frontend/`)

The frontend is a React application built with Vite, TypeScript, and Tailwind CSS.

### Key Directories and Files

```
frontend/
├── public/                   # Static assets
│   ├── index.html           # Main HTML template
│   └── favicon.ico          # Site favicon
├── src/                      # Source code
│   ├── components/           # Reusable React components
│   │   ├── ui/              # Basic UI components (buttons, inputs, etc.)
│   │   ├── layout/          # Layout components (header, sidebar, etc.)
│   │   └── features/        # Feature-specific components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Main dashboard
│   │   └── chat/            # AI chat interface
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service functions
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles and Tailwind config
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── vite.config.ts           # Vite build configuration
```

### Component Organization

**UI Components (`components/ui/`):**
- Reusable, atomic components
- Follow design system guidelines
- No business logic
- Examples: Button, Input, Card, Modal

**Layout Components (`components/layout/`):**
- Page structure components
- Navigation and layout logic
- Examples: Header, Sidebar, Footer, Layout

**Feature Components (`components/features/`):**
- Business logic components
- Feature-specific functionality
- Examples: ChatInterface, CreditDisplay, UserProfile

## 🔧 Backend Structure (`backend/`)

The backend is a Node.js application built with Express, TypeScript, and PostgreSQL.

### Key Directories and Files

```
backend/
├── src/                      # Source code
│   ├── controllers/          # Request handlers
│   │   ├── auth/            # Authentication controllers
│   │   ├── users/           # User management
│   │   ├── credits/         # Credit system
│   │   └── ai/              # AI assistant endpoints
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # Authentication middleware
│   │   ├── validation.ts    # Request validation
│   │   └── errorHandler.ts  # Error handling
│   ├── models/              # Database models
│   │   ├── User.ts          # User model
│   │   ├── School.ts        # School model
│   │   └── Credit.ts        # Credit model
│   ├── routes/              # API route definitions
│   │   ├── auth.ts          # Authentication routes
│   │   ├── users.ts         # User routes
│   │   ├── credits.ts       # Credit routes
│   │   └── ai.ts            # AI assistant routes
│   ├── services/            # Business logic
│   │   ├── authService.ts   # Authentication logic
│   │   ├── creditService.ts # Credit management
│   │   └── aiService.ts     # AI integration
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Database configuration
│   │   └── environment.ts   # Environment variables
│   └── index.ts             # Application entry point
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── fixtures/            # Test data
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── nodemon.json             # Development server configuration
└── .env.example             # Environment variables template
```

### API Structure

**Authentication Routes (`/api/auth`):**
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Token refresh

**User Routes (`/api/users`):**
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /credits` - Get credit balance

**AI Assistant Routes (`/api/ai`):**
- `POST /chat` - Send message to AI assistant
- `GET /history` - Get chat history

**Credit Routes (`/api/credits`):**
- `GET /balance` - Get current balance
- `POST /purchase` - Purchase credits
- `GET /history` - Get credit usage history

## 📚 Documentation Structure (`docs/`)

```
docs/
├── implementation_plan.md    # Detailed development phases
├── design_guidelines.md     # UI/UX design specifications
├── project_structure.md     # This file - project architecture
├── api_documentation.md     # API endpoint documentation
├── deployment_guide.md      # Deployment instructions
└── development_workflow.md  # Development processes
```

## 🔧 Configuration Files

### Root Level
- `.gitignore` - Git ignore patterns
- `README.md` - Project overview and setup
- `PRD.md` - Product Requirements Document

### Frontend Configuration
- `frontend/package.json` - Dependencies and scripts
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tailwind.config.js` - Tailwind CSS setup
- `frontend/vite.config.ts` - Vite build configuration

### Backend Configuration
- `backend/package.json` - Dependencies and scripts
- `backend/tsconfig.json` - TypeScript configuration
- `backend/nodemon.json` - Development server setup
- `backend/.env.example` - Environment variables template

## 🚀 Development Workflow

### Local Development
1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Concurrent Development**: `npm run dev` (from root)

### Environment Variables
- **Backend**: Database connection, JWT secrets, API keys
- **Frontend**: API base URL, feature flags

### Database
- **Development**: Local PostgreSQL instance
- **Production**: Managed PostgreSQL service

## 📦 Package Management

### Frontend Dependencies
- **Core**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS
- **UI**: Headless UI, Heroicons
- **State**: React Query, Zustand
- **Forms**: React Hook Form, Zod

### Backend Dependencies
- **Core**: Express, TypeScript, Node.js
- **Database**: PostgreSQL, Prisma
- **Authentication**: JWT, bcrypt
- **Validation**: Joi, Zod
- **Testing**: Jest, Supertest

## 🔒 Security Considerations

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **CORS**: Proper cross-origin configuration

## 📊 Monitoring and Logging

- **Application Logs**: Structured logging with Winston
- **Error Tracking**: Error monitoring service integration
- **Performance**: Response time monitoring
- **Usage Analytics**: Feature usage tracking

---

**Note**: This structure is designed to support the MVP development phase and can be extended for future features and scaling requirements. 