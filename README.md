# 🎓 EduAI-Asistent

A multi-tenant SaaS platform for the Czech education sector, providing AI-powered assistants to help teachers streamline their workflow and reduce administrative burden.

## 🏗️ Project Structure

This is a monorepo containing both frontend and backend applications:

```
skolni_portal/
├── frontend/          # React + Vite + TypeScript application
├── backend/           # Node.js + Express + TypeScript API
├── docs/             # Project documentation
├── PRD.md            # Product Requirements Document
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skolni_portal
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start development servers**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This will start both frontend and backend servers concurrently.

### Individual Server Commands

- **Backend only**: `cd backend && npm run dev`
- **Frontend only**: `cd frontend && npm run dev`

## 🎯 Project Goals

- **MVP Focus**: Validate the core value proposition with a functional "Math Assistant"
- **User Experience**: Clean, professional interface in Czech language
- **Technology**: Modern stack with React, Node.js, PostgreSQL, and Tailwind CSS
- **Scalability**: Foundation for future AI assistants and features

## 📚 Documentation

- `PRD.md` - Product Requirements Document
- `docs/` - Technical documentation and implementation plans
- `docs/design_guidelines.md` - UI/UX design specifications
- `docs/project_structure.md` - Detailed project architecture

## 🛠️ Technology Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API
 - **Hosting**: Docker/Coolify

## 📝 Development Notes

- All user-facing content is in Czech (`cs-CZ`)
- All code, comments, and technical documentation are in English
- Follow the design guidelines in `docs/design_guidelines.md`
- Refer to `docs/workflow.md` for development protocols

---

**Status**: Phase 1 - Project Foundation & Environment Setup 

## Deployment Notes

This project is designed for Docker/Coolify deployment. The backend exposes a healthcheck at `/api/health`.

Environment flags:
- `ENABLE_COMPRESSION=true` to enable gzip compression
- `ENABLE_LOGGER=true` and `LOG_FORMAT=combined|dev|tiny` for request logging
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` for rate limiting

See `DEPLOYMENT.md` and `COOLIFY-DEPLOYMENT.md` for full guidance.

## Tests

Run a backend smoke test (healthcheck):

```bash
npm run test:smoke
```