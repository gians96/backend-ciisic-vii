import { DocumentType, normaliceData } from './types'
import { env } from '../../../../config/env'
// interface ResponseRUCDecolecta {
//     data: DataRUC;
//     success: boolean;
// }

// interface DataRUC {
//     nombre_o_razon_social: string;
//     ruc: string;
//     estado: string;
//     condicion: string;
//     direccion: string;
//     dirección_completa: string;
//     distrito: string;
//     provincia: string;
//     departamento: string;
//     ubigeo_sunat: string;
//     ubigeo: string[];
//     es_agente_de_retencion: boolean;
//     es_buen_contribuyente: boolean;
// }

export interface ResponseDNIDecolecta {
    data: DataDNI;
    success: boolean;
}

export interface DataDNI {
    nombre_completo: string;
    numero: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    codigo_verificacion: string;
    ubigeo_sunat: string;
    ubigeo: string[];
    direccion: string;
}

const decolectaApi = {
    baseApi: 'https://api.decolecta.com/',
    token: env.DECOLECTA_TOKEN,
    endpoints: [
        { type: DocumentType.DNI, path: 'v1/reniec/dni/', method: 'GET' },
        { type: DocumentType.RUC, path: 'v1/sunat/ruc/', method: 'GET' }
    ],
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DECOLECTA_TOKEN}`
    }
}

export const fetchDecolectaData = async (type: DocumentType, number: string) => {
    const endpoint = decolectaApi.endpoints.find(ep => ep.type === type)
    if (!endpoint) {
        throw new Error('Tipo de consulta no soportado')
    }
    const url = `${decolectaApi.baseApi}${endpoint.path}${number}`
    let normaliceData: normaliceData
    const fetchResponse = await fetch(url, {
        method: endpoint.method,
        headers: decolectaApi.headers
    })
    if (!fetchResponse.ok) {
        throw new Error('Error al realizar la consulta')
    }

    // if (type === DocumentType.RUC) {
    //     const response = await fetchResponse.json() as ResponseRUCDecolecta
    //     normaliceData = {
    //         idTipoDocumento: DocumentType.RUC,
    //         numero: response.data.ruc,
    //         nombres: response.data.nombre_o_razon_social,
    //         apellidos: ''
    //     }
    //     return normaliceData
    // }
    if (type === DocumentType.DNI) {
        const response = await fetchResponse.json() as ResponseDNIDecolecta
        normaliceData = {
            idTipoDocumento: DocumentType.DNI,
            numero: response.data.numero,
            nombres: response.data.nombres,
            apellidos: response.data.apellido_paterno + ' ' + response.data.apellido_materno
        }
        return normaliceData
    }

}

