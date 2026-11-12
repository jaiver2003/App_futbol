import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerSedes, crearSede, actualizarSede, eliminarSede } from '../api/sedes'
import { mensajeDeError } from '../api/errores'
import type { Sede } from '../types'

const formVacio = { nombre: '', ciudad: '', direccion: '', telefono: '', estado: 'activa' as Sede['estado'] }

export default function Sedes() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const { data } = await obtenerSedes()
      setSedes(data)
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

  const editar = (s: Sede) => {
    setForm({ nombre: s.nombre, ciudad: s.ciudad, direccion: s.direccion, telefono: s.telefono ?? '', estado: s.estado })
    setEditandoId(s._id)
    setError('')
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editandoId) await actualizarSede(editandoId, form)
      else await crearSede(form)
      cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta sede?')) return
    try {
      await eliminarSede(id)
      if (editandoId === id) cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <main className="container">
      <h2>Sedes</h2>
      {error && <p className="error-texto">{error}</p>}

      <form className="form-inline" onSubmit={guardar}>
        <input placeholder="Nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input placeholder="Ciudad" value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required />
        <input placeholder="Dirección" value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
        <input placeholder="Teléfono (opcional)" value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Sede['estado'] })}>
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
        </select>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear sede'}</button>
        {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
      </form>

      {sedes.length === 0 ? <p>Aún no hay sedes registradas.</p> : (
        <table>
          <thead>
            <tr><th>Nombre</th><th>Ciudad</th><th>Dirección</th><th>Teléfono</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {sedes.map((s) => (
              <tr key={s._id}>
                <td>{s.nombre}</td>
                <td>{s.ciudad}</td>
                <td>{s.direccion}</td>
                <td>{s.telefono || '—'}</td>
                <td>
                  <span className={`badge ${s.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'}`}>{s.estado}</span>
                </td>
                <td>
                  <button className="btn-secondary" onClick={() => editar(s)}>✏️</button>{' '}
                  <button className="btn-danger" onClick={() => borrar(s._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}