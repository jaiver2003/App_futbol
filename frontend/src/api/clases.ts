import api from './client'
import type { Clase, ClaseInput } from '../types'

export const obtenerClases = () => api.get<Clase[]>('/clases')

export const crearClase = (data: ClaseInput) => api.post<Clase>('/clases', data)

export const actualizarClase = (id: string, data: Partial<ClaseInput>) => api.put<Clase>(`/clases/${id}`, data)

export const eliminarClase = (id: string) => api.delete(`/clases/${id}`)