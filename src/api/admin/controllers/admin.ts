import { Request, Response } from 'express'

import {
    getAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    loginAdmin
} from '../services/admin'
import type { AuthenticatedRequest } from '../../../middlewares/auth'

export async function list(req: Request, res: Response) {
    try {
        const data = await getAdmins()
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({
            error: 'Error inesperado',
            details: (error as Error).message,
        })
    }
}

export async function create(req: Request, res: Response) {
    try {
        const data = req.body
        const classification = await createAdmin(data)
        return res.status(201).json(classification)
    } catch (error) {
        return res.status(400).json({
            error: 'Error en la creación de la clasificación',
            details: (error as Error).message,
        })
    }
}

export async function find(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El id debe ser un número válido' })
        }
        const classification = await getAdminById(id)
        if (!classification) {
            return res.status(404).json({ error: `Admin con id ${id} no encontrado` })
        }
        return res.json(classification)
    } catch (error) {
        return res.status(500).json({
            error: 'Error al obtener el admin',
            details: (error as Error).message,
        })
    }
}

export async function update(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El id debe ser un número válido' })
        }
        const data = req.body
        const classification = await updateAdmin(id, data)
        return res.status(200).json(classification)
    } catch (error) {
        return res.status(400).json({
            error: 'Error en la actualización del admin',
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
        await deleteAdmin(id)
        return res.status(200).json({ message: 'Admin eliminado correctamente' })
    } catch (error) {
        return res.status(500).json({
            error: 'Error al eliminar el admin',
            details: (error as Error).message,
        })
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { correoElectronico, contrasena } = req.body

        if (!correoElectronico || !contrasena) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' })
        }

        const { jwt } = await loginAdmin(correoElectronico, contrasena)

        return res.status(200).json({ jwt })
    } catch {
        return res.status(401).json({
            success: false,
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales incorrectas',
        })
    }
}

export function session(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ success: true, user: req.user })
}
