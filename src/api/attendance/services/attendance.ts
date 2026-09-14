import { prisma } from '../../../database/prisma'
import { Asistencia } from '../../../types/attendance'

class HttpError extends Error {
  public readonly status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

const TZ = 'America/Lima'

function nowInLima() {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('es-PE', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(now).reduce<Record<string, string>>((a, p) => {
    a[p.type] = p.value
    return a
  }, {})
  const ymd = `${parts.year}-${parts.month}-${parts.day}`
  return { now, ymd }
}

function toYMD(d: Date) {
  const isoString = d.toISOString()
  return isoString.split('T')[0]
}

async function verificarInscripcion(id_usuario: number) {
  const inscripcion = await prisma.inscripcion.findFirst({
    where: {
      usuarioId: id_usuario,
      estadoId: 2
    }
  })
  
  return inscripcion !== null
}

export type UpdateAttendanceInput = Partial<Pick<Asistencia, 'dia_hora' | 'id_usuario' | 'id_evento'>>

export async function getAttendancesForExport(eventosIds: number[]) {
  const eventos = await prisma.evento.findMany({
    where: {
      id: {
        in: eventosIds
      }
    },
    select: {
      id: true,
      nombre: true,
      fecha: true
    },
    orderBy: {
      fecha: 'asc'
    }
  })

  if (eventos.length === 0) {
    throw new Error('No se encontraron los eventos especificados')
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      inscripciones: {
        some: {
          estadoId: 2
        }
      }
    },
    select: {
      id: true,
      dni: true,
      nombres: true,
      apellidos: true
    },
    orderBy: [
      { apellidos: 'asc' },
      { nombres: 'asc' }
    ]
  })

  const asistencias = await prisma.asistencia.findMany({
    where: {
      id_evento: {
        in: eventosIds
      },
      id_usuario: {
        in: usuarios.map(u => u.id)
      }
    },
    select: {
      id_usuario: true,
      id_evento: true
    }
  })

  const asistenciaMap = new Set(
    asistencias.map(a => `${a.id_usuario}-${a.id_evento}`)
  )

  const usuariosConAsistencias = usuarios.map(usuario => {
    const asistenciasUsuario: Record<string, number> = {}
    
    eventos.forEach(evento => {
      const key = `${usuario.id}-${evento.id}`
      asistenciasUsuario[`evento_${evento.id}`] = asistenciaMap.has(key) ? 1 : 0
    })

    return {
      id: usuario.id,
      dni: usuario.dni,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      ...asistenciasUsuario
    }
  })

  return {
    usuarios: usuariosConAsistencias,
    eventos: eventos
  }
}

export async function getAttendanceById(id: number) {
  return prisma.asistencia.findUnique({ where: { id } })
}

export async function createAttendanceWithWindow(input: Asistencia) {
  const { id_evento, id_usuario } = input
  if (!id_evento || !id_usuario) {
    throw new HttpError('Faltan campos: id_evento y id_usuario son obligatorios', 400)
  }

  // Verificar si el usuario está inscrito
  const estaInscrito = await verificarInscripcion(id_usuario)
  if (!estaInscrito) {
    throw new HttpError('El usuario no está inscrito o su inscripción no está aprobada', 403)
  }

  const evento = await prisma.evento.findUnique({
    where: { id: id_evento },
    select: { fecha: true, hora_comienzo: true, hora_termino: true },
  })
  if (!evento) throw new HttpError('Evento no encontrado', 404)

  const { now, ymd } = nowInLima()
  const fechaEventoYMD = toYMD(evento.fecha)
  
  if (fechaEventoYMD !== ymd) {
    throw new HttpError(
      `La asistencia debe registrarse en la fecha del evento (evento=${fechaEventoYMD}, actual=${ymd})`,
      400
    )
  }
  if (now < evento.hora_comienzo || now > evento.hora_termino) {
    throw new HttpError('Asistencia registrada fuera del horario del evento', 400)
  }

  try {
    return await prisma.asistencia.create({
      data: {
        id_usuario,
        id_evento,
      }
    })
  } catch (err) {
    throw new HttpError('Error en la creación de la asistencia' + err, 500)
  }
}

export async function createAttendanceOvertime(input: Asistencia) {
  const { id_evento, id_usuario } = input
  if (!id_evento || !id_usuario) {
    throw new HttpError('Faltan campos: id_evento y id_usuario son obligatorios', 400)
  }

  // Verificar si el usuario está inscrito
  const estaInscrito = await verificarInscripcion(id_usuario)
  if (!estaInscrito) {
    throw new HttpError('El usuario no está inscrito o su inscripción no está aprobada', 403)
  }

  try {
    return await prisma.asistencia.create({
      data: {
        id_usuario,
        id_evento,
      }
    })
  } catch (err) {
    throw new HttpError('Error en la creación de la asistencia (extemporánea)' + err, 500)
  }
}

export async function deleteAttendance(id: number) {
  return prisma.asistencia.delete({ where: { id } })
}
