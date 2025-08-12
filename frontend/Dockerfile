# Frontend Dockerfile for EduAI-Asistent (Coolify) - OPTIMIZED

# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Set build-time arguments
ARG VITE_API_URL
ARG VITE_API_TIMEOUT
# ... add all your other ARG variables here

# Set environment variables for the build process
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
# ... add all your other ENV variables here

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code and build
COPY . .
RUN npm run build

# Stage 2: Production image with Nginx
FROM nginx:stable-alpine AS runner
WORKDIR /usr/share/nginx/html

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default Nginx content
RUN rm -rf ./*

# Copy built assets from the builder stage
COPY --from=builder /app/dist .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set default for backend origin; can be overridden via env at runtime
ENV BACKEND_ORIGIN=http://backend:3001

# Expose Nginx port
EXPOSE 80

# Health check to ping the health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]