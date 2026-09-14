import * as classificationController from '../controllers/classification'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { namedSchema, namedUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/classification',
        handler: classificationController.list,
        middlewares: [],
    },
    {
        method: 'post',
        path: '/v1/classification',
        handler: classificationController.create,
        middlewares: [verifyAdminRole, validateBody(namedSchema)],
    },
    {
        method: 'get',
        path: '/v1/classification/:id',
        handler: classificationController.find,
        middlewares: [],
    },
    {
        method: 'put',
        path: '/v1/classification/:id',
        handler: classificationController.update,
        middlewares: [verifyAdminRole, validateBody(namedUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/classification/:id',
        handler: classificationController.remove,
        middlewares: [verifyAdminRole],
    }
]

export default buildRouter(routes)
