import * as contactController from '../controllers/contact'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { createContactSchema } from '../validation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/contact',
        handler: contactController.list,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'post',
        path: '/v1/contact',
        handler: contactController.create,
        middlewares: [validateBody(createContactSchema)],
    },
    {
        method: 'get',
        path: '/v1/contact/:id',
        handler: contactController.find,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'delete',
        path: '/v1/contact/:id',
        handler: contactController.remove,
        middlewares: [verifyAdminRole],
    }
]

export default buildRouter(routes)
