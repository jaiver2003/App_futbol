import api from './client'
import type { Mensualidad, MensualidadInput } from '../types'

export const obtenerMensualidades = () => api.get<Mensualidad[]>('/mensualidades')

export const crearMensualidad = (data: MensualidadInput) =>
  api.post<Mensualidad>('/mensualidades', data)

export const actualizarMensualidad = (id: string, data: Partial<MensualidadInput>) =>
  api.put<Mensualidad>(`/mensualidades/${id}`, data)

export const eliminarMensualidad = (id: string) =>
  api.delete(`/mensualidades/${id}`)