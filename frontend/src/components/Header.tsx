import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header>
      <div className="container header-content">
        <h2>⚽ Academia Dorada</h2>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/jugadores">Jugadores</NavLink>
          <NavLink to="/crear">Nuevo</NavLink>
          <NavLink to="/mensualidades">Mensualidades</NavLink>
        </nav>
      </div>
    </header>
  )
}