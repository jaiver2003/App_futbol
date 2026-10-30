import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerEntrenadores, crearEntrenador, eliminarEntrenador } from '../api/entrenadores'
import { obtenerCategorias } from '../api/categorias'
import type { Entrenador, Categoria } from '../types'

const formVacio = {
  nombre: '',
  apellido: '',
  telefono: '',
  especialidad: '',
  categoriaId: '',
  estado: 'activo' as 'activo' | 'inactivo',
}

function mensajeError(err: unknown): string {
  const data = (err as { response?: { data?: { mensaje?: string; errores?: { mensaje: string }[] } } })
    .response?.data
  if (data?.errores?.length) return data.errores.map((e) => e.mensaje).join('. ')
  return data?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.'
}

function nombreCategoria(e: Entrenador): string {
  if (e.categoriaId && typeof e.categoriaId === 'object') return e.categoriaId.nombre
  return 'Sin categoría'
}

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const [ent, cat] = await Promise.all([obtenerEntrenadores(), obtenerCategorias()])
      setEntrenadores(ent.data)
      setCategorias(cat.data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await crearEntrenador({
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        especialidad: form.especialidad,
        categoriaId: form.categoriaId || undefined,
        estado: form.estado,
      })
      setForm(formVacio)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este entrenador?')) return
    try {
      await eliminarEntrenador(id)
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="container">
      <h1>Entrenadores</h1>
      {error && <p>{error}</p>}

      <form onSubmit={guardar}>
        <input placeholder="Nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input placeholder="Apellido" value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
        <input placeholder="Teléfono" value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
        <input placeholder="Especialidad" value={form.especialidad}
          onChange={(e) => setForm({ ...form, especialidad: e.target.value })} required />
        <select value={form.categoriaId}
          onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
          <option value="">Sin categoría</option>
          {categorias.map((c) => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
        <select value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value as 'activo' | 'inactivo' })}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <button type="submit">Crear entrenador</button>
      </form>

      <ul>
        {entrenadores.map((e) => (
          <li key={e._id}>
            {e.nombre} {e.apellido} · {e.especialidad} · {e.telefono} · {nombreCategoria(e)} · {e.estado}{' '}
            <button onClick={() => borrar(e._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}