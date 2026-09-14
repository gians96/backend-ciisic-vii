import { prisma } from '../../../database/prisma'

export async function getVouchers() {
    return prisma.inscripcion.findMany({
        where: { file: { not: null } },
        select: { id: true, file: true, numeroOperacion: true, fechaPago: true, creadoEn: true },
    })

}

export async function getVoucherById(id: number) {
    return prisma.inscripcion.findFirst({
        where: { id, file: { not: null } },
        select: { id: true, file: true, numeroOperacion: true, fechaPago: true, creadoEn: true },
    })

}

export async function deleteVoucher(id: number) {
    return prisma.inscripcion.update({ where: { id }, data: { file: null } })
}
