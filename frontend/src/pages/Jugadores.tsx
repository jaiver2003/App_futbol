import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerJugadores, eliminarJugador } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import JugadorCard from '../components/JugadorCard'
import type { Jugador } from '../types'

export default function Jugadores() {
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    obtenerJugadores()
      .then((res) => setJugadores(res.data))
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

  const filtrados = jugadores.filter(
    (j) =>
      `${j.nombre} ${j.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.posicion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main className="container">
      <h2>Jugadores ({filtrados.length})</h2>
      <input
        className="search"
        placeholder="🔍 Buscar por nombre o posición..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
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