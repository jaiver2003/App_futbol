import api from './client'
import type { Entrenador, EntrenadorInput } from '../types'

export const obtenerEntrenadores = () => api.get<Entrenador[]>('/entrenadores')

export const obtenerEntrenadorPorId = (id: string) => api.get<Entrenador>(`/entrenadores/${id}`)

export const crearEntrenador = (data: EntrenadorInput) =>
  api.post<Entrenador>('/entrenadores', data)

export const actualizarEntrenador = (id: string, data: Partial<EntrenadorInput>) =>
  api.put<Entrenador>(`/entrenadores/${id}`, data)

export const eliminarEntrenador = (id: string) => api.delete(`/entrenadores/${id}`)