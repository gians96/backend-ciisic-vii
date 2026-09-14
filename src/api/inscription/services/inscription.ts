import { prisma } from '../../../database/prisma'
import { Inscription, CreateInscription } from '../../../types/inscription'
import { generateInscripcionPDF } from '../utils/generatePdf'
import { sendApprovalEmail } from '../utils/sendEmail'

export async function getInscriptions() {
    return prisma.inscripcion.findMany({
        include: {
            usuario: true,
            tipoInscripcion: true,
            clasificacion: true,
            estado: true,
        },
    })
}

export async function getInscriptionById(id: number) {
    return prisma.inscripcion.findUnique({
        where: { id },
        include: {
            usuario: true,
            tipoInscripcion: true,
            clasificacion: true,
            estado: true,
        },
    })
}

export async function createInscription(data: CreateInscription): Promise<Inscription> {
    // Transacción para crear usuario e inscripción de forma atómica
    return await prisma.$transaction(async (tx) => {
        // 1. Verificar si el usuario ya existe por email o DNI
        const existingUser = await tx.usuario.findFirst({
            where: {
                OR: [
                    { correoElectronico: data.usuario.correoElectronico },
                    { dni: data.usuario.dni }
                ]
            }
        })

        // 2. Si ya existe, verificar si ya tiene una inscripción
        if (existingUser) {
            const existingInscription = await tx.inscripcion.findFirst({
                where: { usuarioId: existingUser.id }
            })

            if (existingInscription) {
                throw new Error('Ya existe una inscripción registrada para este usuario.')
            }
        }

        // 3. Crear el usuario si no existe, o usar el existente
        let user = existingUser
        if (!user) {
            user = await tx.usuario.create({
                data: {
                    numero: data.usuario.dni, // El campo numero debe ser igual al DNI
                    idTipoDocumentoId: data.usuario.idTipoDocumentoId,
                    dni: data.usuario.dni,
                    nombres: data.usuario.nombres,
                    apellidos: data.usuario.apellidos,
                    correoElectronico: data.usuario.correoElectronico,
                    celular: data.usuario.celular,
                }
            })
        }

        // Si el email es institucional, marcar el campo correspondiente
        let hasDiscountInstitucionalEmail = isInstitutionalEmail(data.usuario.correoElectronico)

        let planInscripcion = await tx.tipoInscripcion.findUnique({
            where: { id: data.tipoInscripcionId }
        })
        if (!planInscripcion) {
            throw new Error(`El tipo de inscripción con id "${data.tipoInscripcionId}" no existe.`)
        }

        // 5. Crear la inscripción con todos los datos
        const inscription = await tx.inscripcion.create({
            data: {
                usuarioId: user.id,
                tipoInscripcionId: data.tipoInscripcionId || null,
                clasificacionId: data.clasificacionId || null,
                modalidadDeposito: data.modalidadDeposito || null,
                bancoSeleccionado: data.bancoSeleccionado || null,
                tipoOperacion: data.tipoOperacion || null,
                billeteraDigital: data.billeteraDigital || null,
                file: data.file || null,
                numeroOperacion: data.numeroOperacion,
                fechaPago: data.fechaPago,
                pago: hasDiscountInstitucionalEmail ? planInscripcion.institutionalPrice : planInscripcion.precio,
                esEmailInstitucional: hasDiscountInstitucionalEmail,
                hasDiscount: data.hasDiscount || false,
                descuento: data.descuento || 0,
                estadoId: data.estadoId || 1, // Estado por defecto 'Pendiente'
            },
            include: {
                usuario: true,
                tipoInscripcion: true,
                clasificacion: true,
                estado: true,
            }
        })

        return inscription
    })
}

export async function deleteInscription(id: number) {
    return prisma.inscripcion.delete({
        where: { id }
    })
}


const isInstitutionalEmail = (email: string): boolean => {
    const institutionalDomains = ['undc.edu.pe']
    const emailDomain = email.split('@')[1].toLowerCase()
    return institutionalDomains.includes(emailDomain)
}

export async function updateInscriptionStatus(id: number, estadoId: number) {
    const inscription = await prisma.inscripcion.findUnique({
        where: { id },
        include: { usuario: true },
    })

    if (!inscription) {
        throw new Error(`No se encontró la inscripción con id ${id}`)
    }

    const user = inscription.usuario
    if (!user) throw new Error('Inscripción sin usuario asociado')

    if (estadoId !== 2) {
        return await prisma.inscripcion.update({
            where: { id },
            data: { estadoId },
            include: {
                usuario: true,
                tipoInscripcion: true,
                clasificacion: true,
                estado: true,
            },
        })
    }

    const updated = await prisma.inscripcion.update({
        where: { id },
        data: { estadoId },
        include: {
            usuario: true,
            tipoInscripcion: true,
            clasificacion: true,
            estado: true,
        },
    })

    try {
        const pdfPath = await generateInscripcionPDF({
            id: user.id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            dni: user.dni,
            correo: user.correoElectronico,
            celular: user.celular,
            fechaCreacion: inscription.creadoEn,
            fechaAprobada: new Date(),
        })

        await sendApprovalEmail(user.correoElectronico, user.nombres, pdfPath)
    } catch {
        console.error('No se pudo generar o enviar la credencial de una inscripción')
    }

    return updated
}
