import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { crearPrimerAdmin } from '../api/auth'
import { mensajeDeError } from '../api/errores'

export default function Login() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const [primeraVez, setPrimeraVez] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      if (primeraVez) await crearPrimerAdmin(form)
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-pagina">
      <form className="login-card" onSubmit={enviar}>
        <img src="/logo%20academia%20dorada.png" alt="Logo Academia Dorada" />
        <h2>{primeraVez ? 'Crear administrador' : 'Iniciar sesión'}</h2>
        <p className="card-info" style={{ textAlign: 'center' }}>Club Deportivo Academia Dorada</p>

        {error && <p className="error-texto">{error}</p>}

        {primeraVez && (
          <input placeholder="Nombre completo" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        )}
        <input type="email" placeholder="Correo" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Contraseña (mínimo 6 caracteres)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        <button type="submit" disabled={enviando}>
          {enviando ? 'Un momento...' : primeraVez ? 'Crear y entrar' : 'Entrar'}
        </button>
        <button type="button" className="link-boton" onClick={() => { setPrimeraVez(!primeraVez); setError('') }}>
          {primeraVez ? '← Ya tengo cuenta' : '¿Primera vez? Crear el administrador'}
        </button>
      </form>
    </div>
  )
}