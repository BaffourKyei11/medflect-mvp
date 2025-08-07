# Multi-stage build for Medflect AI
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/

# Install dependencies
RUN npm ci --only=production && \
    cd packages/web && npm ci --only=production

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/

# Install all dependencies (including dev dependencies)
RUN npm ci && \
    cd packages/web && npm ci

# Copy source code
COPY . .

# Build web frontend
RUN cd packages/web && npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medflect -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built web from builder stage
COPY --from=builder /app/packages/web/dist ./packages/web/dist

# Copy server source
COPY server ./server

# Copy configuration files
COPY env.example .env.example
COPY README.md ./

# Create necessary directories
RUN mkdir -p data logs uploads && \
    chown -R medflect:nodejs /app

# Switch to non-root user
USER medflect

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"] 