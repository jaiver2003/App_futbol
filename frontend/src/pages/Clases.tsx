import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerClases, crearClase, actualizarClase, eliminarClase } from '../api/clases'
import { obtenerCategorias } from '../api/categorias'
import { obtenerEntrenadores } from '../api/entrenadores'
import { obtenerSedes } from '../api/sedes'
import { mensajeDeError } from '../api/errores'
import type { Categoria, Clase, DiaSemana, Entrenador, Sede } from '../types'

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const formVacio = {
  categoriaId: '',
  entrenadorId: '',
  sedeId: '',
  diaSemana: 'Lunes' as DiaSemana,
  horaInicio: '16:00',
  horaFin: '17:30',
  estado: 'activa' as Clase['estado'],
}

const idDe = (campo: { _id: string } | string) => (typeof campo === 'object' ? campo._id : campo)

export default function Clases() {
  const [clases, setClases] = useState<Clase[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const { data } = await obtenerClases()
      setClases(data)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  useEffect(() => {
    cargar()
    obtenerCategorias().then((r) => setCategorias(r.data)).catch(console.error)
    obtenerEntrenadores().then((r) => setEntrenadores(r.data.filter((e) => e.estado === 'activo'))).catch(console.error)
    obtenerSedes().then((r) => setSedes(r.data.filter((s) => s.estado === 'activa'))).catch(console.error)
  }, [])

  const cancelar = () => {
    setForm(formVacio)
    setEditandoId(null)
    setError('')
  }

  const editar = (c: Clase) => {
    setForm({
      categoriaId: idDe(c.categoriaId),
      entrenadorId: idDe(c.entrenadorId),
      sedeId: idDe(c.sedeId),
      diaSemana: c.diaSemana,
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      estado: c.estado,
    })
    setEditandoId(c._id)
    setError('')
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editandoId) await actualizarClase(editandoId, form)
      else await crearClase(form)
      cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta clase?')) return
    try {
      await eliminarClase(id)
      if (editandoId === id) cancelar()
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <main className="container">
      <h2>Clases (horario semanal)</h2>
      {error && <p className="error-texto">{error}</p>}

      <form className="form-inline" onSubmit={guardar}>
        <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} required>
          <option value="">Categoría</option>
          {categorias.map((c) => <option key={c._id} value={c._id}>{c.nombre}</option>)}
        </select>
        <select value={form.entrenadorId} onChange={(e) => setForm({ ...form, entrenadorId: e.target.value })} required>
          <option value="">Entrenador</option>
          {entrenadores.map((t) => <option key={t._id} value={t._id}>{t.nombre} {t.apellido}</option>)}
        </select>
        <select value={form.sedeId} onChange={(e) => setForm({ ...form, sedeId: e.target.value })} required>
          <option value="">Sede</option>
          {sedes.map((s) => <option key={s._id} value={s._id}>{s.nombre}</option>)}
        </select>
        <select value={form.diaSemana} onChange={(e) => setForm({ ...form, diaSemana: e.target.value as DiaSemana })}>
          {DIAS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
        <input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} required />
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Clase['estado'] })}>
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
        </select>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Programar clase'}</button>
        {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
      </form>

      {clases.length === 0 ? <p>Aún no hay clases programadas.</p> : (
        <table>
          <thead>
            <tr><th>Día</th><th>Horario</th><th>Categoría</th><th>Entrenador</th><th>Sede</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {clases.map((c) => (
              <tr key={c._id}>
                <td>{c.diaSemana}</td>
                <td>{c.horaInicio} - {c.horaFin}</td>
                <td>{typeof c.categoriaId === 'object' ? c.categoriaId.nombre : '—'}</td>
                <td>{typeof c.entrenadorId === 'object' ? `${c.entrenadorId.nombre} ${c.entrenadorId.apellido}` : '—'}</td>
                <td>{typeof c.sedeId === 'object' ? c.sedeId.nombre : '—'}</td>
                <td>
                  <span className={`badge ${c.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'}`}>{c.estado}</span>
                </td>
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