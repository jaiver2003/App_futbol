import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { JugadorInput } from '../types'
import '../styles/forms.css'

interface Props {
  initialData?: Partial<JugadorInput>
  onSubmit: (data: JugadorInput) => void
}

export default function JugadorForm({ initialData = {}, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre ?? '',
    apellido: initialData.apellido ?? '',
    edad: initialData.edad !== undefined ? String(initialData.edad) : '',
    posicion: initialData.posicion ?? '',
    numeroCamiseta: initialData.numeroCamiseta !== undefined ? String(initialData.numeroCamiseta) : '',
    telefono: initialData.telefono ?? '',
    estado: initialData.estado ?? 'activo',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      edad: Number(formData.edad),
      numeroCamiseta: Number(formData.numeroCamiseta),
      estado: formData.estado as 'activo' | 'inactivo',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="container">
      <label>Nombre:</label>
      <input name="nombre" value={formData.nombre} onChange={handleChange} required />

      <label>Apellido:</label>
      <input name="apellido" value={formData.apellido} onChange={handleChange} required />

      <label>Edad:</label>
      <input name="edad" type="number" min={4} max={60} value={formData.edad} onChange={handleChange} required />

      <label>Posición:</label>
      <select name="posicion" value={formData.posicion} onChange={handleChange} required>
        <option value="">Selecciona posición</option>
        <option>Portero</option>
        <option>Defensa</option>
        <option>Mediocampista</option>
        <option>Delantero</option>
      </select>

      <label>Número de camiseta:</label>
      <input name="numeroCamiseta" type="number" min={1} max={99} value={formData.numeroCamiseta} onChange={handleChange} required />

      <label>Teléfono (WhatsApp):</label>
      <input name="telefono" value={formData.telefono} onChange={handleChange} required />

      <label>Estado:</label>
      <select name="estado" value={formData.estado} onChange={handleChange}>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>

      <button type="submit">Guardar</button>
    </form>
  )
}