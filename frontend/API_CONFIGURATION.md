# API Configuration for Coolify Deployment

## Overview
This document explains how the frontend application is configured to make API calls to the backend when deployed to Coolify.

## Environment Variable Setup

### Required Environment Variable
- `VITE_API_URL`: The full URL of your backend API (e.g., `https://your-backend-domain.com/api`)

### How It Works

1. **Build Time**: The `VITE_API_URL` environment variable is injected into the HTML template during build
2. **Runtime**: The application reads the API URL from the window object and uses it for all API calls
3. **Fallback**: If no environment variable is set, it defaults to `http://localhost:3001/api` for development

## Configuration Files Modified

### 1. `index.html`
- Added script to inject environment variable into `window.ENV_API_URL`
- Template placeholder `%VITE_API_URL%` gets replaced during build

### 2. `vite.config.ts`
- Added custom plugin to replace `%VITE_API_URL%` placeholder with actual environment variable
- This ensures the environment variable is available at runtime

### 3. `public/config.js`
- Updated to use `window.ENV_API_URL` instead of hardcoded `/api`
- Falls back to `/api` if no environment variable is set

### 4. `src/services/apiClient.ts`
- Improved logic to prioritize runtime config over environment variables
- Added debug logging to help troubleshoot configuration issues
- Only uses runtime config if it's not the default `/api` value

### 5. `src/services/streamingService.ts`
- Refactored to use centralized API client instead of direct fetch calls
- Now uses the same base URL as all other API calls

## Testing the Configuration

### 1. Check Browser Console
Open the browser console and look for these debug messages:
```
=== Environment Debug Info ===
VITE_API_URL: [your-api-url]
window.ENV_API_URL: [your-api-url]
window.APP_CONFIG: [object]
window.APP_CONFIG?.API_URL: [your-api-url]
=============================
```

### 2. Verify API Calls
- Open browser DevTools → Network tab
- Perform any action that makes an API call (login, send message, etc.)
- Verify that requests are going to the correct backend URL

### 3. Common Issues

#### Issue: API calls still going to wrong URL
**Solution**: 
1. Check that `VITE_API_URL` is set correctly in Coolify
2. Verify the environment variable is being injected by checking browser console
3. Clear browser cache and reload

#### Issue: CORS errors
**Solution**:
1. Ensure backend CORS configuration allows requests from your frontend domain
2. Check that the API URL doesn't have trailing slashes that might cause issues

#### Issue: Environment variable not being read
**Solution**:
1. Verify `VITE_API_URL` is set in Coolify build environment variables
2. Check that the variable name is exactly `VITE_API_URL` (case sensitive)
3. Rebuild the application after setting the environment variable

## Deployment Checklist

- [ ] Set `VITE_API_URL` environment variable in Coolify
- [ ] Rebuild the frontend application
- [ ] Test API calls in browser console
- [ ] Verify all features work (login, chat, worksheet generation)
- [ ] Check that streaming responses work correctly

## Debug Utilities

The application includes debug utilities that log configuration information to the browser console. These can be removed in production by:

1. Removing the import from `main.tsx`
2. Removing the debug logging from `apiClient.ts`
3. Deleting the `debug.ts` file 