import 'dotenv/config'

const isTest = process.env.NODE_ENV === 'test'
const isProduction = process.env.NODE_ENV === 'production'

function required(name: string, testFallback?: string): string {
    const value = process.env[name]?.trim() || (isTest ? testFallback : undefined)
    if (!value) throw new Error(`La variable de entorno ${name} es obligatoria`)
    return value
}

function csv(name: string, fallback = ''): string[] {
    return (process.env[name] || fallback).split(',').map((value) => value.trim()).filter(Boolean)
}

const port = Number(process.env.PORT || 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un puerto válido')
}

const jwtSecret = required('JWT_SECRET', 'test-secret-at-least-32-characters-long')
if (jwtSecret.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres')
const corsOrigins = csv('CORS_ORIGINS', isTest ? 'http://localhost:3000' : '')
if (isProduction && corsOrigins.length === 0) throw new Error('CORS_ORIGINS es obligatoria en producción')
const integrationValue = (name: string) => isProduction ? required(name) : (process.env[name] || '')
const reniecProvider = process.env.RENIEC_PROVIDER || 'nubetec'
if (!['nubetec', 'reniec'].includes(reniecProvider)) throw new Error('RENIEC_PROVIDER debe ser nubetec o reniec')
const reniecToken = reniecProvider === 'reniec' && isProduction ? required('RENIEC_TOKEN') : (process.env.RENIEC_TOKEN || '')
const reniecUrl = reniecProvider === 'reniec' && isProduction ? required('API_RENIEC_DNI') : (process.env.API_RENIEC_DNI || '')
const nubeTecToken = reniecProvider === 'nubetec' && isProduction ? required('NUBETEC_TOKEN') : (process.env.NUBETEC_TOKEN || '')

export const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: port,
    DATABASE_URL: required('DATABASE_URL', 'mysql://test:test@localhost:3306/ciisic_test'),
    JWT_SECRET: jwtSecret,
    CORS_ORIGINS: corsOrigins,
    API_URL: required('API_URL', 'http://localhost:3000'),
    UPLOADS_DIR: process.env.UPLOADS_DIR || 'uploads',
    MAX_UPLOAD_BYTES: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024),
    RENIEC_PROVIDER: reniecProvider as 'nubetec' | 'reniec',
    RENIEC_TOKEN: reniecToken,
    API_RENIEC_DNI: reniecUrl,
    NUBETEC_TOKEN: nubeTecToken,
    DECOLECTA_TOKEN: process.env.DECOLECTA_TOKEN || '',
    BREVO_API_KEY: integrationValue('BREVO_API_KEY'),
    BREVO_SENDER: integrationValue('BREVO_SENDER'),
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'VIII CIISIC',
    BREVO_SENDER_SUBJECT: process.env.BREVO_SENDER_SUBJECT || 'Inscripción aprobada',
})
