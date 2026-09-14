import * as usersController from '../controllers/users'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { userSchema, userUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/users',
        handler: usersController.list,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'post',
        path: '/v1/users',
        handler: usersController.create,
        middlewares: [verifyAdminRole, validateBody(userSchema)],
    },
    {
        method: 'get',
        path: '/v1/users/:id',
        handler: usersController.find,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'get',
        path: '/v1/users/email/:email',
        handler: usersController.findByEmail,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'put',
        path: '/v1/users/:id',
        handler: usersController.update,
        middlewares: [verifyAdminRole, validateBody(userUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/users/:id',
        handler: usersController.remove,
        middlewares: [verifyAdminRole],
    },
]

export default buildRouter(routes)
