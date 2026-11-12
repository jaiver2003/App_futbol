import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { obtenerJugadorPorId, actualizarJugador } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import JugadorForm from '../components/JugadorForm'
import type { Jugador, JugadorInput } from '../types'

export default function EditarJugador() {
  const { id } = useParams()
  const [jugador, setJugador] = useState<Jugador | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    obtenerJugadorPorId(id)
      .then((res) => setJugador(res.data))
      .catch(console.error)
  }, [id])

  const handleSubmit = async (data: JugadorInput) => {
    if (!id) return
    try {
      await actualizarJugador(id, data)
      navigate('/jugadores')
    } catch (err) {
      alert(`❌ ${mensajeDeError(err, 'Error al actualizar')}`)
    }
  }

  if (!jugador) return <p>Cargando...</p>

  return (
    <main className="container">
      <h2>Editar Jugador</h2>
      <JugadorForm
        initialData={{
          ...jugador,
          categoriaId: typeof jugador.categoriaId === 'object' ? jugador.categoriaId?._id : jugador.categoriaId ?? undefined,
        }}
        onSubmit={handleSubmit}
      />
    </main>
  )
}