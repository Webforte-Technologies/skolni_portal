# 🚀 CI/CD Pipeline Setup Guide

## 📋 Overview

This guide will walk you through setting up the complete CI/CD pipeline for your EduAI-Asistent project. The pipeline includes automated testing, code quality checks, security scanning, and deployment package creation.

## 🎯 What You'll Get

- ✅ **Automated Testing**: Backend, frontend, and E2E tests
- ✅ **Code Quality**: Linting, type checking, and security scanning
- ✅ **Branch Protection**: Secure main branch with required reviews
- ✅ **Pull Request Templates**: Standardized PR process
- ✅ **Automated Releases**: Version management and changelog generation
- ✅ **Deployment Packages**: Ready-to-deploy artifacts for Coolify
- ✅ **Coolify Integration**: Docker-optimized deployment packages

## 🚀 Step-by-Step Setup

### Step 1: Prepare Your Repository

#### 1.1 Rename Branches (if needed)

If you currently have `develop` as your main branch and want to make `main` production-ready:

```bash
# Rename current develop branch to main
git branch -m develop main

# Push the renamed branch
git push origin main

# Set upstream
git push -u origin main

# Delete old develop branch from remote (if it exists)
git push origin --delete develop
```

#### 1.2 Create Development Branch (Optional)

```bash
# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

### Step 2: Configure GitHub Repository Settings

#### 2.1 Enable GitHub Actions

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click **Actions** in the left sidebar
4. Select **Allow all actions and reusable workflows**
5. Click **Save**

#### 2.2 Set Up Branch Protection

1. Go to **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main`
3. Configure the following settings:

**Branch name pattern**: `main`

**Protect matching branches**:
- ✅ **Require a pull request before merging**
- ✅ **Require approvals**: Set to `2`
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Require review from code owners** (optional)

**Require status checks to pass before merging**:
- ✅ **Require branches to be up to date before merging**
- ✅ **Require status checks to pass before merging**
- Add these status checks:
  - `Backend CI`
  - `Frontend CI`
  - `E2E Tests`
  - `Security Scan`

**Restrict pushes that create files**:
- ✅ **Require linear history**
- ✅ **Require conversation resolution before merging**
- ❌ **Allow force pushes**
- ❌ **Allow deletions**

4. Click **Create** or **Save changes**

#### 2.3 Set Up Environments (Optional)

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it `production`
4. Add protection rules if needed
5. Click **Configure environment**

### Step 3: Verify GitHub Actions Workflows

#### 3.1 Check Workflow Files

Ensure these files are in your repository:
- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/release.yml` - Release management
- `.github/pull_request_template.md` - PR template

#### 3.2 Test the Pipeline

1. Make a small change to your code
2. Create a feature branch: `git checkout -b test-pipeline`
3. Commit and push: `git push origin test-pipeline`
4. Create a pull request to `main`
5. Watch the GitHub Actions run

### Step 4: Configure Local Development

#### 4.1 Update Git Hooks

```bash
# Install Husky (if not already installed)
npm install

# Verify hooks are installed
ls -la .husky/
```

#### 4.2 Set Up Pre-commit Checks

Create `.husky/pre-commit` file:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting and type checking
npm run lint
npm run type-check
```

Make it executable:
```bash
chmod +x .husky/pre-commit
```

### Step 5: Test the Complete Workflow

#### 5.1 Feature Development Workflow

```bash
# 1. Start from main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/test-pipeline

# 3. Make changes
echo "# Test change" >> README.md

# 4. Commit changes
git add README.md
git commit -m "feat: test CI/CD pipeline"

# 5. Push to remote
git push origin feature/test-pipeline
```

#### 5.2 Create Pull Request

1. Go to GitHub and create PR from `feature/test-pipeline` to `main`
2. Fill out the PR template
3. Watch the automated checks run
4. Get required approvals
5. Merge the PR

#### 5.3 Verify Deployment

1. Check GitHub Actions for successful deployment
2. Download the deployment package artifact
3. Verify the release was created

## 🔧 Configuration Files

### Environment Variables

Create `.env.example` files if they don't exist:

**Backend** (`backend/.env.example`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/database
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

**Frontend** (`frontend/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=EduAI-Asistent
```

### Docker Configuration

Ensure your Dockerfiles are properly configured:

**Backend** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

**Frontend** (`frontend/Dockerfile`):
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🚨 Troubleshooting

### Common Issues

#### 1. GitHub Actions Not Running

**Problem**: Workflows don't trigger
**Solution**: 
- Check if `.github/workflows/` directory exists
- Verify workflow files have correct syntax
- Ensure GitHub Actions are enabled in repository settings

#### 2. Status Checks Not Found

**Problem**: Required status checks not recognized
**Solution**:
- Wait for first workflow run to complete
- Check workflow job names match status check names
- Verify branch protection rules are correctly configured

#### 3. Permission Denied Errors

**Problem**: Workflows fail due to permissions
**Solution**:
- Check repository permissions
- Verify GitHub token permissions
- Ensure workflows have access to required resources

#### 4. Tests Failing Locally

**Problem**: Tests pass locally but fail in CI
**Solution**:
- Run `npm run install:all` to ensure all dependencies
- Check Node.js version compatibility
- Verify environment variables are set correctly

### Getting Help

1. **Check GitHub Actions Logs**: Detailed error information in workflow runs
2. **Review Workflow Files**: Ensure syntax is correct
3. **Verify Dependencies**: Check package.json files and scripts
4. **Consult Documentation**: Refer to this guide and project docs

## 📚 Next Steps

### 1. Customize Workflows

- Adjust Node.js versions if needed
- Modify test commands for your specific setup
- Add additional security scanning tools

### 2. Set Up Monitoring

- Configure deployment notifications
- Set up error tracking (Sentry, etc.)
- Implement health checks

### 3. Advanced Features

- Add performance testing
- Implement automated dependency updates
- Set up staging environments

### 4. Team Training

- Share this guide with your team
- Conduct CI/CD workflow training
- Establish code review guidelines

## 🎉 Success Checklist

- [ ] GitHub Actions workflows are running
- [ ] Branch protection rules are active
- [ ] Pull request template is working
- [ ] Automated tests are passing
- [ ] Deployment packages are being created
- [ ] Releases are being generated
- [ ] Team members can create feature branches
- [ ] Pull requests require proper approvals
- [ ] Main branch is protected and secure

## 🔗 Useful Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Pull Request Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Coolify Deployment Guide](COOLIFY_DEPLOYMENT_GUIDE.md)
- [Project Documentation](Docs/)

---

**🎯 Your CI/CD pipeline is now ready!** 

The main branch is protected and production-ready. All new features should be developed in feature branches and merged through pull requests. The automated pipeline will ensure code quality and create deployment packages for every successful merge to main.
