// routes/attendance.ts
import * as attendanceController from '../controllers/attendance'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { attendanceExportSchema, attendanceSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
  { method: 'post', path: '/v1/attendances/export', handler: attendanceController.exportToExcel, middlewares: [verifyAdminRole, validateBody(attendanceExportSchema)] },
  { method: 'get', path: '/v1/attendances/:id', handler: attendanceController.find, middlewares: [verifyAdminRole] },
  { method: 'post', path: '/v1/attendances', handler: attendanceController.create, middlewares: [verifyAdminRole, validateBody(attendanceSchema)] },
  { method: 'post', path: '/v1/attendances/overtime', handler: attendanceController.createOvertime, middlewares: [verifyAdminRole, validateBody(attendanceSchema)] },
  { method: 'delete', path: '/v1/attendances/:id', handler: attendanceController.remove, middlewares: [verifyAdminRole] }
]

export default buildRouter(routes)
