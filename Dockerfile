# Dockerfile pour déploiement complet (Backend + Frontend)
FROM node:18-alpine AS builder

# Build du Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build du Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate

# Image de production
FROM node:18-alpine

WORKDIR /app

# Copier le backend
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copier le build du frontend
COPY --from=builder /app/frontend/build ./frontend/build

WORKDIR /app/backend

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Démarrer l'application
CMD ["node", "server.js"]
