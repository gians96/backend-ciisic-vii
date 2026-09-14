import { ReniecResponse } from '../../../types/reniec'
import { fetchNubeTecData } from '../providers/nube-tec.api'
import { DocumentType } from '../providers/types'
import { env } from '../../../../config/env'

export async function fetchReniecData(number: string) {

  const documentType = number.length === 8 ? DocumentType.DNI : DocumentType.CE
  
  switch (documentType) {
    case DocumentType.DNI:
      if (env.RENIEC_PROVIDER === 'nubetec') return fetchNubeTecData(documentType, number)
      break
    case DocumentType.CE:
      throw new Error('Consulta de CE no soportada por RENIEC')
    default:
      throw new Error('Tipo de documento no soportado')
  } 
  const tokenReniec = env.RENIEC_TOKEN
  const api_dni = env.API_RENIEC_DNI

  if (!tokenReniec) {
    throw new Error('Falta RENIEC_TOKEN')
  }

  if (!api_dni) {
    throw new Error('Falta API_RENIEC_DNI')
  }

  const response = await fetch(`${api_dni}v1/reniec/dni/${number}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenReniec}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Error en upstream')
  }

  const json = (await response.json()) as ReniecResponse
  return json
}
