import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../api/usuarios'
import { mensajeDeError } from '../api/errores'
import type { Rol, Usuario } from '../types'

const formVacio = { nombre: '', email: '', password: '', rol: 'entrenador' as Rol }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const { data } = await obtenerUsuarios()
      setUsuarios(data)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await crearUsuario(form)
      setForm(formVacio)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const cambiarRol = async (id: string, rol: Rol) => {
    try {
      await actualizarUsuario(id, { rol })
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const alternarEstado = async (u: Usuario) => {
    try {
      await actualizarUsuario(u._id, { estado: u.estado === 'activo' ? 'inactivo' : 'activo' })
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar este usuario?')) return
    try {
      await eliminarUsuario(id)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <main className="container">
      <h2>Usuarios del sistema</h2>
      {error && <p className="error-texto">{error}</p>}

      <form className="form-inline" onSubmit={guardar}>
        <input placeholder="Nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input type="email" placeholder="Correo" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Contraseña (mín. 6)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
          <option value="administrador">Administrador</option>
          <option value="tesorero">Tesorero</option>
          <option value="entrenador">Entrenador</option>
        </select>
        <button type="submit">Crear usuario</button>
      </form>

      <table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u._id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.rol} onChange={(e) => cambiarRol(u._id, e.target.value as Rol)}>
                  <option value="administrador">administrador</option>
                  <option value="tesorero">tesorero</option>
                  <option value="entrenador">entrenador</option>
                </select>
              </td>
              <td>
                <button className="btn-secondary" onClick={() => alternarEstado(u)}>
                  {u.estado === 'activo' ? '✅ Activo' : '⛔ Inactivo'}
                </button>
              </td>
              <td><button className="btn-danger" onClick={() => borrar(u._id)}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}