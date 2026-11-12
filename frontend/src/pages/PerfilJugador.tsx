import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerPerfil } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import type { Perfil } from '../types'

const pesos = (n: number) => `$${n.toLocaleString('es-CO')}`

export default function PerfilJugador() {
  const { id } = useParams()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    obtenerPerfil(id)
      .then((res) => setPerfil(res.data))
      .catch((err) => setError(mensajeDeError(err, 'No se pudo cargar el perfil')))
  }, [id])

  if (error) return <main className="container"><p className="error-texto">{error}</p></main>
  if (!perfil) return <main className="container"><p>Cargando...</p></main>

  const { jugador, pagos, asistencia, estadisticas } = perfil

  return (
    <main className="container">
      <div className="perfil-header">
        <span className="camiseta camiseta-grande">#{jugador.numeroCamiseta}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{jugador.nombre} {jugador.apellido}</h2>
          <p className="card-info">{jugador.posicion} · {jugador.edad} años · 📞 {jugador.telefono}</p>
          {typeof jugador.categoriaId === 'object' && jugador.categoriaId && (
            <p className="card-info">🏷️ {jugador.categoriaId.nombre} · {jugador.categoriaId.horario}</p>
          )}
        </div>
        <span className={`badge ${jugador.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}`}>
          {jugador.estado}
        </span>
        <Link to={`/editar/${jugador._id}`} className="btn btn-secondary">✏️ Editar</Link>
        <Link to="/jugadores" className="btn btn-secondary">← Volver</Link>
      </div>

      <h2>💰 Pagos</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total pagado</span>
          <strong className="positivo">{pesos(pagos.totalPagado)}</strong>
        </div>
        <div className="stat-card">
          <span>Mensualidades pendientes</span>
          <strong className={pagos.pendientes > 0 ? 'negativo' : 'positivo'}>{pagos.pendientes}</strong>
        </div>
      </div>
      {pagos.historial.length > 0 && (
        <table style={{ marginTop: 14 }}>
          <thead><tr><th>Periodo</th><th>Valor</th><th>Estado</th></tr></thead>
          <tbody>
            {pagos.historial.map((m) => (
              <tr key={m._id}>
                <td>{m.mes} {m.anio}</td>
                <td>{pesos(m.valor)}</td>
                <td>
                  <span className={`badge ${m.estado === 'pagado' ? 'badge-activo' : 'badge-inactivo'}`}>{m.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>✅ Asistencia</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Porcentaje de asistencia</span>
          <strong>{asistencia.porcentaje === null ? '—' : `${asistencia.porcentaje}%`}</strong>
        </div>
        <div className="stat-card"><span>Presentes</span><strong className="positivo">{asistencia.presentes}</strong></div>
        <div className="stat-card"><span>Ausencias</span><strong className="negativo">{asistencia.ausentes}</strong></div>
      </div>

      <h2>⚽ Rendimiento</h2>
      <div className="stats-grid">
        <div className="stat-card"><span>Partidos</span><strong>{estadisticas.partidos}</strong></div>
        <div className="stat-card"><span>Goles</span><strong>{estadisticas.goles}</strong></div>
        <div className="stat-card"><span>Asistencias de gol</span><strong>{estadisticas.asistencias}</strong></div>
        <div className="stat-card"><span>Tarjetas</span><strong>🟨 {estadisticas.amarillas} · 🟥 {estadisticas.rojas}</strong></div>
      </div>
    </main>
  )
}