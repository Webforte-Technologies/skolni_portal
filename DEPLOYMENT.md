# 🚀 EduAI-Asistent Deployment Guide

This guide explains how to deploy the EduAI-Asistent application using Docker and Coolify.

## 📋 Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (can be external or managed)
- Coolify instance set up
- Domain name (optional but recommended)

## 🏗️ Local Development Setup

### 1. Build and Run Locally

```bash
# Build the images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## 🌐 Coolify Deployment

### 1. Prepare Your Repository

Ensure your repository contains:
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `coolify.yaml`
- `env.template`

### 2. Set Up Database

You'll need a PostgreSQL database. Options:
- **External PostgreSQL** (recommended for production)
- **Coolify managed database**
- **Cloud database** (AWS RDS, Google Cloud SQL, etc.)

### 3. Configure Environment Variables

In Coolify, set these environment variables:

#### Database Configuration
```
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=eduai_asistent
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DATABASE_URL=postgresql://user:password@host:5432/eduai_asistent
```

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d
```

#### Application Configuration
```
FRONTEND_URL=https://your-domain.com
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
DEFAULT_CREDITS=100
CREDIT_COST_PER_REQUEST=1
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 4. Deploy on Coolify

1. **Create a new application** in Coolify
2. **Connect your repository**
3. **Select the `coolify.yaml`** as your compose file
4. **Set environment variables** as listed above
5. **Deploy the application**

### 5. Database Initialization

After deployment, you need to initialize the database:

```bash
# Connect to your backend container
docker exec -it eduai-backend sh

# Run database initialization
npm run db:init
```

Or add this to your deployment script.

## 🔧 Configuration Details

### Backend Service
- **Port**: 3001
- **Health Check**: `/health` endpoint
- **Environment**: Production
- **Database**: PostgreSQL

### Frontend Service
- **Port**: 80 (nginx)
- **Health Check**: `/health` endpoint
- **Static Files**: Served by nginx
- **React Router**: Handled by nginx configuration

### Database Requirements
- **PostgreSQL 12+**
- **Extensions**: `uuid-ossp`
- **Tables**: Will be created automatically by the application

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Ensure database is accessible from container
   - Verify network connectivity

2. **Frontend Can't Connect to Backend**
   - Check CORS configuration
   - Verify backend URL in frontend environment
   - Check network between containers

3. **Health Checks Failing**
   - Ensure applications are starting correctly
   - Check logs for startup errors
   - Verify port configurations

### Useful Commands

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Access container shell
docker exec -it eduai-backend sh
docker exec -it eduai-frontend sh

# Check database connection
docker exec -it eduai-backend npm run db:init

# Restart services
docker-compose restart
```

## 🔒 Security Considerations

1. **Change default passwords** and secrets
2. **Use HTTPS** in production
3. **Set up proper firewall rules**
4. **Regular security updates**
5. **Database backups**

## 📊 Monitoring

- **Health checks** are configured for both services
- **Logs** are available through Docker
- **Metrics** can be added with Prometheus/Grafana

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] Database set up and accessible
- [ ] SSL certificate configured
- [ ] Domain name pointing to server
- [ ] Database initialized
- [ ] Health checks passing
- [ ] Logs monitored
- [ ] Backups configured

---

For support, check the main README.md or create an issue in the repository. 