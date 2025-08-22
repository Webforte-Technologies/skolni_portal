# CI/CD Workflow Documentation

## 🎯 Overview

This document describes the CI/CD (Continuous Integration/Continuous Deployment) workflow for the EduAI-Asistent project. The workflow ensures code quality, automated testing, and safe deployments through a structured branching strategy and automated pipelines.

## 🌿 Branching Strategy

### Main Branch (`main`)
- **Purpose**: Production-ready code
- **Protection**: Fully protected with strict requirements
- **Deployment**: Automatic deployment package creation
- **Updates**: Only through pull requests

### Development Branch (`develop`) - Optional
- **Purpose**: Integration branch for features
- **Protection**: Moderate protection
- **Deployment**: No automatic deployment
- **Updates**: Through pull requests

### Feature Branches (`feature/*`)
- **Purpose**: Development of new features
- **Naming Convention**: `feature/feature-name` (e.g., `feature/admin-dashboard`)
- **Protection**: No special protection
- **Updates**: Direct pushes allowed

### Hotfix Branches (`hotfix/*`)
- **Purpose**: Critical bug fixes for production
- **Naming Convention**: `hotfix/issue-description`
- **Protection**: Same as main branch
- **Updates**: Through pull requests to main

## 🔄 Workflow Process

### 1. Feature Development

```bash
# Create a new feature branch
git checkout main
git pull origin main
git checkout -b feature/admin-dashboard

# Make your changes and commit
git add .
git commit -m "feat: implement admin dashboard"

# Push to remote
git push origin feature/admin-dashboard
```

### 2. Pull Request Process

1. **Create Pull Request**
   - Go to GitHub and create a PR from your feature branch to `main`
   - Use the provided PR template
   - Fill out all required sections

2. **Automated Checks**
   - Backend CI (linting, testing, building)
   - Frontend CI (linting, type checking, testing)
   - E2E Tests (end-to-end testing)
   - Security Scan (vulnerability assessment)

3. **Code Review**
   - Minimum 2 approvals required
   - All conversations must be resolved
   - All status checks must pass

4. **Merge**
   - Squash and merge recommended
   - Linear history maintained
   - Feature branch deleted after merge

### 3. Deployment

- **Automatic**: Deployment package created on successful merge to `main`
- **Manual**: Download artifact and deploy to your infrastructure
- **Artifacts**: Stored for 30 days in GitHub Actions

## 🚀 CI/CD Pipeline

### Pipeline Stages

1. **Backend CI**
   - Node.js setup
   - Dependency installation
   - Linting and type checking
   - Unit and integration tests
   - Build verification

2. **Frontend CI**
   - Node.js setup
   - Dependency installation
   - Linting and type checking
   - Component tests
   - Build verification

3. **E2E Tests**
   - Playwright browser setup
   - End-to-end test execution
   - Cross-browser compatibility

4. **Security Scan**
   - npm audit for vulnerabilities
   - Dependency security assessment

5. **Deployment Package**
   - Build artifacts collection
   - Dockerfile inclusion
   - Compressed deployment package

### Environment Variables

The pipeline uses the following environment variables:

```yaml
NODE_VERSION: '18'
POSTGRES_VERSION: '15'
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
NODE_ENV: test
```

## 🛡️ Branch Protection Rules

### Main Branch Protection

- ✅ **Required Status Checks**: All CI stages must pass
- ✅ **Required Reviews**: Minimum 2 approvals
- ✅ **Linear History**: No merge commits allowed
- ✅ **Conversation Resolution**: All discussions must be resolved
- ❌ **Force Pushes**: Disabled
- ❌ **Direct Pushes**: Disabled

### Status Check Requirements

- `Backend CI` - Backend tests and build
- `Frontend CI` - Frontend tests and build
- `E2E Tests` - End-to-end testing
- `Security Scan` - Security vulnerability check

## 📋 Pull Request Requirements

### Required Sections

1. **Description**: Clear explanation of changes
2. **Type of Change**: Categorization of the PR
3. **Testing**: Comprehensive testing details
4. **Checklist**: Quality assurance checklist
5. **Screenshots**: Visual evidence of changes

### Review Checklist

- [ ] Code review completed
- [ ] Tests are passing
- [ ] Documentation is adequate
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Accessibility requirements met

## 🔧 Local Development Setup

### Prerequisites

- Node.js 18+
- npm 8+
- Git
- PostgreSQL 15+ (for testing)

### Setup Commands

```bash
# Install dependencies
npm run install:all

# Run development servers
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚨 Troubleshooting

### Common Issues

1. **CI Pipeline Fails**
   - Check local tests: `npm test`
   - Verify linting: `npm run lint`
   - Check type errors: `npm run type-check`

2. **Branch Protection Blocks Merge**
   - Ensure all status checks pass
   - Get required number of approvals
   - Resolve all conversations

3. **Deployment Package Issues**
   - Check build output locally
   - Verify Dockerfile existence
   - Check artifact upload permissions

### Getting Help

- Check GitHub Actions logs for detailed error information
- Review branch protection rules
- Consult team members for code review
- Refer to project documentation

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Pull Request Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Project Structure Documentation](Docs/project_structure.md)
- [Design Guidelines](Docs/design_guidelines.md)

## 🔄 Workflow Summary

```
Feature Branch → Pull Request → Code Review → Merge → Main Branch → Auto-Deploy
     ↓              ↓              ↓         ↓         ↓           ↓
Development   Automated Tests   Approval  Merge    Production   Deployment
   Code         & Checks        Process   Code      Ready        Package
```

This workflow ensures:
- **Code Quality**: Automated testing and linting
- **Security**: Vulnerability scanning and review requirements
- **Collaboration**: Structured review process
- **Reliability**: Automated deployment packages
- **Traceability**: Linear history and audit trail
