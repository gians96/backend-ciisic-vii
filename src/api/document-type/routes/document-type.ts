import * as typeDocumentCtrl from '../controllers/document-type.ctrl'
import { AppRoute, buildRouter } from '../../../core/routes'
import { verifyAdminRole } from '../../../middlewares/auth'
import { validateBody } from '../../../middlewares/validate'
import { documentTypeSchema, documentTypeUpdateSchema } from '../../sharedValidation'

const routes: AppRoute[] = [
    {
        method: 'get',
        path: '/v1/document-type',
        handler: typeDocumentCtrl.listCtrl,
        middlewares: [],
    },
    {
        method: 'post',
        path: '/v1/document-type',
        handler: typeDocumentCtrl.createCtrl,
        middlewares: [verifyAdminRole, validateBody(documentTypeSchema)],
    },
    {
        method: 'get',
        path: '/v1/document-type/:id',
        handler: typeDocumentCtrl.findCtrl,
        middlewares: [],
    },
    {
        method: 'put',
        path: '/v1/document-type/:id',
        handler: typeDocumentCtrl.updateCtrl,
        middlewares: [verifyAdminRole, validateBody(documentTypeUpdateSchema)],
    },
    {
        method: 'delete',
        path: '/v1/document-type/:id',
        handler: typeDocumentCtrl.removeCtrl,
        middlewares: [verifyAdminRole],
    },
]

export default buildRouter(routes)
