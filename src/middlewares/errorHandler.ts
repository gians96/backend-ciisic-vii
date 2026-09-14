import { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  status?: number
  statusCode?: number
  code?: string
  fields?: Record<string, string>
}

export function errorHandler(err: AppError, _req: Request, res: Response, next: NextFunction) {
  void next
  const isUploadLimit = err.name === 'MulterError'
  const status = isUploadLimit ? 413 : (err.statusCode || err.status || 500)
  if (status >= 500) console.error('Error interno:', err.name)
  res.status(status).json({
    success: false,
    code: isUploadLimit ? 'UPLOAD_LIMIT_EXCEEDED' : (err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR')),
    message: isUploadLimit ? 'El archivo supera el límite permitido' : (status >= 500 ? 'Error interno del servidor' : err.message),
    ...(err.fields ? { fields: err.fields } : {}),
  })
}
