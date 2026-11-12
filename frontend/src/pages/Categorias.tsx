import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../api/categorias'
import { obtenerSedes } from '../api/sedes'
import { mensajeDeError } from '../api/errores'
import type { Categoria, Sede } from '../types'

const formVacio = { nombre: '', edadMin: '', edadMax: '', horario: '', sedeId: '' }

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const cargar = async () => {
    try {
      const { data } = await obtenerCategorias()
      setCategorias(data)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  useEffect(() => {
    cargar()
    obtenerSedes()
      .then((res) => setSedes(res.data.filter((s) => s.estado === 'activa')))
      .catch(console.error)
  }, [])

  const cancelar = () => {
    setForm(formVacio)
    setEditandoId(null)
    setError('')
  }

  const editar = (c: Categoria) => {
    setForm({
      nombre: c.nombre,
      edadMin: String(c.edadMin),
      edadMax: String(c.edadMax),
      horario: c.horario,
      sedeId: typeof c.sedeId === 'object' && c.sedeId ? c.sedeId._id : (c.sedeId ?? ''),
    })
    setEditandoId(c._id)
    setError('')
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const datos = {
      nombre: form.nombre,
      edadMin: Number(form.edadMin),
      edadMax: Number(form.edadMax),
      horario: form.horario,
      sedeId: form.sedeId, // '' = sin sede
    }
    try {
      if (editandoId) {
        await actualizarCategoria(editandoId, datos)
      } else {
        await crearCategoria(datos)
      }
      cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      await eliminarCategoria(id)
      if (editandoId === id) cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <main className="container">
      <h2>Categorías</h2>
      {error && <p className="error-texto">{error}</p>}

      <form className="form-inline" onSubmit={guardar}>
        <input placeholder="Nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input type="number" placeholder="Edad mínima" value={form.edadMin}
          onChange={(e) => setForm({ ...form, edadMin: e.target.value })} required />
        <input type="number" placeholder="Edad máxima" value={form.edadMax}
          onChange={(e) => setForm({ ...form, edadMax: e.target.value })} required />
        <input placeholder="Horario (ej. Lunes 4pm)" value={form.horario}
          onChange={(e) => setForm({ ...form, horario: e.target.value })} required />
        <select value={form.sedeId} onChange={(e) => setForm({ ...form, sedeId: e.target.value })}>
          <option value="">Sin sede</option>
          {sedes.map((s) => (
            <option key={s._id} value={s._id}>{s.nombre} — {s.ciudad}</option>
          ))}
        </select>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear categoría'}</button>
        {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
      </form>

      {categorias.length === 0 ? <p>Aún no hay categorías.</p> : (
        <table>
          <thead>
            <tr><th>Nombre</th><th>Edades</th><th>Horario</th><th>Sede</th><th></th></tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c._id}>
                <td>{c.nombre}</td>
                <td>{c.edadMin}-{c.edadMax} años</td>
                <td>{c.horario}</td>
                <td>{typeof c.sedeId === 'object' && c.sedeId ? c.sedeId.nombre : '—'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => editar(c)}>✏️</button>{' '}
                  <button className="btn-danger" onClick={() => borrar(c._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}