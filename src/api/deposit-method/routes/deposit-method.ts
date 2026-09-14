import * as depositMetodTypesController from '../controllers/deposit-method'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { namedSchema, namedUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/deposit-method',
        handler: depositMetodTypesController.list,
        middlewares: [],
    },
    {
        method: 'post',
        path: '/v1/deposit-method',
        handler: depositMetodTypesController.create,
        middlewares: [verifyAdminRole, validateBody(namedSchema)],
    },
    {
        method: 'get',
        path: '/v1/deposit-method/:id',
        handler: depositMetodTypesController.find,
        middlewares: [],
    },
    {
        method: 'put',
        path: '/v1/deposit-method/:id',
        handler: depositMetodTypesController.update,
        middlewares: [verifyAdminRole, validateBody(namedUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/deposit-method/:id',
        handler: depositMetodTypesController.remove,
        middlewares: [verifyAdminRole],
    },
]

export default buildRouter(routes)
