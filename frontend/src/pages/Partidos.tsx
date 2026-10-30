import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerPartidos, crearPartido, eliminarPartido } from '../api/partidos'
import { obtenerCategorias } from '../api/categorias'
import type { Partido, Categoria } from '../types'

type EstadoPartido = 'programado' | 'jugado' | 'cancelado'

const formVacio = {
  fecha: '',
  rival: '',
  lugar: '',
  categoriaId: '',
  estado: 'programado' as EstadoPartido,
  golesFavor: '',
  golesContra: '',
}

function mensajeError(err: unknown): string {
  const data = (err as { response?: { data?: { mensaje?: string; errores?: { mensaje: string }[] } } })
    .response?.data
  if (data?.errores?.length) return data.errores.map((e) => e.mensaje).join('. ')
  return data?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.'
}

function nombreCategoria(p: Partido): string {
  if (p.categoriaId && typeof p.categoriaId === 'object') return p.categoriaId.nombre
  return 'Sin categoría'
}

export default function Partidos() {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const [par, cat] = await Promise.all([obtenerPartidos(), obtenerCategorias()])
      setPartidos(par.data)
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
      const esJugado = form.estado === 'jugado'
      await crearPartido({
        fecha: form.fecha,
        rival: form.rival,
        lugar: form.lugar,
        categoriaId: form.categoriaId,
        estado: form.estado,
        golesFavor: esJugado ? Number(form.golesFavor) : undefined,
        golesContra: esJugado ? Number(form.golesContra) : undefined,
      })
      setForm(formVacio)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este partido?')) return
    try {
      await eliminarPartido(id)
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="container">
      <h1>Partidos</h1>
      {error && <p>{error}</p>}

      <form onSubmit={guardar}>
        <input type="date" value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
        <input placeholder="Rival" value={form.rival}
          onChange={(e) => setForm({ ...form, rival: e.target.value })} required />
        <input placeholder="Lugar" value={form.lugar}
          onChange={(e) => setForm({ ...form, lugar: e.target.value })} required />
        <select value={form.categoriaId}
          onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} required>
          <option value="">Elige categoría</option>
          {categorias.map((c) => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
        <select value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPartido })}>
          <option value="programado">Programado</option>
          <option value="jugado">Jugado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        {form.estado === 'jugado' && (
          <>
            <input type="number" min="0" placeholder="Goles a favor" value={form.golesFavor}
              onChange={(e) => setForm({ ...form, golesFavor: e.target.value })} required />
            <input type="number" min="0" placeholder="Goles en contra" value={form.golesContra}
              onChange={(e) => setForm({ ...form, golesContra: e.target.value })} required />
          </>
        )}
        <button type="submit">Crear partido</button>
      </form>

      <ul>
        {partidos.map((p) => (
          <li key={p._id}>
            {p.fecha.slice(0, 10)} · vs {p.rival} · {p.lugar} · {nombreCategoria(p)} · {p.estado}
            {p.estado === 'jugado' && ` · ${p.golesFavor} - ${p.golesContra}`}{' '}
            <button onClick={() => borrar(p._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}