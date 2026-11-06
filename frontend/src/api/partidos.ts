import api from './client'
import type { Partido, PartidoInput } from '../types'

export const obtenerPartidos = () => api.get<Partido[]>('/partidos')

export const obtenerPartidoPorId = (id: string) => api.get<Partido>(`/partidos/${id}`)

export const crearPartido = (data: PartidoInput) => api.post<Partido>('/partidos', data)

export const actualizarPartido = (id: string, data: Partial<PartidoInput>) =>
  api.put<Partido>(`/partidos/${id}`, data)

export const eliminarPartido = (id: string) => api.delete(`/partidos/${id}`)