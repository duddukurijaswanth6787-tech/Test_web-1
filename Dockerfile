FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./
COPY packages/sdk/package.json ./packages/sdk/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/sdk ./packages/sdk
COPY apps/api ./apps/api
COPY tsconfig.base.json tsconfig.json ./

# Build SDK first (used by API static hosting)
RUN npm run build:sdk

# Generate Prisma Client & Build API
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace=apps/api

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/sdk/dist ./packages/sdk/dist

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --schema=apps/api/prisma/schema.prisma && node apps/api/dist/server.js"]
