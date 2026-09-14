import * as yup from 'yup'

export const namedSchema = yup.object({ nombre: yup.string().trim().min(2).max(120).required() }).required()
export const namedUpdateSchema = namedSchema.partial()

export const userSchema = yup.object({
  idTipoDocumentoId: yup.string().oneOf(['dni', 'ce']).required(),
  numero: yup.string().matches(/^\d{8,9}$/).required(),
  dni: yup.string().matches(/^\d{8,9}$/).required(),
  nombres: yup.string().trim().min(2).max(120).required(),
  apellidos: yup.string().trim().min(2).max(120).required(),
  correoElectronico: yup.string().trim().lowercase().email().required(),
  celular: yup.string().matches(/^\d{9}$/).required(),
}).required()
export const userUpdateSchema = userSchema.partial()

export const documentTypeSchema = yup.object({
  id: yup.string().oneOf(['dni', 'ce']).required(),
  nombre: yup.string().trim().min(2).max(80).required(),
  abreviatura: yup.string().trim().uppercase().min(2).max(5).required(),
}).required()
export const documentTypeUpdateSchema = documentTypeSchema.partial()

export const paymentTypeSchema = yup.object({
  metodoDepositoId: yup.number().integer().positive().required(),
  nombre: yup.string().trim().min(2).max(120).required(),
}).required()
export const paymentTypeUpdateSchema = paymentTypeSchema.partial()

export const registrationTypeSchema = yup.object({
  nombre: yup.string().trim().min(2).max(120).required(),
  badge: yup.string().trim().max(80).optional(),
  precio: yup.number().min(0).required(),
  institutionalPrice: yup.number().min(0).required(),
  descripcion: yup.string().trim().min(3).max(1000).required(),
  activo: yup.boolean().required(),
  value: yup.string().trim().max(120).optional(),
  caracteristicas: yup.array().of(yup.object({ icon: yup.string().required(), text: yup.string().required() })).nullable().optional(),
}).required()
export const registrationTypeUpdateSchema = registrationTypeSchema.partial()

export const eventSchema = yup.object({
  nombre: yup.string().trim().min(2).max(160).required(),
  fecha: yup.date().required(),
  hora_comienzo: yup.date().required(),
  hora_termino: yup.date().min(yup.ref('hora_comienzo')).required(),
}).required()
export const eventUpdateSchema = eventSchema.partial()

export const attendanceSchema = yup.object({
  id_usuario: yup.number().integer().positive().required(),
  id_evento: yup.number().integer().positive().required(),
}).required()

export const attendanceExportSchema = yup.object({
  eventos: yup.array().of(yup.number().integer().positive().required()).min(1).required(),
}).required()

export const voucherSchema = yup.object({
  codigo: yup.string().trim().min(3).max(100).required(),
  fechaPago: yup.date().max(new Date()).required(),
}).required()
