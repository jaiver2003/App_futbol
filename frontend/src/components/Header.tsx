import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header>
      <div className="container header-content">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <img src="/logo%20academia%20dorada.png" alt="Logo Club Deportivo Academia Dorada" style={{ height: '64px' }} />
          Academia Dorada
        </h2>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/jugadores">Jugadores</NavLink>
          <NavLink to="/crear">Nuevo</NavLink>
          <NavLink to="/mensualidades">Mensualidades</NavLink>
          <NavLink to="/categorias">Categorías</NavLink>
          <NavLink to="/entrenadores">Entrenadores</NavLink>
          <NavLink to="/partidos">Partidos</NavLink>
          <NavLink to="/asistencias">Asistencia</NavLink>
        </nav>
      </div>
    </header>
  )
}