# Etapa de construcción
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:22-alpine AS production

# Instalar dependencias del sistema
RUN apk add --no-cache openssl dumb-init

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Crear carpetas necesarias para la aplicación
RUN mkdir -p uploads && \
    chown nodejs:nodejs /app uploads

# Cambiar propiedad del directorio
RUN chown nodejs:nodejs /app
USER nodejs

# Copiar archivos de dependencias e instalar solo producción
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copiar archivos de templates HTML (no son compilados por TypeScript)
COPY --from=builder --chown=nodejs:nodejs /app/src/api/inscription/utils/templates ./dist/src/api/inscription/utils/templates

# Exponer puerto para Dokploy
EXPOSE 3000/tcp

# Healthcheck - usa puerto 3010 para ser compatible con Dokploy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# Comando de inicio
CMD ["dumb-init", "node", "dist/src/server.js"] 