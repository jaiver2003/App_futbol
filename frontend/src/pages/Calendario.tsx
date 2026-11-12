import { useEffect, useState } from 'react'
import { obtenerClases } from '../api/clases'
import { obtenerPartidos } from '../api/partidos'
import { mensajeDeError } from '../api/errores'
import type { Clase, DiaSemana, Partido } from '../types'

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Calendario() {
  const [clases, setClases] = useState<Clase[]>([])
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerClases()
      .then((r) => setClases(r.data.filter((c) => c.estado === 'activa')))
      .catch((err) => setError(mensajeDeError(err)))
    obtenerPartidos()
      .then((r) => setPartidos(r.data.filter((p) => p.estado === 'programado').reverse()))
      .catch((err) => setError(mensajeDeError(err)))
  }, [])

  return (
    <main className="container">
      <h2>📅 Calendario semanal</h2>
      {error && <p className="error-texto">{error}</p>}

      <div className="semana">
        {DIAS.map((dia) => {
          const delDia = clases.filter((c) => c.diaSemana === dia)
          return (
            <div key={dia} className="dia-col">
              <h3>{dia}</h3>
              {delDia.length === 0 && <p className="card-info">Sin clases</p>}
              {delDia.map((c) => (
                <div key={c._id} className="clase-item">
                  <strong>{c.horaInicio} - {c.horaFin}</strong>
                  <span>{typeof c.categoriaId === 'object' ? c.categoriaId.nombre : ''}</span>
                  <small>
                    {typeof c.entrenadorId === 'object' ? `${c.entrenadorId.nombre} ${c.entrenadorId.apellido}` : ''}
                    {typeof c.sedeId === 'object' ? ` · ${c.sedeId.nombre}` : ''}
                  </small>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <h2>⚽ Partidos programados</h2>
      {partidos.length === 0 ? <p>No hay partidos programados.</p> : (
        <table>
          <thead><tr><th>Fecha</th><th>Rival</th><th>Lugar</th><th>Categoría</th></tr></thead>
          <tbody>
            {partidos.map((p) => (
              <tr key={p._id}>
                <td>{new Date(p.fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' })}</td>
                <td>{p.rival}</td>
                <td>{p.lugar}</td>
                <td>{typeof p.categoriaId === 'object' ? p.categoriaId.nombre : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}