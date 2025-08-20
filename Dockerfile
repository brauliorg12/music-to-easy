# Build stage
FROM node:18-alpine3.18.4 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine3.18.4 AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R botuser:nodejs /app
USER botuser

# Labels for better organization
LABEL org.opencontainers.image.title="Music to Easy"
LABEL org.opencontainers.image.description="Discord bot that makes music commands easy with buttons"
LABEL org.opencontainers.image.source="https://github.com/brauliorg12/music-to-easy"
LABEL org.opencontainers.image.author="Braulio Rodriguez <cubanovainfo@gmail.com>"

# Expose port (optional, for health checks)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Music to Easy is healthy')" || exit 1
