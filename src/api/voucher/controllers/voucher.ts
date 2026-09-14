import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { getVouchers, getVoucherById, deleteVoucher } from '../services/voucher'
import { getInscriptionById } from '../../inscription/services/inscription'
import { uploadsDir } from '../../../middlewares/upload'

export async function list(req: Request, res: Response) {
    try {
        const data = await getVouchers()
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({
            error: 'Error inesperado',
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

        const classification = await getVoucherById(id)

        if (!classification) {
            return res.status(404).json({ error: `Voucher con id ${id} no encontrado` })
        }

        return res.json(classification)

    } catch (error) {
        return res.status(500).json({
            error: 'Error al obtener el voucher',
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

        const voucher = await getVoucherById(id)
        if (!voucher?.file) return res.status(404).json({ error: 'Voucher no encontrado' })
        await deleteVoucher(id)
        const filePath = path.resolve(uploadsDir, path.basename(voucher.file))
        if (filePath.startsWith(uploadsDir) && fs.existsSync(filePath)) fs.unlinkSync(filePath)

        return res.status(200).json({ message: 'Voucher eliminado correctamente' })

    } catch (error) {
        return res.status(500).json({
            error: 'Error al eliminar el Voucher',
            details: (error as Error).message,
        })
    }
}

export async function download(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) return res.status(400).json({ success: false, code: 'INVALID_ID', message: 'ID inválido' })
        const inscription = await getInscriptionById(id)
        if (!inscription?.file) return res.status(404).json({ success: false, code: 'FILE_NOT_FOUND', message: 'Voucher no encontrado' })
        const filePath = path.resolve(uploadsDir, path.basename(inscription.file))
        if (!filePath.startsWith(uploadsDir) || !fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, code: 'FILE_NOT_FOUND', message: 'Voucher no encontrado' })
        }
        return res.sendFile(filePath)
    } catch {
        return res.status(500).json({ success: false, code: 'VOUCHER_DOWNLOAD_ERROR', message: 'No se pudo descargar el voucher' })
    }
}
