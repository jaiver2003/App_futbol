/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { iniciarSesion, obtenerYo } from '../api/auth'
import type { Usuario } from '../types'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  // Al abrir la app: si hay token guardado, se valida con el servidor
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setCargando(false)
      return
    }
    obtenerYo()
      .then((res) => setUsuario(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCargando(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await iniciarSesion(email, password)
    localStorage.setItem('token', data.token)
    setUsuario(data.usuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, cargando, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}