import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { env } from '../../config/env'
import type { NextFunction, Request, Response } from 'express'

// Crear directorio de uploads si no existe
export const uploadsDir = path.resolve(process.cwd(), env.UPLOADS_DIR)
if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creando directorio uploads...')
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('✅ Directorio uploads creado exitosamente')
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Verificar que el directorio existe antes de usarlo
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    },
})

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp'])

export const upload = multer({
    storage,
    limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase()
        if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
            cb(new Error('Archivo no permitido. Use PDF, JPEG, PNG o WebP.'))
            return
        }
        cb(null, true)
    },
})

export function removeUploadedFile(file?: { path: string }): void {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path)
}

export function validateUploadedFileContent(req: Request, res: Response, next: NextFunction): void {
    if (!req.file) return next()
    const bytes = Buffer.alloc(12)
    const descriptor = fs.openSync(req.file.path, 'r')
    const length = fs.readSync(descriptor, bytes, 0, bytes.length, 0)
    fs.closeSync(descriptor)
    const header = bytes.subarray(0, length)
    const signatures: Record<string, boolean> = {
        'application/pdf': header.subarray(0, 4).toString() === '%PDF',
        'image/jpeg': header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
        'image/png': header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
        'image/webp': header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WEBP',
    }
    if (!signatures[req.file.mimetype]) {
        removeUploadedFile(req.file)
        res.status(422).json({ success: false, code: 'INVALID_FILE_CONTENT', message: 'El contenido del archivo no coincide con su formato' })
        return
    }
    next()
}
