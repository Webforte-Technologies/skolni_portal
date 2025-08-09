# Frontend Environment Setup

## Environment Variables

The frontend application uses environment variables to configure API endpoints and other settings. Here's how to set them up:

### Local Development

1. Create a `.env.local` file in the `frontend` directory:
```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=EduAI-Asistent
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

### Production Deployment

For production deployment (e.g., on Coolify), set the following environment variables:

- `VITE_API_URL`: The URL of your backend API (e.g., `https://api.your-domain.com/api`)
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (default: 10000)
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_ENABLE_ANALYTICS`: Enable analytics (true/false)
- `VITE_ENABLE_DEBUG_MODE`: Enable debug mode (true/false)
- `VITE_SENTRY_DSN`: Sentry DSN for error tracking (optional)
- `VITE_GOOGLE_ANALYTICS_ID`: Google Analytics ID (optional)

### Coolify Configuration

When deploying to Coolify, make sure to:

1. Set the `VITE_API_URL` to point to your backend service
2. Configure the environment variables in the Coolify dashboard
3. Ensure the backend service is accessible from the frontend

### Important Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend code
- The `.env.local` file should not be committed to version control
- For production builds, environment variables are embedded at build time
- The API URL should include the `/api` path if your backend serves the API under that path 