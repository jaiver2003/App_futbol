import { useNavigate } from 'react-router-dom'
import { crearJugador } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import JugadorForm from '../components/JugadorForm'
import type { JugadorInput } from '../types'

export default function CrearJugador() {
  const navigate = useNavigate()

  const handleSubmit = async (data: JugadorInput) => {
    try {
      await crearJugador(data)
      navigate('/jugadores')
    } catch (err) {
      alert(`❌ ${mensajeDeError(err, 'Error al guardar')}`)
    }
  }

  return (
    <main className="container">
      <h2>Nuevo Jugador</h2>
      <JugadorForm onSubmit={handleSubmit} />
    </main>
  )
}