# 🚀 Coolify Deployment with Dockerfiles

This guide explains how to deploy EduAI-Asistent on Coolify using individual Dockerfiles for frontend and backend.

## 📋 Prerequisites

- Coolify instance set up
- PostgreSQL database (external or managed)
- Domain names for frontend and backend (optional but recommended)

## 🏗️ Deployment Steps

### Step 1: Set Up Database

You'll need a PostgreSQL database. Options:
- **External PostgreSQL** (recommended for production)
- **Coolify managed database**
- **Cloud database** (AWS RDS, Google Cloud SQL, etc.)

### Step 2: Deploy Backend Application

1. **Create a new application** in Coolify
2. **Application Name**: `eduai-backend`
3. **Repository**: Your Git repository
4. **Branch**: `main` (or your preferred branch)
5. **Dockerfile Path**: `backend/Dockerfile.coolify`
6. **Port**: `3001`

#### Backend Environment Variables:
```
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=eduai_asistent
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DATABASE_URL=postgresql://your-database-user:your-database-password@your-database-host:5432/eduai_asistent

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# AI Service Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Credit System
DEFAULT_CREDITS=100
CREDIT_COST_PER_REQUEST=1

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Step 3: Deploy Frontend Application

1. **Create another application** in Coolify
2. **Application Name**: `eduai-frontend`
3. **Repository**: Your Git repository (same as backend)
4. **Branch**: `main` (or your preferred branch)
5. **Dockerfile Path**: `frontend/Dockerfile.coolify`
6. **Port**: `80`

#### Frontend Environment Variables:
```
# No environment variables needed for frontend
# The frontend will connect to the backend via the backend URL
```

### Step 4: Configure Domain Names (Optional)

1. **Backend Domain**: `api.yourdomain.com`
2. **Frontend Domain**: `yourdomain.com` or `app.yourdomain.com`

### Step 5: Database Initialization

After both applications are deployed:

1. **Access the backend container**:
   ```bash
   # Via Coolify terminal or SSH into your server
   docker exec -it eduai-backend sh
   ```

2. **Initialize the database**:
   ```bash
   npm run db:init
   ```

## 🔧 Configuration Details

### Backend Service
- **Dockerfile**: `backend/Dockerfile.coolify`
- **Port**: 3001
- **Health Check**: `/api/health` endpoint
- **Environment**: Production
- **Database**: PostgreSQL

### Frontend Service
- **Dockerfile**: `frontend/Dockerfile.coolify`
- **Port**: 80 (nginx)
- **Health Check**: `/health` endpoint
- **Static Files**: Served by nginx
- **React Router**: Handled by nginx configuration

## 🌐 Access Points

After deployment:
- **Frontend**: `https://your-frontend-domain.com`
- **Backend API**: `https://your-backend-domain.com`
- **Health Checks**:
  - Frontend: `https://your-frontend-domain.com/health`
  - Backend: `https://your-backend-domain.com/api/health`

## 🔗 Service Communication

The frontend needs to know the backend URL. You can:

1. **Set it in the frontend build** by adding environment variables to the frontend Dockerfile
2. **Use environment variables** in the frontend application
3. **Configure it in the frontend code** to use the backend domain

## 🛠️ Troubleshooting

### Common Issues

1. **Backend can't connect to database**
   - Check database credentials
   - Ensure database is accessible from Coolify's network
   - Verify firewall rules

2. **Frontend can't connect to backend**
   - Check CORS configuration in backend
   - Verify backend URL in frontend
   - Check network connectivity between services

3. **Health checks failing**
   - Check application logs in Coolify
   - Verify ports are correctly configured
   - Ensure applications are starting properly

### Useful Commands

```bash
# Check backend logs
docker logs eduai-backend

# Check frontend logs
docker logs eduai-frontend

# Access backend container
docker exec -it eduai-backend sh

# Test database connection
docker exec -it eduai-backend npm run db:init

# Check health endpoints
curl https://your-backend-domain.com/api/health
curl https://your-frontend-domain.com/health
```

## 🔒 Security Considerations

1. **Change default secrets** (JWT_SECRET, etc.)
2. **Use HTTPS** (Coolify can handle SSL certificates)
3. **Set up proper firewall rules**
4. **Regular security updates**
5. **Database backups**

## 📊 Monitoring

- **Health checks** are configured for both services
- **Logs** are available through Coolify dashboard
- **Metrics** can be viewed in Coolify

## 🚀 Production Checklist

- [ ] Database set up and accessible
- [ ] Backend application deployed
- [ ] Frontend application deployed
- [ ] Environment variables configured
- [ ] Domain names configured
- [ ] SSL certificates enabled
- [ ] Database initialized
- [ ] Health checks passing
- [ ] Frontend can connect to backend
- [ ] Logs monitored

## 🔄 Updates

To update your application:

1. **Push changes** to your Git repository
2. **Coolify will automatically rebuild** and deploy
3. **Database migrations** will need to be run manually if schema changes

---

For support, check the main README.md or create an issue in the repository. 