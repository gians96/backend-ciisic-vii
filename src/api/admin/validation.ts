import * as yup from 'yup'

export const loginSchema = yup.object({
  correoElectronico: yup.string().trim().lowercase().email().required(),
  contrasena: yup.string().required(),
}).required()

export const createAdminSchema = yup.object({
  nombres: yup.string().trim().min(2).max(100).required(),
  apellidos: yup.string().trim().min(2).max(100).required(),
  correoElectronico: yup.string().trim().lowercase().email().required(),
  contrasena: yup.string().min(12).max(128).required(),
  rolId: yup.number().integer().oneOf([1, 2]).default(2),
}).required()

export const updateAdminSchema = createAdminSchema.partial()
