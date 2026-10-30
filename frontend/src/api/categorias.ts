import api from './client'
import type { Categoria, CategoriaInput } from '../types'

export const obtenerCategorias = () => api.get<Categoria[]>('/categorias')

export const obtenerCategoriaPorId = (id: string) => api.get<Categoria>(`/categorias/${id}`)

export const crearCategoria = (data: CategoriaInput) => api.post<Categoria>('/categorias', data)

export const actualizarCategoria = (id: string, data: Partial<CategoriaInput>) =>
  api.put<Categoria>(`/categorias/${id}`, data)

export const eliminarCategoria = (id: string) => api.delete(`/categorias/${id}`)