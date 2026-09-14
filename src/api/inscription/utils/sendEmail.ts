import fs from 'fs'
import path from 'path'
import SibApiV3Sdk from 'sib-api-v3-sdk'
import { env } from '../../../../config/env'

const client = SibApiV3Sdk.ApiClient.instance
client.authentications['api-key'].apiKey = env.BREVO_API_KEY
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi()

export async function sendApprovalEmail(toEmail: string, userName: string, pdfPath: string) {
    try {
        if (!env.BREVO_API_KEY || !env.BREVO_SENDER) throw new Error('Brevo no está configurado')
        const sender = { email: env.BREVO_SENDER, name: env.BREVO_SENDER_NAME }

        const fileName = path.basename(pdfPath)
        // Leer la plantilla HTML
        const templatePath = path.join(__dirname, 'templates', 'approval.html')
        let htmlContent = fs.readFileSync(templatePath, 'utf8')

        // Reemplazar placeholders
        htmlContent = htmlContent
            .replace('{{userName}}', userName)

        // Enviar correo
        await emailApi.sendTransacEmail({
            sender,
            to: [{ email: toEmail }],
            subject: env.BREVO_SENDER_SUBJECT,
            htmlContent,
            attachment: [{ name: fileName, content: fs.readFileSync(pdfPath).toString('base64') }],
        })

    } catch {
        console.error('No se pudo enviar un correo mediante Brevo')
    }
}
