# ==============================================================================
# NAGARA AI - Production Multi-Stage Dockerfile
# Concepts: Containerization with Docker, Production Build Optimization
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install clean dependencies
RUN npm ci

# Copy entire source tree
COPY . .

# Compile TypeScript and Vite static assets
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled frontend distribution artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/sql ./sql

# Expose HTTP port
EXPOSE 4000

# Run production server
CMD ["node", "--loader", "ts-node/esm", "src/server/index.ts"]
