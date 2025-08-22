# 🚀 Coolify Deployment Guide for EduAI-Asistent

## 📋 Overview

This guide explains how to deploy your EduAI-Asistent project to Coolify using the automated CI/CD pipeline. The pipeline creates deployment packages that are perfectly optimized for Coolify's Docker-based deployment system.

## 🎯 What You'll Get

- ✅ **Automated Builds**: Every merge to main creates a deployment package
- ✅ **Docker Ready**: Pre-configured Docker containers for backend and frontend
- ✅ **Coolify Optimized**: Includes docker-compose.yml and deployment scripts
- ✅ **Version Tracking**: Automatic releases with changelogs
- ✅ **Health Checks**: Built-in health monitoring for containers

## 🔄 Deployment Workflow

### 1. **CI/CD Pipeline** (Automatic)
```
Feature Branch → PR → Merge to Main → Auto-Build → Deployment Package
```

### 2. **Coolify Deployment** (Manual)
```
Download Package → Upload to Coolify → Configure → Deploy
```

## 🚀 Step-by-Step Deployment

### Step 1: Get Your Deployment Package

1. **After merging to main branch**, go to GitHub Actions
2. **Find the latest successful workflow run**
3. **Download the `deployment-package` artifact**
4. **Extract the `deployment.tar.gz` file**

### Step 2: Prepare Coolify

1. **Log into your Coolify dashboard**
2. **Create a new project** (if you don't have one)
3. **Choose "Docker Compose" as deployment method**

### Step 3: Upload to Coolify

1. **Upload the extracted deployment folder**
2. **Coolify will detect the `docker-compose.yml`**
3. **Configure your domain and environment**

### Step 4: Configure Environment Variables

Set these environment variables in Coolify:

#### **Backend Environment Variables**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=https://yourdomain.com
```

#### **Frontend Environment Variables**
```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_APP_NAME=EduAI-Asistent
```

### Step 5: Deploy

1. **Click "Deploy" in Coolify**
2. **Wait for containers to build and start**
3. **Check health status**
4. **Configure SSL certificate**

## 🐳 Docker Configuration

### **Backend Container**
- **Port**: 3001
- **Health Check**: `/health` endpoint
- **Environment**: Production mode
- **Dependencies**: PostgreSQL database

### **Frontend Container**
- **Port**: 80
- **Health Check**: Root path
- **Served by**: Nginx
- **Dependencies**: Backend API

### **Docker Compose Structure**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🔧 Coolify-Specific Configuration

### **Domain Configuration**
1. **Set your custom domain** in Coolify
2. **Configure SSL certificate** (Let's Encrypt recommended)
3. **Set up reverse proxy** if needed

### **Database Setup**
1. **Create PostgreSQL database** in Coolify or external
2. **Set DATABASE_URL** environment variable
3. **Run migrations** if needed

### **Environment Management**
1. **Use Coolify's environment variable management**
2. **Set different values for staging/production**
3. **Keep secrets secure** (don't commit to git)

## 📦 Package Contents

Your deployment package contains:

```
deployment/
├── backend/
│   ├── dist/           # Built backend code
│   ├── Dockerfile      # Backend container
│   └── package*.json   # Dependencies
├── frontend/
│   ├── dist/           # Built frontend code
│   ├── Dockerfile      # Frontend container
│   └── nginx.conf      # Nginx configuration
├── docker-compose.yml  # Multi-service deployment
├── deploy.sh          # Deployment helper script
└── DEPLOYMENT_INFO.md # Build information
```

## 🚨 Common Issues & Solutions

### **1. Container Build Failures**

**Problem**: Backend or frontend containers fail to build
**Solution**: 
- Check Dockerfile syntax
- Verify all dependencies are included
- Check build context paths

### **2. Database Connection Issues**

**Problem**: Backend can't connect to PostgreSQL
**Solution**:
- Verify DATABASE_URL format
- Check network connectivity
- Ensure database is accessible

### **3. Frontend API Calls Fail**

**Problem**: Frontend can't reach backend API
**Solution**:
- Check CORS configuration
- Verify API_BASE_URL environment variable
- Check network policies

### **4. Health Checks Failing**

**Problem**: Containers show unhealthy status
**Solution**:
- Verify health check endpoints exist
- Check if services are responding
- Review health check configuration

## 🔄 Continuous Deployment

### **Automatic Updates**
- Every merge to main creates a new deployment package
- Download and deploy new packages as needed
- Use Coolify's rollback feature if issues arise

### **Version Management**
- Each deployment package includes version information
- Track changes through GitHub releases
- Maintain deployment history in Coolify

## 📱 Monitoring & Maintenance

### **Health Monitoring**
- Use Coolify's built-in health checks
- Monitor container logs
- Set up alerts for failures

### **Performance Monitoring**
- Monitor resource usage
- Track API response times
- Watch for memory leaks

### **Backup Strategy**
- Regular database backups
- Configuration backups
- Deployment package archives

## 🎉 Success Checklist

- [ ] Deployment package downloaded from GitHub Actions
- [ ] Project created in Coolify
- [ ] Docker Compose deployment configured
- [ ] Environment variables set correctly
- [ ] Domain configured with SSL
- [ ] Database connected and accessible
- [ ] Health checks passing
- [ ] Frontend and backend communicating
- [ ] Application accessible via domain

## 🔗 Useful Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Project CI/CD Documentation](Docs/ci-cd-workflow.md)

## 🚀 Next Steps

### **1. First Deployment**
- Follow this guide step by step
- Test all functionality
- Verify health checks

### **2. Automation**
- Consider webhook integration
- Set up automatic deployments
- Configure monitoring alerts

### **3. Scaling**
- Plan for traffic increases
- Consider load balancing
- Monitor resource usage

---

**🎯 Your EduAI-Asistent is now ready for Coolify deployment!**

The CI/CD pipeline creates production-ready packages, and Coolify handles the container orchestration. Every merge to main gives you a new deployment option with full version tracking and rollback capabilities.
