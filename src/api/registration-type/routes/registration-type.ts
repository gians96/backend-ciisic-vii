import * as registrationTypesController from '../controllers/registration-type'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { registrationTypeSchema, registrationTypeUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/registration-types',
        handler: registrationTypesController.list,
        middlewares: [],
    },
    {
        method: 'post',
        path: '/v1/registration-types',
        handler: registrationTypesController.create,
        middlewares: [verifyAdminRole, validateBody(registrationTypeSchema)],
    },
    {
        method: 'get',
        path: '/v1/registration-types/:id',
        handler: registrationTypesController.find,
        middlewares: [],
    },
    {
        method: 'put',
        path: '/v1/registration-types/:id',
        handler: registrationTypesController.update,
        middlewares: [verifyAdminRole, validateBody(registrationTypeUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/registration-types/:id',
        handler: registrationTypesController.remove,
        middlewares: [verifyAdminRole],
    },
]

export default buildRouter(routes)
