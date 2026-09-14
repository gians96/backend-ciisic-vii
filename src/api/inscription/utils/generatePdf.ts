import fs from 'fs'
import path from 'path'
import QRCode from 'qrcode'
import puppeteer from 'puppeteer'
import { env } from '../../../../config/env'

export async function generateInscripcionPDF(user: {
    id: number
    nombres: string
    apellidos: string
    dni: string
    correo: string
    celular?: string
    fechaCreacion: Date
    fechaAprobada?: Date
}) {
    const uploadsDir = env.UPLOADS_DIR
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const pdfPath = path.join(uploadsDir, `credential_${user.id}.pdf`)

    const qrDataURL = await QRCode.toDataURL(String(user.id))

    const formatDate = (date?: Date) => {
        return date
            ? new Intl.DateTimeFormat('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(date)
            : '---'
    }

    const templatePath = path.join(
        __dirname,
        '../../inscription/utils/templates/inscription.html'
    )
    let html = fs.readFileSync(templatePath, 'utf8')

    const logoPath = path.join(process.cwd(), 'public', 'logo_congreso.png')
    let logoBase64 = ''

    try {
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath)
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
        } else {
            console.warn(`⚠️ Logo no encontrado en: ${logoPath}`)
        }
    } catch {
        console.error('No se pudo cargar el logo para la credencial')
    }

    html = html
        .replace('{{LOGO}}', logoBase64)
        .replace('{{FECHA_GENERACION}}', formatDate(new Date()))
        .replace('{{NOMBRES}}', user.nombres)
        .replace('{{APELLIDOS}}', user.apellidos)
        .replace('{{DNI}}', user.dni)
        .replace('{{CORREO}}', user.correo)
        .replace('{{CELULAR}}', user.celular || '---')
        .replace('{{FECHA_CREACION}}', formatDate(user.fechaCreacion))
        .replace('{{FECHA_APROBADA}}', formatDate(user.fechaAprobada))
        .replace('{{QR}}', qrDataURL)

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...(process.env.PUPPETEER_EXECUTABLE_PATH
            ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
            : {}),
    })

    try {
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'load' })
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            landscape: true,
            margin: {
                top: '10px',
                right: '10px',
                bottom: '10px',
                left: '10px',
            },
            printBackground: true,
            preferCSSPageSize: true,
        })
    } finally {
        await browser.close()
    }

    return pdfPath
}
