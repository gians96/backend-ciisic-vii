import { NextFunction, Request, Response } from 'express'
import { AnyObjectSchema, ValidationError } from 'yup'
import { removeUploadedFile } from './upload'

export function validateBody(schema: AnyObjectSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: true })
      next()
    } catch (error) {
      if (!(error instanceof ValidationError)) return next(error)
      removeUploadedFile(req.file)
      const fields = Object.fromEntries(error.inner.map((item) => [item.path || 'body', item.message]))
      res.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'Los datos enviados no son válidos', fields })
    }
  }
}
