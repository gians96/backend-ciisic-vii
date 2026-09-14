import { DocumentType, normaliceData } from './types'
import { env } from '../../../../config/env'

export const nubetecApi = {
    baseApi: 'https://api-test.nube-tec.com/api/v1/consultation',
    token: env.NUBETEC_TOKEN,
    endpoints: [
        { type: DocumentType.DNI, path: '/dni/', method: 'GET' },
        { type: DocumentType.CE, path: '/ce/', method: 'GET' },
        { type: DocumentType.RUC, path: '/ruc/', method: 'GET' }
    ],
    headers: {
        'X-API-Token': env.NUBETEC_TOKEN
    }
}

export interface ResponseNubetec {
    success: boolean;
    data: Data;
}

export interface Data {
    documentNumber: string;
    documentType: string;
    names: string;
    paternalSurname: string;
    maternalSurname: string;
    fullName: string;
}


export const fetchNubeTecData = async (type: DocumentType, number: string) => {
    const endpoint = nubetecApi.endpoints.find(ep => ep.type === type)
    if (!endpoint) {
        throw new Error('Tipo de consulta no soportado')
    }
    const url = `${nubetecApi.baseApi}${endpoint.path}${number}`
    let normaliceData: normaliceData
    const fetchResponse = await fetch(url, {
        method: endpoint.method,
        headers: nubetecApi.headers
    })
    if (!fetchResponse.ok) {
        throw new Error('Error al realizar la consulta')
    }

    const response = await fetchResponse.json() as ResponseNubetec
    normaliceData = {
        idTipoDocumento: type,
        numero: response.data.documentNumber,
        nombres: response.data.names,
        apellidos: response.data.paternalSurname + ' ' + response.data.maternalSurname
    }
    return normaliceData
}
