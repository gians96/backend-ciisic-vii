import fs from 'fs'
import path from 'path'
import QRCode from 'qrcode'
import htmlPdf from 'html-pdf-node'

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
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const pdfPath = path.join(uploadsDir, `insc_${user.dni}.pdf`)

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
    } catch (err) {
        console.error('❌ Error cargando logo:', err)
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

    const file = { content: html }
    const options = {
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
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    }

    const pdfBuffer = await htmlPdf.generatePdf(file, options)
    fs.writeFileSync(pdfPath, pdfBuffer)

    return pdfPath
}
