import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerCategorias, crearCategoria, eliminarCategoria } from '../api/categorias'
import type { Categoria } from '../types'

const formVacio = { nombre: '', edadMin: '', edadMax: '', horario: '' }

function mensajeError(err: unknown): string {
  const data = (err as { response?: { data?: { mensaje?: string; errores?: { mensaje: string }[] } } })
    .response?.data
  if (data?.errores?.length) return data.errores.map((e) => e.mensaje).join('. ')
  return data?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.'
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const { data } = await obtenerCategorias()
      setCategorias(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await crearCategoria({
        nombre: form.nombre,
        edadMin: Number(form.edadMin),
        edadMax: Number(form.edadMax),
        horario: form.horario,
      })
      setForm(formVacio)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const borrar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      await eliminarCategoria(id)
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1>Categorías</h1>
      {error && <p>{error}</p>}

      <form onSubmit={guardar}>
        <input placeholder="Nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input type="number" placeholder="Edad mínima" value={form.edadMin}
          onChange={(e) => setForm({ ...form, edadMin: e.target.value })} required />
        <input type="number" placeholder="Edad máxima" value={form.edadMax}
          onChange={(e) => setForm({ ...form, edadMax: e.target.value })} required />
        <input placeholder="Horario (ej. Lunes 4pm)" value={form.horario}
          onChange={(e) => setForm({ ...form, horario: e.target.value })} required />
        <button type="submit">Crear categoría</button>
      </form>

      <ul>
        {categorias.map((c) => (
          <li key={c._id}>
            {c.nombre} · {c.edadMin}-{c.edadMax} años · {c.horario}{' '}
            <button onClick={() => borrar(c._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}