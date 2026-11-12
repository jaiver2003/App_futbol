import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Jugadores from './pages/Jugadores'
import CrearJugador from './pages/CrearJugador'
import EditarJugador from './pages/EditarJugador'
import PerfilJugador from './pages/PerfilJugador'
import Mensualidades from './pages/Mensualidades'
import Categorias from './pages/Categorias'
import Entrenadores from './pages/Entrenadores'
import Sedes from './pages/Sedes'
import Clases from './pages/Clases'
import Calendario from './pages/Calendario'
import Partidos from './pages/Partidos'
import Asistencias from './pages/Asistencias'
import Usuarios from './pages/Usuarios'
import './styles/global.css'
import Estadisticas from './pages/Estadisticas'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RutaProtegida>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/jugadores" element={<Jugadores />} />
                    <Route path="/crear" element={<RutaProtegida roles={[]}><CrearJugador /></RutaProtegida>} />
                    <Route path="/editar/:id" element={<RutaProtegida roles={[]}><EditarJugador /></RutaProtegida>} />
                    <Route path="/perfil/:id" element={<PerfilJugador />} />
                    <Route path="/mensualidades" element={<RutaProtegida roles={['tesorero']}><Mensualidades /></RutaProtegida>} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/entrenadores" element={<RutaProtegida roles={[]}><Entrenadores /></RutaProtegida>} />
                    <Route path="/sedes" element={<RutaProtegida roles={[]}><Sedes /></RutaProtegida>} />
                    <Route path="/clases" element={<RutaProtegida roles={[]}><Clases /></RutaProtegida>} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/partidos" element={<RutaProtegida roles={['entrenador']}><Partidos /></RutaProtegida>} />
                    <Route path="/asistencias" element={<RutaProtegida roles={['entrenador']}><Asistencias /></RutaProtegida>} />
                    <Route path="/usuarios" element={<RutaProtegida roles={[]}><Usuarios /></RutaProtegida>} />
                    <Route path="*" element={<Jugadores />} />
                    <Route path="/estadisticas" element={<Estadisticas />} />
                  </Routes>
                </Layout>
              </RutaProtegida>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}