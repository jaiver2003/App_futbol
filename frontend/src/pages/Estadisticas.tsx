import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerPartidos } from '../api/partidos'
import { obtenerJugadores } from '../api/jugadores'
import { obtenerEstadisticas, obtenerGoleadores, crearEstadistica, eliminarEstadistica } from '../api/estadisticas'
import { mensajeDeError } from '../api/errores'
import { useAuth } from '../context/AuthContext'
import type { EstadisticaPartido, Goleador, Jugador, Partido } from '../types'

const formVacio = { jugadorId: '', goles: '0', asistencias: '0', amarillas: '0', rojas: '0', minutos: '0' }

export default function Estadisticas() {
  const { usuario } = useAuth()
  // El tesorero solo consulta; administrador y entrenador registran
  const puedeRegistrar = usuario?.rol === 'administrador' || usuario?.rol === 'entrenador'
  const [goleadores, setGoleadores] = useState<Goleador[]>([])
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [partidoId, setPartidoId] = useState('')
  const [registros, setRegistros] = useState<EstadisticaPartido[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')

  const cargarGoleadores = () =>
    obtenerGoleadores().then((r) => setGoleadores(r.data)).catch((err) => setError(mensajeDeError(err)))

  const cargarRegistros = (id: string) =>
    obtenerEstadisticas(id).then((r) => setRegistros(r.data)).catch((err) => setError(mensajeDeError(err)))

  useEffect(() => {
    cargarGoleadores()
    obtenerPartidos()
      .then((r) => setPartidos(r.data.filter((p) => p.estado === 'jugado')))
      .catch((err) => setError(mensajeDeError(err)))
    obtenerJugadores()
      .then((r) => setJugadores(r.data.filter((j) => j.estado === 'activo')))
      .catch((err) => setError(mensajeDeError(err)))
  }, [])

  useEffect(() => {
    if (partidoId) cargarRegistros(partidoId)
    else setRegistros([])
  }, [partidoId])

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await crearEstadistica({
        partidoId,
        jugadorId: form.jugadorId,
        goles: Number(form.goles),
        asistencias: Number(form.asistencias),
        amarillas: Number(form.amarillas),
        rojas: Number(form.rojas),
        minutos: Number(form.minutos),
      })
      setForm(formVacio)
      setError('')
      cargarRegistros(partidoId)
      cargarGoleadores()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    try {
      await eliminarEstadistica(id)
      cargarRegistros(partidoId)
      cargarGoleadores()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const numero = (campo: keyof typeof formVacio, etiqueta: string, max?: number) => (
    <input type="number" min={0} max={max} placeholder={etiqueta} title={etiqueta} value={form[campo]}
      onChange={(e) => setForm({ ...form, [campo]: e.target.value })} />
  )

  return (
    <main className="container">
      <h2>Estadísticas</h2>
      {error && <p className="error-texto">{error}</p>}

      <h2>🏆 Tabla de goleadores</h2>
      {goleadores.length === 0 ? <p>Aún no hay goles registrados.</p> : (
        <table>
          <thead><tr><th>#</th><th>Jugador</th><th>Goles</th><th>Asistencias</th><th>🟨</th><th>🟥</th><th>PJ</th></tr></thead>
          <tbody>
            {goleadores.map((g, i) => (
              <tr key={g.jugadorId}>
                <td>{i + 1}</td>
                <td>#{g.numeroCamiseta} {g.nombre}</td>
                <td><strong>{g.goles}</strong></td>
                <td>{g.asistencias}</td>
                <td>{g.amarillas}</td>
                <td>{g.rojas}</td>
                <td>{g.partidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {puedeRegistrar && <h2>Registrar estadísticas por partido</h2>}
      {puedeRegistrar && <div className="form-inline">
        <select value={partidoId} onChange={(e) => setPartidoId(e.target.value)}>
          <option value="">Selecciona un partido jugado</option>
          {partidos.map((p) => (
            <option key={p._id} value={p._id}>
              {new Date(p.fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' })} vs {p.rival} ({p.golesFavor}-{p.golesContra})
            </option>
          ))}
        </select>
      </div>}
      {puedeRegistrar && partidos.length === 0 && <p>Primero marca un partido como “jugado” en la sección Partidos.</p>}

      {puedeRegistrar && partidoId && (
        <>
          <form className="form-inline" onSubmit={guardar}>
            <select value={form.jugadorId} onChange={(e) => setForm({ ...form, jugadorId: e.target.value })} required>
              <option value="">Jugador</option>
              {jugadores.map((j) => <option key={j._id} value={j._id}>#{j.numeroCamiseta} {j.nombre} {j.apellido}</option>)}
            </select>
            {numero('goles', 'Goles')}
            {numero('asistencias', 'Asistencias')}
            {numero('amarillas', 'Amarillas', 2)}
            {numero('rojas', 'Rojas', 1)}
            {numero('minutos', 'Minutos', 120)}
            <button type="submit">Guardar</button>
          </form>

          {registros.length > 0 && (
            <table>
              <thead><tr><th>Jugador</th><th>Goles</th><th>Asist.</th><th>🟨</th><th>🟥</th><th>Min</th><th></th></tr></thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r._id}>
                    <td>{typeof r.jugadorId === 'object' ? `#${r.jugadorId.numeroCamiseta} ${r.jugadorId.nombre} ${r.jugadorId.apellido}` : r.jugadorId}</td>
                    <td>{r.goles}</td><td>{r.asistencias}</td><td>{r.amarillas}</td><td>{r.rojas}</td><td>{r.minutos}</td>
                    <td><button className="btn-danger" onClick={() => borrar(r._id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  )
}