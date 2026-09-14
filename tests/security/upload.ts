import request from 'supertest'
import app from '../../src/app'

describe('seguridad de uploads', () => {
  it('rechaza contenido que no coincide con el MIME declarado', async () => {
    const response = await request(app)
      .post('/api/v1/inscription')
      .attach('file', Buffer.from('not-a-real-png'), { filename: 'voucher.png', contentType: 'image/png' })
    expect(response.status).toBe(422)
    expect(response.body).toMatchObject({ success: false, code: 'INVALID_FILE_CONTENT' })
  })

  it('rechaza archivos que exceden el límite configurado', async () => {
    const response = await request(app)
      .post('/api/v1/inscription')
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'voucher.png', contentType: 'image/png' })
    expect(response.status).toBe(413)
    expect(response.body).toMatchObject({ success: false, code: 'UPLOAD_LIMIT_EXCEEDED' })
  })
})
