import api from './client'
import type { Mensualidad, MensualidadInput } from '../types'

export const obtenerMensualidades = () => api.get<Mensualidad[]>('/mensualidades')

export const crearMensualidad = (data: MensualidadInput) =>
  api.post<Mensualidad>('/mensualidades', data)