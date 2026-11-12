import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  obtenerEntrenadores,
  crearEntrenador,
  actualizarEntrenador,
  eliminarEntrenador,
} from '../api/entrenadores'
import { obtenerCategorias } from '../api/categorias'
import { mensajeDeError } from '../api/errores'
import type { Entrenador, Categoria } from '../types'

const formVacio = {
  nombre: '',
  apellido: '',
  telefono: '',
  especialidad: '',
  categoriaId: '',
  estado: 'activo' as 'activo' | 'inactivo',
}


function nombreCategoria(e: Entrenador): string {
  if (e.categoriaId && typeof e.categoriaId === 'object') return e.categoriaId.nombre
  return 'Sin categoría'
}

function idCategoria(e: Entrenador): string {
  if (!e.categoriaId) return ''
  return typeof e.categoriaId === 'object' ? e.categoriaId._id : e.categoriaId
}

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const cargar = async () => {
    try {
      const [ent, cat] = await Promise.all([obtenerEntrenadores(), obtenerCategorias()])
      setEntrenadores(ent.data)
      setCategorias(cat.data)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const cancelar = () => {
    setForm(formVacio)
    setEditandoId(null)
    setError('')
  }

  const editar = (e: Entrenador) => {
    setForm({
      nombre: e.nombre,
      apellido: e.apellido,
      telefono: e.telefono,
      especialidad: e.especialidad,
      categoriaId: idCategoria(e),
      estado: e.estado,
    })
    setEditandoId(e._id)
    setError('')
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const datos = {
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono,
      especialidad: form.especialidad,
      categoriaId: form.categoriaId,
      estado: form.estado,
    }
    try {
      if (editandoId) {
        await actualizarEntrenador(editandoId, datos)
      } else {
        await crearEntrenador({ ...datos, categoriaId: form.categoriaId || undefined })
      }
      cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este entrenador?')) return
    try {
      await eliminarEntrenador(id)
      if (editandoId === id) cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

    return (
    <main className="container">
      <h2>Entrenadores</h2>
      {error && <p className="error-texto">{error}</p>}

      <form className="form-inline" onSubmit={guardar}>
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
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear entrenador'}</button>
        {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
      </form>

      {entrenadores.length === 0 ? <p>Aún no hay entrenadores registrados.</p> : (
        <table>
          <thead>
            <tr><th>Nombre</th><th>Especialidad</th><th>Teléfono</th><th>Categoría</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {entrenadores.map((e) => (
              <tr key={e._id}>
                <td>{e.nombre} {e.apellido}</td>
                <td>{e.especialidad}</td>
                <td>{e.telefono}</td>
                <td>{nombreCategoria(e)}</td>
                <td>
                  <span className={`badge ${e.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}`}>{e.estado}</span>
                </td>
                <td>
                  <button className="btn-secondary" onClick={() => editar(e)}>✏️</button>{' '}
                  <button className="btn-danger" onClick={() => borrar(e._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}