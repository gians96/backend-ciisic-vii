# Operación del backend en Dokploy

La guía completa de ramas, variables, staging, smoke tests y rollback está versionada en el repositorio frontend como `docs/DEPLOYMENT-HITO1.md`.

Antes de desplegar este backend:

1. Configure todas las variables documentadas en `.env.example` y monte un volumen persistente en `/app/uploads`.
2. Ejecute `npx prisma migrate deploy`.
3. Ejecute una sola vez `npm run bootstrap:admin` y retire las variables `BOOTSTRAP_ADMIN_*`.
4. Compruebe `npm ci`, `npm run lint`, `npm test` y `npm run build`.
5. Despliegue backend antes que frontend y compruebe `/health`, autenticación, permisos y persistencia.

## Deuda técnica controlada

La auditoría de producción conserva siete avisos `high` transitivos: `deepmerge-ts` desde Prisma 6 y
`extract-zip` desde Puppeteer 24. No existe una corrección compatible dentro de las versiones estables
actuales del proyecto. No ejecutar `npm audit fix --force`: propone un downgrade de Prisma y Puppeteer 25
requiere migrar el backend y Jest de CommonJS a ESM. Esa migración debe realizarse y probarse en un hito
independiente. El frontend quedó sin vulnerabilidades reportadas por `bun audit --production`.
