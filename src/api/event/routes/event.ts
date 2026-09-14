import * as eventController from '../controllers/event'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { eventSchema, eventUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
  { method: 'get', path: '/v1/events', handler: eventController.list, middlewares: [] },
  { method: 'get', path: '/v1/events/:id', handler: eventController.find, middlewares: [] },
  { method: 'post', path: '/v1/events', handler: eventController.create, middlewares: [verifyAdminRole, validateBody(eventSchema)] },
  { method: 'put', path: '/v1/events/:id', handler: eventController.update, middlewares: [verifyAdminRole, validateBody(eventUpdateSchema)] },
  { method: 'delete', path: '/v1/events/:id', handler: eventController.remove, middlewares: [verifyAdminRole] }
]

export default buildRouter(routes)
