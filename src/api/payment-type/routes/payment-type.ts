import * as paymentTypesController from '../controllers/payment-type'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { paymentTypeSchema, paymentTypeUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/payment-type',
        handler: paymentTypesController.list,
        middlewares: [],
    },
    {
        method: 'post',
        path: '/v1/payment-type',
        handler: paymentTypesController.create,
        middlewares: [verifyAdminRole, validateBody(paymentTypeSchema)],
    },
    {
        method: 'get',
        path: '/v1/payment-type/:id',
        handler: paymentTypesController.find,
        middlewares: [],
    },
    {
        method: 'put',
        path: '/v1/payment-type/:id',
        handler: paymentTypesController.update,
        middlewares: [verifyAdminRole, validateBody(paymentTypeUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/payment-type/:id',
        handler: paymentTypesController.remove,
        middlewares: [verifyAdminRole],
    },
]

export default buildRouter(routes)
