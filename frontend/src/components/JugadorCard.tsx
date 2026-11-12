import { Link } from 'react-router-dom'
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
      {typeof jugador.categoriaId === 'object' && jugador.categoriaId && (
        <p className="card-info">🏷️ {jugador.categoriaId.nombre}</p>
      )}
      <p className="card-info">📞 {jugador.telefono}</p>
      <div className="card-actions">
        <Link to={`/perfil/${jugador._id}`} className="btn btn-primary">👤 Perfil</Link>
        <button className="btn-secondary" onClick={() => onEdit(jugador._id)}>✏️</button>
        <button className="btn-danger" onClick={() => onDelete(jugador._id)}>🗑️</button>
      </div>
    </div>
  )
}