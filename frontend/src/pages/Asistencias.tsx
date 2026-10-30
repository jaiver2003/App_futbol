import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  obtenerAsistencias,
  obtenerHistorialJugador,
  crearAsistencia,
  eliminarAsistencia,
} from '../api/asistencias'
import { obtenerJugadores } from '../api/jugadores'
import type { Asistencia, Jugador, HistorialAsistencia } from '../types'

const formVacio = { jugadorId: '', fecha: '', presente: 'true', observacion: '' }

function mensajeError(err: unknown): string {
  const data = (err as { response?: { data?: { mensaje?: string; errores?: { mensaje: string }[] } } })
    .response?.data
  if (data?.errores?.length) return data.errores.map((e) => e.mensaje).join('. ')
  return data?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.'
}

function nombreJugador(a: Asistencia): string {
  if (a.jugadorId && typeof a.jugadorId === 'object') {
    return `#${a.jugadorId.numeroCamiseta} ${a.jugadorId.nombre} ${a.jugadorId.apellido}`
  }
  return 'Jugador'
}

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')
  const [jugadorHistorial, setJugadorHistorial] = useState('')
  const [historial, setHistorial] = useState<HistorialAsistencia | null>(null)

  const cargar = async () => {
    try {
      const [asi, jug] = await Promise.all([obtenerAsistencias(), obtenerJugadores()])
      setAsistencias(asi.data)
      setJugadores(jug.data.filter((j) => j.estado === 'activo'))
    } catch (err) {
      setError(mensajeError(err))
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
      setError(mensajeError(err))
    }
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await crearAsistencia({
        jugadorId: form.jugadorId,
        fecha: form.fecha,
        presente: form.presente === 'true',
        observacion: form.observacion || undefined,
      })
      setForm(formVacio)
      setError('')
      await cargar()
      if (jugadorHistorial) verHistorial(jugadorHistorial)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    try {
      await eliminarAsistencia(id)
      await cargar()
      if (jugadorHistorial) verHistorial(jugadorHistorial)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="container">
      <h1>Asistencia</h1>
      {error && <p>{error}</p>}

      <form onSubmit={guardar}>
        <select value={form.jugadorId}
          onChange={(e) => setForm({ ...form, jugadorId: e.target.value })} required>
          <option value="">Elige jugador</option>
          {jugadores.map((j) => (
            <option key={j._id} value={j._id}>
              #{j.numeroCamiseta} {j.nombre} {j.apellido}
            </option>
          ))}
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
        <button type="submit">Registrar</button>
      </form>

      <h2>Historial por jugador</h2>
      <select value={jugadorHistorial} onChange={(e) => verHistorial(e.target.value)}>
        <option value="">Elige un jugador</option>
        {jugadores.map((j) => (
          <option key={j._id} value={j._id}>
            #{j.numeroCamiseta} {j.nombre} {j.apellido}
          </option>
        ))}
      </select>

      {historial && (
        <div>
          <p>
            <strong>{historial.jugador}</strong>: {historial.presentes} presentes,{' '}
            {historial.ausentes} ausentes de {historial.totalRegistros} registros ·{' '}
            <strong>{historial.porcentajeAsistencia}% de asistencia</strong>
          </p>
        </div>
      )}

      <h2>Todos los registros</h2>
      <ul>
        {asistencias.map((a) => (
          <li key={a._id}>
            {a.fecha.slice(0, 10)} · {nombreJugador(a)} · {a.presente ? 'Presente' : 'Ausente'}
            {a.observacion && ` · ${a.observacion}`}{' '}
            <button onClick={() => borrar(a._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}