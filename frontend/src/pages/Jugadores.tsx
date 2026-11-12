import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerJugadores, eliminarJugador } from '../api/jugadores'
import { obtenerCategorias } from '../api/categorias'
import { mensajeDeError } from '../api/errores'
import JugadorCard from '../components/JugadorCard'
import type { Categoria, Jugador } from '../types'

export default function Jugadores() {
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    obtenerJugadores()
      .then((res) => setJugadores(res.data))
      .catch(console.error)
    obtenerCategorias()
      .then((res) => setCategorias(res.data))
      .catch(console.error)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este jugador?')) return
    try {
      await eliminarJugador(id)
      setJugadores(jugadores.filter((j) => j._id !== id))
    } catch (err) {
      alert(`❌ ${mensajeDeError(err, 'No se pudo eliminar')}`)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/editar/${id}`)
  }

  const idCategoria = (j: Jugador) =>
    typeof j.categoriaId === 'object' && j.categoriaId ? j.categoriaId._id : j.categoriaId

  const filtrados = jugadores.filter((j) => {
    const coincideTexto =
      `${j.nombre} ${j.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.posicion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = !categoriaFiltro || idCategoria(j) === categoriaFiltro
    return coincideTexto && coincideCategoria
  })

  return (
    <main className="container">
      <h2>Jugadores ({filtrados.length})</h2>
      <div className="form-inline">
        <input
          placeholder="🔍 Buscar por nombre o posición..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: '3 1 260px' }}
        />
        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      {filtrados.length === 0 && <p>No se encontraron jugadores.</p>}
      <div className="cards-grid">
        {filtrados.map((jugador) => (
          <JugadorCard
            key={jugador._id}
            jugador={jugador}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </main>
  )
}