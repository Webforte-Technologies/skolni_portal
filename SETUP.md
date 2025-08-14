# 🚀 EduAI-Asistent - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git**
- **PostgreSQL** (v12 or higher)

You can check your versions with:
```bash
node --version
npm --version
git --version
psql --version
```

## 🏗️ Project Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd skolni_portal
```

### 2. Install Dependencies

#### Option A: Install All Dependencies (Recommended)
```bash
npm run install:all
```

#### Option B: Install Dependencies Separately
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database
```bash
# Create database
createdb eduai_asistent

# Or using psql
psql -U postgres
CREATE DATABASE eduai_asistent;
\q
```

### 4. Environment Configuration

#### Backend Environment
```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eduai_asistent
DB_USER=postgres
DB_PASSWORD=your-database-password
DATABASE_URL=postgresql://username:password@localhost:5432/eduai_asistent

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Service Configuration (for Phase 5)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
```

### 5. Initialize Database
```bash
cd backend
npm run db:init
```

This will create the database schema and insert sample data including test users.

#### Frontend Environment
```bash
cd frontend
cp env.example .env
```

Edit `frontend/.env` with your configuration:
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=EduAI-Asistent
VITE_APP_VERSION=1.0.0
```

## 🚀 Development

### Start Both Applications (Recommended)
```bash
# From the root directory
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:5173

### Start Applications Separately

#### Backend Only
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

#### Frontend Only
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

## 📊 Verification

### Backend Health Check
Visit http://localhost:3001/api/health to verify the backend is running.

Expected response:
```json
{
  "status": "OK",
  "message": "EduAI-Asistent Backend is running",
  "timestamp": "2025-01-08T...",
  "version": "1.0.0"
}
```

### API Endpoints Test
Test the authentication endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login with sample user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@eduai.cz",
    "password": "teacher123"
  }'
```

### Frontend Verification
Visit http://localhost:5173 to see the EduAI-Asistent welcome page.

### Sample Credentials
After database initialization, you can use these test accounts:
- **Admin**: admin@eduai.cz / admin123
- **Teacher**: teacher@eduai.cz / teacher123

## 🛠️ Development Commands

### Root Level Commands
```bash
# Start both applications
npm run dev

# Build both applications
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Type checking (frontend)
npm run type-check
```

### Backend Commands
```bash
cd backend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Linting
npm run lint
```

### Frontend Commands
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📁 Project Structure

```
skolni_portal/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS and Tailwind
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── Docs/                    # Project documentation
├── package.json             # Root package.json
├── README.md               # Project overview
└── SETUP.md               # This file
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
If you get a "port already in use" error:
```bash
# Find and kill the process using the port
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

#### Node Modules Issues
If you encounter dependency issues:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
If you get TypeScript compilation errors:
```bash
# Frontend type checking
cd frontend && npm run type-check

# Backend type checking
cd backend && npx tsc --noEmit
```

## 📚 Next Steps

After successful setup:

1. **Phase 1 Complete** ✅ - Project foundation is ready
2. **Phase 2** - Backend & Database implementation
3. **Phase 3** - Frontend development
4. **Phase 4** - Integration and testing
5. **Phase 5** - AI integration
6. **Phase 6** - Production deployment

## 📞 Support

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure all environment variables are properly configured
4. Check the project documentation in the `Docs/` folder

---

**Happy coding! 🎉** 