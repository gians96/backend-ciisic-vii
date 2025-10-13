# Etapa de construcción
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma y Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  dumb-init \
  openssl

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (con dev)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build


# =======================
# Etapa de producción
# =======================
FROM node:22-alpine AS production

# Instalar Chromium y dependencias requeridas por Puppeteer
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  dumb-init \
  openssl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app
RUN mkdir -p uploads && chown nodejs:nodejs /app uploads

USER nodejs

# Copiar dependencias y código
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copiar las plantillas HTML necesarias (no son compilados por TypeScript)
COPY --from=builder --chown=nodejs:nodejs /app/src/api/inscription/utils/templates ./dist/src/api/inscription/utils/templates
COPY --from=builder --chown=nodejs:nodejs /app/uploads/logo_congreso.png ./uploads/logo_congreso.png

# Configuración Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

CMD ["dumb-init", "node", "dist/src/server.js"]
