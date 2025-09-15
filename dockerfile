FROM node:18-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false
COPY frontend/ ./
RUN npm run build

FROM node:18-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit --progress=false
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

FROM node:18-slim
WORKDIR /app
COPY --from=backend-build /app/backend ./
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
CMD ["node", "server.js"]

# Build: docker build -t myapp .
# Run: docker run -p 80:80 myapp
