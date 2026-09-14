import { Express } from 'express'
import fs from 'fs'
import path from 'path'
import { prisma } from '../database/prisma'

export const loadRoutes = (app: Express) => {
  // Health check endpoint
  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
    } catch {
      res.status(503).json({ status: 'error', timestamp: new Date().toISOString() })
    }
  })

  const apiPath = path.join(__dirname, '../api')

  fs.readdirSync(apiPath).forEach((moduleName) => {
    const routesDir = path.join(apiPath, moduleName, 'routes')
    
    if (fs.existsSync(routesDir)) {
      // Buscar todos los archivos en el directorio de rutas
      const routeFiles = fs.readdirSync(routesDir)
      
      routeFiles.forEach((fileName) => {
        if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
          try {
            const routePath = path.join(routesDir, fileName)
            const routes = require(routePath).default
            
            if (routes) {
              app.use('/api', routes)
              if (process.env.NODE_ENV !== 'test') console.log(`Rutas cargadas: ${moduleName}/${fileName}`)
            }
          } catch (error) {
            const detail = error instanceof Error ? error.message : 'error desconocido'
            throw new Error(`No se pudieron cargar las rutas ${moduleName}/${fileName}: ${detail}`)
          }
        }
      })
    }
  })
}
