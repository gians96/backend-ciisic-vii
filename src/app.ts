import express from 'express'
import morgan from 'morgan'
import path from 'path'
import cors from 'cors'
import { errorHandler } from './middlewares/errorHandler'
import { loadRoutes } from './loaders/routesLoader'

const app = express()

app.use(express.json())

app.use(morgan('dev'))

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Path de uploads con detección automática
// Detecta si está compilado (dist/) o en desarrollo (src/)
const isCompiled = __dirname.includes('dist')
const uploadsPath = isCompiled
    ? path.join(__dirname, '../../uploads')  // Compilado: dist/src/app.js -> ../../uploads
    : path.join(__dirname, '../uploads')     // Desarrollo: src/app.ts -> ../uploads

app.use('/uploads', express.static(uploadsPath))

loadRoutes(app)

app.use(errorHandler)

export default app
