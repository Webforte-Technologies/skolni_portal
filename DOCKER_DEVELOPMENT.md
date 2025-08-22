# Docker Development Setup - EduAI-Asistent

This guide explains how to run the EduAI-Asistent application using Docker for local development.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or later)
- Git

## 🚀 Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd skolni_portal
   ```

2. **Set up your OpenAI API key**:
   ```bash
   # Copy the environment file
   cp docker-compose.env docker-compose.env.local
   
   # Edit the file and add your OpenAI API key
   # Replace 'your-openai-api-key-here' with your actual key
   ```

3. **Start the application**:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the application**:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001/api
   - **Database**: localhost:5432 (postgres/devpassword123)
   - **Redis**: localhost:6379

## 🛠️ Development Workflow

### Starting the Application

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start with building (recommended on first run or after changes)
docker-compose -f docker-compose.dev.yml up --build

# Start in background
docker-compose -f docker-compose.dev.yml up -d
```

### Stopping the Application

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean database)
docker-compose -f docker-compose.dev.yml down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs

# View specific service logs
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs frontend
docker-compose -f docker-compose.dev.yml logs db

# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f
```

### Rebuilding Services

```bash
# Rebuild specific service
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml build frontend

# Rebuild all services
docker-compose -f docker-compose.dev.yml build
```

## 🔧 Development Features

### Hot Reload

- **Backend**: Uses `nodemon` for automatic restart on file changes
- **Frontend**: Uses Vite's built-in hot module replacement (HMR)

### Volume Mounts

The following directories are mounted for live development:

**Backend**:
- `./backend/src` → `/app/src` (source code)
- Configuration files (package.json, tsconfig.json, etc.)

**Frontend**:
- `./frontend/src` → `/app/src` (source code)
- `./frontend/public` → `/app/public` (static assets)
- Configuration files (package.json, vite.config.ts, etc.)

### Database Persistence

- Database data is persisted in a Docker volume
- Schema is automatically initialized on first startup
- To reset the database: `docker-compose -f docker-compose.dev.yml down -v`

## 🐛 Troubleshooting

### Port Conflicts

If you get port conflicts, you can modify the ports in `docker-compose.dev.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:5173"  # Change left side to available port
  backend:
    ports:
      - "3002:3001"  # Change left side to available port
```

### Database Connection Issues

If the backend can't connect to the database:

1. Wait for the database to fully start (check logs: `docker-compose -f docker-compose.dev.yml logs db`)
2. Restart the backend service: `docker-compose -f docker-compose.dev.yml restart backend`

### Permission Issues

If you encounter permission issues:

```bash
# On Linux/macOS, ensure proper ownership
sudo chown -R $USER:$USER ./backend ./frontend
```

### Clean Restart

For a completely clean restart:

```bash
# Stop everything and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove images (optional)
docker-compose -f docker-compose.dev.yml down --rmi all

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

## 🔍 Useful Commands

### Running Commands Inside Containers

```bash
# Backend shell
docker-compose -f docker-compose.dev.yml exec backend sh

# Frontend shell
docker-compose -f docker-compose.dev.yml exec frontend sh

# Database shell
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d eduai_asistent
```

### Database Operations

```bash
# Run database migrations
docker-compose -f docker-compose.dev.yml exec backend npm run db:init

# Reset database
docker-compose -f docker-compose.dev.yml exec backend npm run db:reset

# Add sample data
docker-compose -f docker-compose.dev.yml exec backend npm run db:add-sample-credits
```

### Running Tests

```bash
# Backend tests
docker-compose -f docker-compose.dev.yml exec backend npm test

# Frontend tests  
docker-compose -f docker-compose.dev.yml exec frontend npm run test
```

## 📁 File Structure

```
skolni_portal/
├── docker-compose.dev.yml     # Development Docker Compose config
├── docker-compose.env         # Environment variables template
├── backend/
│   ├── Dockerfile.dev         # Backend development Dockerfile
│   └── Dockerfile             # Backend production Dockerfile (unchanged)
└── frontend/
    ├── Dockerfile.dev         # Frontend development Dockerfile
    ├── Dockerfile             # Frontend production Dockerfile (unchanged)
    └── Dockerfile.coolify     # Frontend Coolify Dockerfile (unchanged)
```

## ⚠️ Important Notes

1. **Environment Variables**: Make sure to set your actual OpenAI API key in `docker-compose.env.local`
2. **Production Files**: The production Dockerfiles remain unchanged and are used for deployment
3. **Data Persistence**: Database and Redis data persist between container restarts
4. **Network**: All services communicate through a dedicated Docker network
5. **Security**: Development credentials are used - never use these in production

## 🔗 Related Files

- [Backend Dockerfile (Production)](./backend/Dockerfile)
- [Frontend Dockerfile (Production)](./frontend/Dockerfile)
- [Frontend Dockerfile (Coolify)](./frontend/Dockerfile.coolify)
- [Main Setup Guide](./SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
