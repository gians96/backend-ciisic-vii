import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { getInscriptions, getInscriptionById, createInscription, deleteInscription, updateInscriptionStatus } from '../services/inscription'
import { removeUploadedFile } from '../../../middlewares/upload'
import { createInscriptionSchema } from '../validation'
import type { CreateInscription } from '../../../types/inscription'

// Definir tipo para el archivo de multer
type MulterFile = {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    destination: string
    filename: string
    path: string
    size: number
}

// Extender Request para incluir el archivo
interface RequestWithFile extends Omit<Request, 'file'> {
    file?: MulterFile
}

export async function list(req: Request, res: Response) {
    try {
        const data = await getInscriptions()
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({
            error: 'Error inesperado',
            details: (error as Error).message,
        })
    }
}

export async function create(req: RequestWithFile, res: Response) {
    try {
        // Manejar tanto JSON como form-data
        let requestData

        if (req.is('multipart/form-data')) {
            // Si viene con archivo (multipart/form-data) - NUEVO ESQUEMA
            const file = req.file
            requestData = {
                // Datos del usuario
                usuario: JSON.parse(req.body.usuario || '{}'),

                // IDs de relaciones
                tipoInscripcionId: parseInt(req.body.tipoInscripcionId, 10),
                clasificacionId: req.body.clasificacionId ? parseInt(req.body.clasificacionId, 10) : undefined,
                estadoId: req.body.estadoId ? parseInt(req.body.estadoId, 10) : 1,

                // Nuevos campos de pago integrados
                modalidadDeposito: req.body.modalidadDeposito || undefined,
                bancoSeleccionado: req.body.bancoSeleccionado || undefined,
                tipoOperacion: req.body.tipoOperacion || undefined,
                billeteraDigital: req.body.billeteraDigital || undefined,
                numeroOperacion: req.body.numeroOperacion,
                fechaPago: new Date(req.body.fechaPago),
                pago: parseFloat(req.body.pago) || 0,

                // Campos de descuento (convertir strings a boolean)
                esEmailInstitucional: req.body.esEmailInstitucional === 'true',
                hasDiscount: req.body.hasDiscount === 'true',
                descuento: parseFloat(req.body.descuento) || 0,

                // Archivo
                file: file ? file.filename : undefined
            }
        } else {
            // Si viene como JSON puro - NUEVO ESQUEMA
            requestData = {
                // Datos del usuario
                usuario: req.body.usuario,

                // IDs de relaciones
                tipoInscripcionId: parseInt(req.body.tipoInscripcionId, 10),
                clasificacionId: req.body.clasificacionId ? parseInt(req.body.clasificacionId, 10) : undefined,
                estadoId: req.body.estadoId ? parseInt(req.body.estadoId, 10) : 1,

                // Nuevos campos de pago integrados
                modalidadDeposito: req.body.modalidadDeposito || undefined,
                bancoSeleccionado: req.body.bancoSeleccionado || undefined,
                tipoOperacion: req.body.tipoOperacion || undefined,
                billeteraDigital: req.body.billeteraDigital || undefined,
                numeroOperacion: req.body.numeroOperacion,
                fechaPago: new Date(req.body.fechaPago),
                pago: parseFloat(req.body.pago) || 0,

                // Campos de descuento (asegurar que sean boolean)
                esEmailInstitucional: Boolean(req.body.esEmailInstitucional),
                hasDiscount: Boolean(req.body.hasDiscount),
                descuento: parseFloat(req.body.descuento) || 0,

                // Archivo
                file: req.body.file || undefined
            }
        }

        const validatedData = await createInscriptionSchema.validate(requestData, { abortEarly: false, stripUnknown: true })
        const inscription = await createInscription(validatedData as CreateInscription)
        return res.status(201).json({
            success: true,
            message: 'Inscripción creada exitosamente',
            data: inscription
        })
    } catch (error) {
        removeUploadedFile(req.file)

        const errorMessage = (error as Error).message

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = Array.isArray(error.meta?.target)
                ? error.meta.target.map(String)
                : [String(error.meta?.target || '')]
            const isOperationDuplicate = target.some((field) => field.includes('numeroOperacion'))
            return res.status(409).json({
                success: false,
                code: isOperationDuplicate ? 'OPERATION_ALREADY_REGISTERED' : 'DUPLICATE_RECORD',
                message: isOperationDuplicate
                    ? 'El número de operación ya está registrado.'
                    : 'Ya existe un registro con estos datos.',
            })
        }

        if (errorMessage.includes('Ya existe una inscripción registrada')) {
            return res.status(409).json({
                success: false,
                error: 'Usuario ya registrado',
                message: errorMessage,
            })
        }

        return res.status(400).json({
            success: false,
            code: 'INSCRIPTION_INVALID',
            error: 'Error en la creación de la inscripción',
            message: errorMessage,
        })
    }
}

export async function find(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El id debe ser un número válido' })
        }
        const inscription = await getInscriptionById(id)
        if (!inscription) {
            return res.status(404).json({ error: `Inscripción con id ${id} no encontrada` })
        }
        return res.status(200).json({
            success: true,
            message: 'Inscripción encontrada',
            data: inscription
        })
    } catch (error) {
        return res.status(500).json({
            error: 'Error al obtener la inscripción',
            details: (error as Error).message,
        })
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El id debe ser un número válido' })
        }
        await deleteInscription(id)
        return res.status(200).json({ message: 'Inscripción eliminada correctamente' })
    } catch (error) {
        return res.status(500).json({
            error: 'Error al eliminar la inscripción',
            details: (error as Error).message,
        })
    }
}

export async function updateStatus(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id, 10)
        const { estadoId } = req.body

        if (isNaN(id) || typeof estadoId !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Parámetros inválidos. Se requiere un id numérico y estadoId numérico.',
            })
        }

        const updated = await updateInscriptionStatus(id, estadoId)
        return res.status(200).json({
            success: true,
            message: 'Estado de inscripción actualizado correctamente',
            data: updated,
        })
    } catch {
        console.error('Error al actualizar el estado de una inscripción')
        return res.status(500).json({
            success: false,
            error: 'Error al actualizar el estado de la inscripción',
        })
    }
}
