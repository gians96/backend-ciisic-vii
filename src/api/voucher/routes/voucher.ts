import * as voucherController from '../controllers/voucher'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/voucher',
        handler: voucherController.list,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'get',
        path: '/v1/voucher/:id/file',
        handler: voucherController.download,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'get',
        path: '/v1/voucher/:id',
        handler: voucherController.find,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'delete',
        path: '/v1/voucher/:id',
        handler: voucherController.remove,
        middlewares: [verifyAdminRole],
    }
]

export default buildRouter(routes)
