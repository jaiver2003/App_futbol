import api from './client'
import type { Rol, Usuario } from '../types'

export const obtenerUsuarios = () => api.get<Usuario[]>('/usuarios')

export const crearUsuario = (data: { nombre: string; email: string; password: string; rol: Rol }) =>
  api.post<Usuario>('/usuarios', data)

export const actualizarUsuario = (id: string, data: Partial<Pick<Usuario, 'rol' | 'estado'>>) =>
  api.put<Usuario>(`/usuarios/${id}`, data)

export const eliminarUsuario = (id: string) => api.delete(`/usuarios/${id}`)