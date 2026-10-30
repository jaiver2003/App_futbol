import api from './client'
import type { Asistencia, AsistenciaInput, HistorialAsistencia } from '../types'

export const obtenerAsistencias = (filtros?: { fecha?: string; presente?: boolean }) =>
  api.get<Asistencia[]>('/asistencias', { params: filtros })

export const obtenerHistorialJugador = (jugadorId: string) =>
  api.get<HistorialAsistencia>(`/asistencias/jugador/${jugadorId}`)

export const crearAsistencia = (data: AsistenciaInput) =>
  api.post<Asistencia>('/asistencias', data)

// El backend solo permite cambiar presente, observacion y fecha
export const actualizarAsistencia = (
  id: string,
  data: Partial<Pick<AsistenciaInput, 'presente' | 'observacion' | 'fecha'>>
) => api.put<Asistencia>(`/asistencias/${id}`, data)

export const eliminarAsistencia = (id: string) => api.delete(`/asistencias/${id}`)