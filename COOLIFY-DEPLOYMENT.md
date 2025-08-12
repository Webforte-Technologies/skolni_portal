# Coolify Deployment Guide for EduAI-Asistent

## Overview
This guide provides step-by-step instructions for deploying the EduAI-Asistent application on Coolify.

## Prerequisites
- Coolify instance set up and running
- Docker and Docker Compose installed on your server
- PostgreSQL database (can be managed by Coolify or external)

## Deployment Steps

### 1. Backend Deployment

#### Create Backend Service in Coolify:
1. Go to your Coolify dashboard
2. Create a new service
3. Choose "Docker" as the deployment method
4. Select "Dockerfile" as the build method
5. Set the following configuration:

**Build Configuration:**
- Source: Your Git repository
- Branch: `production` (stable)
- Dockerfile Path: `backend/Dockerfile`
- Build Context: `backend/`

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=eduai_asistent
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DATABASE_URL=postgresql://your-db-user:your-db-password@your-postgres-host:5432/eduai_asistent
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
ENABLE_COMPRESSION=true
ENABLE_LOGGER=true
LOG_FORMAT=combined
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Port Configuration:**
- Internal Port: `3001`
- External Port: `3001` (or your preferred port)

### 2. Frontend Deployment

#### Create Frontend Service in Coolify:
1. Create another service in Coolify
2. Choose "Docker" as the deployment method
3. Select "Dockerfile" as the build method
4. Set the following configuration:

**Build Configuration:**
- Source: Your Git repository
- Branch: `main` (or your preferred branch)
- Dockerfile Path: `frontend/Dockerfile`
- Build Context: `frontend/`

**Build Arguments:**
```
VITE_API_URL=/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=EduAI-Asistent
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

**Port Configuration:**
- Internal Port: `80`
- External Port: `3000` (or your preferred port)

### 3. Database Setup

#### Option A: Use Coolify's PostgreSQL Service
1. Create a PostgreSQL service in Coolify
2. Use the connection details in your backend environment variables

#### Option B: Use External PostgreSQL
1. Set up PostgreSQL on your server or use a managed service
2. Update the backend environment variables with the correct connection details

### 4. Network Configuration

#### Create a Custom Network (Optional):
If you want the services to communicate using service names:
1. Create a custom Docker network in Coolify
2. Add both services to this network
3. Update the nginx configuration to use the backend service name

### 5. Domain Configuration

#### Set up Domains:
1. Configure your domain(s) in Coolify
2. Point the frontend domain to the frontend service
3. Optionally, create a subdomain for the backend API

### 6. SSL/HTTPS Configuration

#### Enable SSL:
1. Configure SSL certificates in Coolify
2. Enable HTTPS for both services
3. Update the `FRONTEND_URL` environment variable to use HTTPS

## Important Notes

### API Proxy Configuration
The frontend nginx configuration includes a proxy for `/api/*` requests to the backend. This means:
- Frontend calls to `/api/*` will be automatically proxied to the backend
- No need to expose the backend port publicly
- The frontend serves as the main entry point

### Health Checks
Both services include health checks aligned to `/api/health` (backend) and `/health` (frontend):
- Backend: `http://localhost:${PORT}/api/health` (Dockerfile uses `${PORT:-3001}`)
- Frontend: `http://localhost/health`

### Environment Variables
Make sure to update all environment variables with your actual values:
- Database connection details
- JWT secret (use a strong, unique secret)
- Domain URLs
- API keys (if using external services)

## Troubleshooting

### Common Issues:

1. **Bad Gateway (502) Error:**
   - Check if the backend service is running
   - Verify the nginx proxy configuration
   - Check backend logs for errors
   - Ensure database connection is working

2. **CORS Errors:**
   - Verify the `FRONTEND_URL` environment variable is set correctly
   - Check that the frontend domain is in the allowed origins

3. **Database Connection Issues:**
   - Verify database credentials
   - Check if the database is accessible from the backend container
   - Ensure the database is running and healthy

4. **Build Failures:**
   - Check if all required files are present in the repository
   - Verify Dockerfile syntax
   - Check build logs for specific errors

### Debugging Commands:
```bash
# Check service logs
docker logs eduai-backend
docker logs eduai-frontend

# Check service status
docker ps

# Test backend health
curl http://your-backend-domain/api/health

# Test frontend health
curl http://your-frontend-domain/health
```

## Security Considerations

1. **Environment Variables:**
   - Never commit sensitive data to the repository
   - Use Coolify's environment variable management
   - Rotate secrets regularly

2. **Network Security:**
   - Only expose necessary ports
   - Use internal networks for service communication
   - Configure firewalls appropriately

3. **SSL/TLS:**
   - Always use HTTPS in production
   - Configure proper SSL certificates
   - Enable HSTS headers

## Monitoring

1. **Set up monitoring in Coolify:**
   - Enable health checks
   - Configure log aggregation
   - Set up alerts for service failures

2. **Application Monitoring:**
   - Monitor API response times
   - Track error rates
   - Monitor database performance

## Updates and Maintenance

1. **Deploying Updates:**
   - Push changes to your Git repository
   - Coolify will automatically rebuild and deploy
   - Monitor the deployment process

2. **Database Migrations:**
   - Run migrations manually or automate them
   - Always backup before major updates
   - Test migrations in a staging environment first

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs in Coolify
3. Verify all configuration settings
4. Test individual components in isolation 