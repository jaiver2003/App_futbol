import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Jugadores from './pages/Jugadores'
import CrearJugador from './pages/CrearJugador'
import EditarJugador from './pages/EditarJugador'
import Mensualidades from './pages/Mensualidades'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/crear" element={<CrearJugador />} />
        <Route path="/editar/:id" element={<EditarJugador />} />
        <Route path="/mensualidades" element={<Mensualidades />} />
        <Route path="*" element={<Jugadores />} />
      </Routes>
    </BrowserRouter>
  )
}