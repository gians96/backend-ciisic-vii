import * as inscriptionController from '../controllers/inscription'
import { AppRoute, buildRouter } from '../../../core/routes'
import { upload, validateUploadedFileContent } from '../../../middlewares/upload'
import { verifyAdminRole } from '../../../middlewares/auth'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/inscription',
        handler: inscriptionController.list,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'post',
        path: '/v1/inscription',
        handler: inscriptionController.create,
        middlewares: [upload.single('file'), validateUploadedFileContent],
    },
    {
        method: 'get',
        path: '/v1/inscription/:id',
        handler: inscriptionController.find,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'delete',
        path: '/v1/inscription/:id',
        handler: inscriptionController.remove,
        middlewares: [verifyAdminRole],
    },
    {
        method: 'put',
        path: '/v1/inscription/:id/status',
        handler: inscriptionController.updateStatus,
        middlewares: [verifyAdminRole],
    }
]

export default buildRouter(routes)
