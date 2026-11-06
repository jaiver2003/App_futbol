import type { Jugador } from '../types'

interface Props {
  jugador: Jugador
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function JugadorCard({ jugador, onDelete, onEdit }: Props) {
  return (
    <div className="card">
      <div className="card-top">
        <span className="camiseta">#{jugador.numeroCamiseta}</span>
        <span className={`badge ${jugador.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}`}>
          {jugador.estado}
        </span>
      </div>
      <h3>{jugador.nombre} {jugador.apellido}</h3>
      <p className="card-info">{jugador.posicion} · {jugador.edad} años</p>
      <p className="card-info">📞 {jugador.telefono}</p>
      <div className="card-actions">
        <button className="btn-secondary" onClick={() => onEdit(jugador._id)}>✏️ Editar</button>
        <button className="btn-danger" onClick={() => onDelete(jugador._id)}>🗑️ Eliminar</button>
      </div>
    </div>
  )
}