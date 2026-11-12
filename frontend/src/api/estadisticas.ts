import api from './client'
import type { EstadisticaPartido, EstadisticaInput, Goleador } from '../types'

export const obtenerEstadisticas = (partidoId?: string) =>
  api.get<EstadisticaPartido[]>('/estadisticas', { params: partidoId ? { partidoId } : {} })

export const obtenerGoleadores = (limit = 10) => api.get<Goleador[]>('/estadisticas/goleadores', { params: { limit } })

export const crearEstadistica = (data: EstadisticaInput) => api.post<EstadisticaPartido>('/estadisticas', data)

export const eliminarEstadistica = (id: string) => api.delete(`/estadisticas/${id}`)