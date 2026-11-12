import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Rol } from '../types'

interface Props {
  roles?: Rol[] // si no se envía, basta con haber iniciado sesión
  children: ReactNode
}

export default function RutaProtegida({ roles, children }: Props) {
  const { usuario, cargando } = useAuth()

  if (cargando) return <p style={{ padding: 20 }}>Cargando...</p>
  if (!usuario) return <Navigate to="/login" replace />

  // El administrador entra a todo
  if (roles && usuario.rol !== 'administrador' && !roles.includes(usuario.rol)) {
    return (
      <main className="container">
        <h2>🚫 Sin permiso</h2>
        <p>Tu rol ({usuario.rol}) no puede ver esta sección.</p>
      </main>
    )
  }

  return <>{children}</>
}