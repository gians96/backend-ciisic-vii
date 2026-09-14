import * as rolesController from '../controllers/roles'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifySuperAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { namedSchema, namedUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/roles',
        handler: rolesController.list,
        middlewares: [verifySuperAdminRole],
    },
    {
        method: 'post',
        path: '/v1/roles',
        handler: rolesController.create,
        middlewares: [verifySuperAdminRole, validateBody(namedSchema)],
    },
    {
        method: 'get',
        path: '/v1/roles/:id',
        handler: rolesController.find,
        middlewares: [verifySuperAdminRole],
    },
    {
        method: 'put',
        path: '/v1/roles/:id',
        handler: rolesController.update,
        middlewares: [verifySuperAdminRole, validateBody(namedUpdateSchema)],
    }
]

export default buildRouter(routes)
