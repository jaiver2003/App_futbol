import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  obtenerAsistencias,
  obtenerHistorialJugador,
  crearAsistencia,
  actualizarAsistencia,
  eliminarAsistencia,
} from '../api/asistencias'
import { obtenerJugadores } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import type { Asistencia, Jugador, HistorialAsistencia } from '../types'

const formVacio = { jugadorId: '', fecha: '', presente: 'true', observacion: '' }



function nombreJugador(a: Asistencia): string {
  if (a.jugadorId && typeof a.jugadorId === 'object') {
    return `#${a.jugadorId.numeroCamiseta} ${a.jugadorId.nombre} ${a.jugadorId.apellido}`
  }
  return 'Jugador'
}

function idJugador(a: Asistencia): string {
  if (!a.jugadorId) return ''
  return typeof a.jugadorId === 'object' ? a.jugadorId._id : a.jugadorId
}

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')
  const [jugadorHistorial, setJugadorHistorial] = useState('')
  const [historial, setHistorial] = useState<HistorialAsistencia | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const cargar = async () => {
    try {
      const [asi, jug] = await Promise.all([obtenerAsistencias(), obtenerJugadores()])
      setAsistencias(asi.data)
      setJugadores(jug.data.filter((j) => j.estado === 'activo'))
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const verHistorial = async (id: string) => {
    setJugadorHistorial(id)
    if (!id) {
      setHistorial(null)
      return
    }
    try {
      const { data } = await obtenerHistorialJugador(id)
      setHistorial(data)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const cancelar = () => {
    setForm(formVacio)
    setEditandoId(null)
    setError('')
  }

  const editar = (a: Asistencia) => {
    setForm({
      jugadorId: idJugador(a),
      fecha: a.fecha.slice(0, 10),
      presente: a.presente ? 'true' : 'false',
      observacion: a.observacion ?? '',
    })
    setEditandoId(a._id)
    setError('')
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editandoId) {
        await actualizarAsistencia(editandoId, {
          fecha: form.fecha,
          presente: form.presente === 'true',
          observacion: form.observacion,
        })
      } else {
        await crearAsistencia({
          jugadorId: form.jugadorId,
          fecha: form.fecha,
          presente: form.presente === 'true',
          observacion: form.observacion || undefined,
        })
      }
      cancelar()
      await cargar()
      if (jugadorHistorial) verHistorial(jugadorHistorial)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    try {
      await eliminarAsistencia(id)
      if (editandoId === id) cancelar()
      await cargar()
      if (jugadorHistorial) verHistorial(jugadorHistorial)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }


  
    const opcionesJugadores = jugadores.map((j) => (
    <option key={j._id} value={j._id}>
      #{j.numeroCamiseta} {j.nombre} {j.apellido}
    </option>
  ))

  return (
    <main className="container">
      <h2>Asistencia</h2>
      {error && <p className="error-texto">{error}</p>}

      <form className="form-inline" onSubmit={guardar}>
        <select value={form.jugadorId}
          onChange={(e) => setForm({ ...form, jugadorId: e.target.value })}
          required disabled={!!editandoId}>
          <option value="">Elige jugador</option>
          {opcionesJugadores}
        </select>
        <input type="date" value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
        <select value={form.presente}
          onChange={(e) => setForm({ ...form, presente: e.target.value })}>
          <option value="true">Presente</option>
          <option value="false">Ausente</option>
        </select>
        <input placeholder="Observación (opcional)" maxLength={200} value={form.observacion}
          onChange={(e) => setForm({ ...form, observacion: e.target.value })} />
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Registrar'}</button>
        {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
      </form>

      <h2>Historial por jugador</h2>
      <div className="form-inline">
        <select value={jugadorHistorial} onChange={(e) => verHistorial(e.target.value)}>
          <option value="">Elige un jugador</option>
          {opcionesJugadores}
        </select>
      </div>

      {historial && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <span>Jugador</span>
            <strong style={{ fontSize: '1.2rem' }}>{historial.jugador}</strong>
          </div>
          <div className="stat-card">
            <span>Presentes</span>
            <strong className="positivo">{historial.presentes}</strong>
          </div>
          <div className="stat-card">
            <span>Ausentes</span>
            <strong className="negativo">{historial.ausentes}</strong>
          </div>
          <div className="stat-card">
            <span>% de asistencia ({historial.totalRegistros} registros)</span>
            <strong>{historial.porcentajeAsistencia}%</strong>
          </div>
        </div>
      )}

      <h2>Todos los registros</h2>
      {asistencias.length === 0 ? <p>Aún no hay asistencias registradas.</p> : (
        <table>
          <thead>
            <tr><th>Fecha</th><th>Jugador</th><th>Estado</th><th>Observación</th><th></th></tr>
          </thead>
          <tbody>
            {asistencias.map((a) => (
              <tr key={a._id}>
                <td>{a.fecha.slice(0, 10)}</td>
                <td>{nombreJugador(a)}</td>
                <td>
                  <span className={`badge ${a.presente ? 'badge-activo' : 'badge-inactivo'}`}>
                    {a.presente ? 'Presente' : 'Ausente'}
                  </span>
                </td>
                <td>{a.observacion || '—'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => editar(a)}>✏️</button>{' '}
                  <button className="btn-danger" onClick={() => borrar(a._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}