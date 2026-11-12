import api from './client'
import type { Sede, SedeInput } from '../types'

export const obtenerSedes = () => api.get<Sede[]>('/sedes')

export const crearSede = (data: SedeInput) => api.post<Sede>('/sedes', data)

export const actualizarSede = (id: string, data: Partial<SedeInput>) => api.put<Sede>(`/sedes/${id}`, data)

export const eliminarSede = (id: string) => api.delete(`/sedes/${id}`)