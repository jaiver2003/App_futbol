import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Layers, CalendarDays, CalendarCheck, UserCog,
  MapPin, Wallet, Trophy, KeyRound, ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Rol } from '../types'

type Tono = 'base' | 'verde' | 'ambar'

interface Hijo {
  titulo: string
  ruta: string
  roles?: Rol[]
}

interface ItemMenu {
  titulo: string
  icono: LucideIcon
  ruta?: string
  roles?: Rol[] // roles que lo ven (el administrador ve todo). Sin roles = todos. [] = solo administrador
  hijos?: Hijo[]
}

// Cada bloque se separa con una línea y tiene su propio color de icono.
// Para agregar una página nueva al menú solo editas estos arreglos.
const BLOQUES: { tono: Tono; items: ItemMenu[] }[] = [
  {
    tono: 'base',
    items: [
      { titulo: 'Dashboard', icono: LayoutDashboard, ruta: '/' },
      {
        titulo: 'Jugadores',
        icono: Users,
        hijos: [
          { titulo: 'Ver jugadores', ruta: '/jugadores' },
          { titulo: 'Nuevo jugador', ruta: '/crear', roles: [] },
        ],
      },
      { titulo: 'Categorías', icono: Layers, ruta: '/categorias' },
      {
        titulo: 'Clases',
        icono: CalendarCheck,
        hijos: [
          { titulo: 'Programar clases', ruta: '/clases', roles: [] },
          { titulo: 'Asistencia', ruta: '/asistencias', roles: ['entrenador'] },
        ],
      },
      { titulo: 'Calendario', icono: CalendarDays, ruta: '/calendario' },
      { titulo: 'Entrenadores', icono: UserCog, ruta: '/entrenadores', roles: [] },
      { titulo: 'Sedes', icono: MapPin, ruta: '/sedes', roles: [] },
    ],
  },
  {
    tono: 'verde',
    items: [
      {
        titulo: 'Gestión financiera',
        icono: Wallet,
        hijos: [{ titulo: 'Mensualidades', ruta: '/mensualidades', roles: ['tesorero'] }],
      },
    ],
  },
  {
    tono: 'ambar',
    items: [
      {
        titulo: 'Partidos',
        icono: Trophy,
        hijos: [
          { titulo: 'Programación', ruta: '/partidos', roles: ['entrenador'] },
          { titulo: 'Estadísticas', ruta: '/estadisticas' },
        ],
      },
      { titulo: 'Usuarios', icono: KeyRound, ruta: '/usuarios', roles: [] },
    ],
  },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [abierto, setAbierto] = useState(window.innerWidth > 800)
  // Si entras directo a una subpágina, su grupo ya aparece desplegado
  const [grupo, setGrupo] = useState<string | null>(
    BLOQUES.flatMap((b) => b.items).find((i) => i.hijos?.some((h) => h.ruta === pathname))?.titulo ?? null
  )

  const puedeVer = (roles?: Rol[]) =>
    !roles || usuario?.rol === 'administrador' || (!!usuario && roles.includes(usuario.rol))

  const itemVisible = (i: ItemMenu) =>
    puedeVer(i.roles) && (!i.hijos || i.hijos.some((h) => puedeVer(h.roles)))

  const bloques = BLOQUES.map((b) => ({ ...b, items: b.items.filter(itemVisible) })).filter((b) => b.items.length > 0)

  const alNavegar = () => {
    if (window.innerWidth <= 800) setAbierto(false)
  }

  const salir = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <div className="topbar">
        <button className="menu-toggle" onClick={() => setAbierto(!abierto)} aria-label="Abrir o cerrar menú">
          ☰
        </button>
        <img src="/logo%20academia%20dorada.png" alt="Logo Academia Dorada" />
        <div className="topbar-titulo">
          <small>Administrador de academia</small>
          <strong>Club Deportivo Academia Dorada</strong>
        </div>
        {usuario && (
          <div className="topbar-usuario">
            <span>{usuario.nombre} · {usuario.rol}</span>
            <button className="btn-secondary" onClick={salir}>Cerrar sesión</button>
          </div>
        )}
      </div>

      <div className="app-body">
        <aside className={`sidebar ${abierto ? '' : 'sidebar-cerrado'}`}>
          <nav className="sb-scroll">
            {bloques.map((bloque, n) => (
              <div key={n} className="sb-bloque">
                {bloque.items.map((item) => {
                  const Icono = item.icono
                  const icono = (
                    <span className={`sb-icono sb-${bloque.tono}`}><Icono size={18} /></span>
                  )

                  if (!item.hijos) {
                    return (
                      <NavLink key={item.ruta} to={item.ruta!} end className="sb-item" onClick={alNavegar}>
                        {icono}
                        <span className="sb-texto">{item.titulo}</span>
                      </NavLink>
                    )
                  }

                  const desplegado = grupo === item.titulo
                  return (
                    <div key={item.titulo}>
                      <button
                        className={`sb-item ${item.hijos.some((h) => h.ruta === pathname) ? 'sb-grupo-activo' : ''}`}
                        onClick={() => setGrupo(desplegado ? null : item.titulo)}
                      >
                        {icono}
                        <span className="sb-texto">{item.titulo}</span>
                        <ChevronDown size={16} className={`sb-chevron ${desplegado ? 'sb-chevron-abierto' : ''}`} />
                      </button>
                      {desplegado && (
                        <div className="sb-sub">
                          {item.hijos.filter((h) => puedeVer(h.roles)).map((h) => (
                            <NavLink key={h.ruta} to={h.ruta} end className="sb-subitem" onClick={alNavegar}>
                              {h.titulo}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="sb-pie">
            <small>ACADEMIA DORADA</small>
            <strong>Jaiver Muñoz</strong>
          </div>
        </aside>

        <div className="contenido">{children}</div>
      </div>
    </div>
  )
}