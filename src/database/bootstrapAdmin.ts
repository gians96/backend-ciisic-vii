import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

async function bootstrapAdmin() {
    const correoElectronico = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
    const contrasena = process.env.BOOTSTRAP_ADMIN_PASSWORD
    if (!correoElectronico || !contrasena || contrasena.length < 12) {
        throw new Error('BOOTSTRAP_ADMIN_EMAIL y BOOTSTRAP_ADMIN_PASSWORD (mínimo 12 caracteres) son obligatorios')
    }

    const existing = await prisma.administradores.findUnique({ where: { correoElectronico } })
    if (existing) {
        console.log('El administrador inicial ya existe; no se modificó su contraseña.')
        return
    }

    await prisma.administradores.create({
        data: {
            nombres: process.env.BOOTSTRAP_ADMIN_NAMES || 'Administrador',
            apellidos: process.env.BOOTSTRAP_ADMIN_SURNAMES || 'CIISIC',
            correoElectronico,
            contrasena: await bcrypt.hash(contrasena, 12),
            rolId: 1,
        },
    })
    console.log('Administrador inicial creado correctamente.')
}

bootstrapAdmin().catch((error) => {
    console.error(error instanceof Error ? error.message : 'No se pudo crear el administrador inicial')
    process.exitCode = 1
}).finally(() => prisma.$disconnect())
