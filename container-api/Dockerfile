# Stage 1: Build TypeScript
FROM node:22-slim AS build
WORKDIR /app
COPY container-api/package*.json ./
RUN npm ci
COPY container-api/tsconfig.json ./
COPY container-api/src/ ./src/
RUN npm run build

# Stage 2: Production runtime
FROM node:22-slim
WORKDIR /app
COPY container-api/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY api/skills/ ./skills/
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/src/server.js"]
