import * as yup from 'yup'

export const createContactSchema = yup.object({
  firstName: yup.string().trim().min(2).max(80).required(),
  lastName: yup.string().trim().min(2).max(80).required(),
  email: yup.string().trim().lowercase().email().required(),
  subject: yup.string().trim().min(3).max(150).required(),
  message: yup.string().trim().min(10).max(2000).required(),
}).required()
