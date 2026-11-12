import api from './client'
import type { Usuario } from '../types'

export const iniciarSesion = (email: string, password: string) =>
  api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, password })

export const obtenerYo = () => api.get<Usuario>('/auth/me')

export const crearPrimerAdmin = (data: { nombre: string; email: string; password: string }) =>
  api.post<Usuario>('/auth/primer-admin', data)