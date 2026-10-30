import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>⚽ Club Deportivo Academia Dorada</h1>
        <p>Gestión de jugadores y mensualidades del club.</p>
        <div className="hero-actions">
          <Link to="/jugadores" className="btn btn-primary">Ver jugadores</Link>
          <Link to="/crear" className="btn btn-secondary">Registrar jugador</Link>
        </div>
      </section>
    </main>
  )
}