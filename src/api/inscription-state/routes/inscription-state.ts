import * as inscriptionStateController from '../controllers/inscription-state'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { namedSchema, namedUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/inscription-state',
        handler: inscriptionStateController.list,
        middlewares: [],
    },
    {
        method: 'post',
        path: '/v1/inscription-state',
        handler: inscriptionStateController.create,
        middlewares: [verifyAdminRole, validateBody(namedSchema)],
    },
    {
        method: 'get',
        path: '/v1/inscription-state/:id',
        handler: inscriptionStateController.find,
        middlewares: [],
    },
    {
        method: 'put',
        path: '/v1/inscription-state/:id',
        handler: inscriptionStateController.update,
        middlewares: [verifyAdminRole, validateBody(namedUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/inscription-state/:id',
        handler: inscriptionStateController.remove,
        middlewares: [verifyAdminRole],
    }
]

export default buildRouter(routes)
