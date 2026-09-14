import * as yup from 'yup'

export const createInscriptionSchema = yup.object({
  usuario: yup.object({
    idTipoDocumentoId: yup.string().oneOf(['dni', 'ce']).required(),
    dni: yup.string().matches(/^\d{8,9}$/).required(),
    nombres: yup.string().trim().min(2).max(120).required(),
    apellidos: yup.string().trim().min(2).max(120).required(),
    correoElectronico: yup.string().trim().lowercase().email().required(),
    celular: yup.string().matches(/^\d{9}$/).required(),
  }).required(),
  tipoInscripcionId: yup.number().integer().positive().required(),
  clasificacionId: yup.number().integer().positive().nullable().optional(),
  estadoId: yup.number().integer().positive().default(1),
  modalidadDeposito: yup.string().oneOf(['banco', 'billetera']).required(),
  bancoSeleccionado: yup.string().trim().max(80).nullable().optional(),
  tipoOperacion: yup.string().trim().max(80).nullable().optional(),
  billeteraDigital: yup.string().trim().max(80).nullable().optional(),
  numeroOperacion: yup.string().trim().min(3).max(100).required(),
  fechaPago: yup.date().max(new Date()).required(),
  pago: yup.number().min(0).required(),
  esEmailInstitucional: yup.boolean().default(false),
  hasDiscount: yup.boolean().default(false),
  descuento: yup.number().min(0).default(0),
  file: yup.string().optional(),
}).required()
