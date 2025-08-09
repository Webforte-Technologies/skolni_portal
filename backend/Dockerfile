# Backend Dockerfile for EduAI-Asistent (Coolify) - FINAL

# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies needed for native modules, if any
RUN apk add --no-cache libc6-compat

# Copy package files and install production dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code and build the application
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Set Node.js to run in production mode
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy only the necessary artifacts from the 'builder' stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# Copy SQL migrations so we can run DB migrations in the container
COPY --from=builder /app/src/database/migrations ./dist/migrations

USER nextjs

EXPOSE 3001

# Health check using the PORT variable for flexibility
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/api/health || exit 1

# CORRECTED: The command to start the production application
# Replace 'index.js' with your actual main server file name (e.g., main.js, app.js, server.js)
CMD [ "node", "dist/index.js" ]