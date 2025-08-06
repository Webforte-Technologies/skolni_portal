# Stage 2: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# ----> ADD THIS LINE <----
# Install curl for health checks
RUN apk add --no-cache curl

# Set Node.js to run in production mode
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy only the necessary artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Change ownership to the non-root user
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Expose the port. The actual port number will be injected by Coolify via the $PORT env var.
EXPOSE 3001

# Health check using the PORT variable for flexibility
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/api/health || exit 1

# CORRECTED: The command to start the production application
CMD [ "node", "dist/index.js" ]