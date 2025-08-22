# 🚀 Development Workflow - Quick Reference

## 🔄 Daily Development Flow

### 1. Start New Feature
```bash
# Always start from main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Start coding!
```

### 2. Development Commands
```bash
# Install dependencies (first time only)
npm run install:all

# Start development servers
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
npm run type-check
```

### 3. Commit & Push
```bash
# Stage changes
git add .

# Commit with conventional commit format
git commit -m "feat: add new admin dashboard"
git commit -m "fix: resolve login validation issue"
git commit -m "docs: update API documentation"

# Push to remote
git push origin feature/your-feature-name
```

### 4. Create Pull Request
1. Go to GitHub → **Pull requests** → **New pull request**
2. Select `feature/your-feature-name` → `main`
3. Fill out the PR template completely
4. Request reviews from team members
5. Wait for CI checks to pass

### 5. Merge & Deploy
1. Get required approvals (minimum 2)
2. Resolve all conversations
3. Merge using "Squash and merge"
4. Delete feature branch
5. 🎉 Automatic deployment package created!

## 📋 Commit Message Format

```
type(scope): description

Examples:
feat(auth): implement OAuth2 login
fix(api): resolve user validation error
docs(readme): update installation guide
style(ui): improve button spacing
refactor(backend): optimize database queries
test(frontend): add component unit tests
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🛡️ Branch Protection Rules

### Main Branch (`main`)
- ❌ **No direct pushes**
- ✅ **Requires pull request**
- ✅ **Requires 2 approvals**
- ✅ **All CI checks must pass**
- ✅ **Linear history enforced**

### Feature Branches
- ✅ **Direct pushes allowed**
- ✅ **No special protection**
- 🔄 **Merge to main via PR only**

## 🧪 Testing Requirements

### Before Creating PR
- [ ] All tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Manual testing completed
- [ ] Responsive design verified

### CI Pipeline Checks
- ✅ **Backend CI** - Tests, linting, build
- ✅ **Frontend CI** - Tests, linting, build
- ✅ **E2E Tests** - End-to-end testing
- ✅ **Security Scan** - Vulnerability check

## 🚨 Common Issues & Solutions

### CI Pipeline Fails
```bash
# Check locally first
npm test
npm run lint
npm run type-check

# Fix issues, then push again
git add .
git commit -m "fix: resolve CI issues"
git push origin feature/your-feature-name
```

### Branch Protection Blocks Merge
- Ensure all status checks pass
- Get required number of approvals
- Resolve all conversations
- Update branch if behind main

### Merge Conflicts
```bash
# Update your feature branch
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main

# Resolve conflicts, then push
git add .
git commit -m "fix: resolve merge conflicts"
git push origin feature/your-feature-name
```

## 📱 Pull Request Checklist

### Required Sections
- [ ] **Description** - Clear explanation of changes
- [ ] **Type of Change** - Select appropriate category
- [ ] **Testing** - Describe testing completed
- [ ] **Checklist** - Complete quality assurance items
- [ ] **Screenshots** - Visual evidence (if UI changes)

### Quality Checklist
- [ ] Code follows project style guidelines
- [ ] No console.log statements in production code
- [ ] No hardcoded values or secrets
- [ ] Input validation implemented
- [ ] Performance impact considered
- [ ] Accessibility requirements met

## 🔧 Useful Commands

### Git Workflow
```bash
# Check branch status
git status
git branch -a

# Stash changes temporarily
git stash
git stash pop

# View commit history
git log --oneline -10

# Reset to last commit
git reset --hard HEAD
```

### Development
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run specific tests
npm test -- --testNamePattern="auth"
npm run test:responsive

# Build for production
npm run build
```

### Database
```bash
# Backend database commands
npm run db:init --prefix backend
npm run db:check-schema --prefix backend
npm run db:migrate:phase11 --prefix backend
```

## 📚 Quick Links

- **CI/CD Documentation**: [Docs/ci-cd-workflow.md](Docs/ci-cd-workflow.md)
- **Setup Guide**: [CI_CD_SETUP_GUIDE.md](CI_CD_SETUP_GUIDE.md)
- **Project Structure**: [Docs/project_structure.md](Docs/project_structure.md)
- **Design Guidelines**: [Docs/design_guidelines.md](Docs/design_guidelines.md)
- **GitHub Repository**: Your repo URL

## 🎯 Remember

1. **Always work in feature branches** - never directly on main
2. **Test locally first** - don't rely on CI to catch issues
3. **Use meaningful commit messages** - follow conventional format
4. **Fill out PR templates completely** - help reviewers understand changes
5. **Get proper approvals** - quality gates protect the main branch
6. **Keep branches updated** - avoid merge conflicts

---

**🚀 Happy coding! Your CI/CD pipeline will ensure quality and reliability.**
