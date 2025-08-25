# Husky Git Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality and consistency through Git hooks.

## What's Configured

### Pre-commit Hook (`.husky/pre-commit`)

Runs automatically before each commit and performs:

1. **Lint-staged checks** on modified files:
   - **Frontend** (`frontend/src/**/*.{ts,tsx}`):
     - ESLint with auto-fix
     - TypeScript type checking
   - **Backend** (`backend/src/**/*.ts`):
     - ESLint with auto-fix
     - TypeScript type checking

2. **Backend smoke tests** (only if backend files changed):
   - Runs `npm run test:smoke` in the backend directory

### Commit Message Hook (`.husky/commit-msg`)

Enforces [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>
```

**Valid types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting changes

**Examples:**
```
feat: add user authentication
fix(api): resolve login endpoint issue
docs: update README with setup instructions
refactor(frontend): simplify dashboard components
```

## Installation

The hooks are automatically installed when you run:

```bash
npm install
```

This triggers the `prepare` script which runs `husky install`.

## Manual Setup

If you need to reinstall or setup manually:

```bash
# Install dependencies
npm install

# Initialize Husky (creates .husky directory)
npx husky init

# The hooks are already configured in the repository
```

## Bypassing Hooks

**⚠️ Use sparingly and only when necessary!**

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip commit-msg hook
git commit --no-verify -m "any message format"
```

## Troubleshooting

### Pre-commit Hook Fails

1. **Linting errors**: Fix the reported ESLint issues or run `npm run lint:fix` in the respective directory
2. **Type errors**: Fix TypeScript errors reported by `tsc --noEmit`
3. **Test failures**: Fix failing tests in the backend

### Commit Message Rejected

Ensure your commit message follows the conventional commits format:
- Start with a valid type (`feat`, `fix`, etc.)
- Add optional scope in parentheses
- Use a colon and space after the type/scope
- Keep description under 50 characters
- Use present tense ("add" not "added")

### Hook Not Running

1. Check if `.husky` directory exists
2. Verify hooks have execute permissions:
   ```bash
   chmod +x .husky/pre-commit
   chmod +x .husky/commit-msg
   ```
3. Reinstall Husky:
   ```bash
   rm -rf .husky
   npx husky init
   ```

## Configuration Files

- **Root `package.json`**: Contains `lint-staged` configuration
- **`.husky/pre-commit`**: Pre-commit hook script
- **`.husky/commit-msg`**: Commit message validation script

## Benefits

- **Code Quality**: Automatic linting and type checking prevent common issues
- **Consistency**: Enforced commit message format improves project history
- **Early Detection**: Catches issues before they reach the repository
- **Team Collaboration**: Ensures all team members follow the same standards

## Performance

The hooks are designed to be fast:
- Only runs checks on staged files (not entire codebase)
- Uses `lint-staged` for efficient file processing
- Backend tests only run when backend files are modified
- Auto-fix capabilities reduce manual intervention
