import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app'
import { env } from '../../config/env'

function tokenForRole(rolId: number) {
  return jwt.sign({
    user: {
      id: 1,
      nombres: 'Test',
      apellidos: 'Admin',
      correoElectronico: 'admin@example.com',
      rolId,
      rolNombre: rolId === 1 ? 'SuperAdmin' : 'Admin',
    },
  }, env.JWT_SECRET, { expiresIn: '1h' })
}

describe('seguridad de rutas administrativas', () => {
  it('rechaza una ruta privada sin token', async () => {
    const response = await request(app).get('/api/v1/users')
    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({ success: false, code: 'MISSING_TOKEN' })
  })

  it('permite consultar la sesión a Admin', async () => {
    const response = await request(app)
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${tokenForRole(2)}`)
    expect(response.status).toBe(200)
    expect(response.body.user).not.toHaveProperty('contrasena')
    expect(response.body.user.rolId).toBe(2)
  })

  it('impide que Admin acceda al CRUD de SuperAdmin', async () => {
    const response = await request(app)
      .get('/api/v1/admin')
      .set('Authorization', `Bearer ${tokenForRole(2)}`)
    expect(response.status).toBe(403)
    expect(response.body).toMatchObject({ success: false, code: 'FORBIDDEN' })
  })
})
