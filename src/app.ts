import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { errorHandler } from './middlewares/errorHandler'
import { loadRoutes } from './loaders/routesLoader'
import { env } from '../config/env'
import { normalizeErrorResponses } from './middlewares/normalizeResponse'

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(express.json({ limit: '1mb' }))
app.use(helmet())
app.use(normalizeErrorResponses)

app.use(morgan('dev'))

app.use(cors({
    origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true)
        return callback(new Error('Origen no permitido por CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use('/api/v1/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }))
app.use('/api/v1/reniec', rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }))

loadRoutes(app)

app.use(errorHandler)

export default app
