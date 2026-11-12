import api from './client'
import type { Jugador, JugadorInput, Perfil } from '../types'


export const obtenerJugadores = () => api.get<Jugador[]>('/jugadores')

export const obtenerJugadorPorId = (id: string) => api.get<Jugador>(`/jugadores/${id}`)

export const crearJugador = (data: JugadorInput) => api.post<Jugador>('/jugadores', data)

export const actualizarJugador = (id: string, data: Partial<JugadorInput>) =>
  api.put<Jugador>(`/jugadores/${id}`, data)

export const eliminarJugador = (id: string) => api.delete(`/jugadores/${id}`)

export const inactivarJugador = (id: string) => api.patch(`/jugadores/${id}/inactivar`)
export const obtenerPerfil = (id: string) => api.get<Perfil>(`/jugadores/${id}/perfil`)