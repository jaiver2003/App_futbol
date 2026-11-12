import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  obtenerMensualidades,
  crearMensualidad,
  actualizarMensualidad,
  eliminarMensualidad,
} from '../api/mensualidades'
import { obtenerJugadores } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import type { Jugador, Mensualidad, MensualidadInput, MetodoPago } from '../types'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const VALOR_MAXIMO = 70000

const METODOS: { valor: MetodoPago; etiqueta: string }[] = [
  { valor: 'nequi', etiqueta: 'Nequi' },
  { valor: 'bancolombia', etiqueta: 'Bancolombia' },
  { valor: 'bre-b', etiqueta: 'Bre-B' },
]

const pagoVacio: MensualidadInput = { jugadorId: '', mes: 'Enero', anio: 2026, valor: 30000, estado: 'pagado', metodoPago: 'nequi' }

const diasDesde = (fecha: string) =>
  Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))

const enviarWhatsApp = (telefono: string, nombre: string, dias?: number) => {
  const mensaje = dias && dias > 30
    ? `Hola ${nombre}, llevas más de ${dias} días con tu mensualidad pendiente. Por favor realiza el pago urgente. — Club Deportivo Academia Dorada`
    : `Hola ${nombre}, te recordamos que tienes una mensualidad pendiente. Por favor realiza el pago a la brevedad. — Club Deportivo Academia Dorada`
  window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
}

const tarjeta = { background: '#fff', borderRadius: '8px', padding: '15px', border: '1px solid #ddd' }

export default function Mensualidades() {
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [formPago, setFormPago] = useState<MensualidadInput>(pagoVacio)
  const [errorValor, setErrorValor] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const cargar = () => {
    obtenerMensualidades().then((res) => setMensualidades(res.data)).catch(console.error)
  }

  useEffect(() => {
    obtenerMensualidades().then((res) => setMensualidades(res.data)).catch(console.error)
    obtenerJugadores().then((res) => setJugadores(res.data)).catch(console.error)
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const numerico = name === 'anio' || name === 'valor'
    setFormPago({ ...formPago, [name]: numerico ? Number(value) : value })
    if (name === 'valor') {
      setErrorValor(Number(value) > VALOR_MAXIMO ? `⚠️ El valor no puede superar $${VALOR_MAXIMO.toLocaleString()}` : '')
    }
  }

  const cerrarForm = () => {
    setMostrarForm(false)
    setEditandoId(null)
    setFormPago(pagoVacio)
    setErrorValor('')
  }

  const handleEditar = (m: Mensualidad) => {
    setFormPago({
      jugadorId: m.jugadorId?._id ?? '',
      mes: m.mes,
      anio: m.anio,
      valor: m.valor,
      estado: m.estado,
      metodoPago: m.metodoPago ?? 'nequi',
    })
    setEditandoId(m._id)
    setErrorValor('')
    setMostrarForm(true)
  }

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta mensualidad?')) return
    try {
      await eliminarMensualidad(id)
      setMensualidades(mensualidades.filter((m) => m._id !== id))
    } catch (err) {
      alert(`❌ ${mensajeDeError(err, 'Error al eliminar la mensualidad')}`)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (formPago.valor > VALOR_MAXIMO) {
      setErrorValor(`⚠️ El valor no puede superar $${VALOR_MAXIMO.toLocaleString()}`)
      return
    }
    try {
      if (editandoId) {
        await actualizarMensualidad(editandoId, {
          mes: formPago.mes,
          anio: formPago.anio,
          valor: formPago.valor,
          estado: formPago.estado,
          metodoPago: formPago.metodoPago,
        })
      } else {
        await crearMensualidad(formPago)
      }
      cargar()
      cerrarForm()
    } catch (err) {
      alert(`❌ ${mensajeDeError(err, 'Error al guardar el pago')}`)
    }
  }

  const pagados = mensualidades.filter((m) => m.estado === 'pagado').length
  const pendientes = mensualidades.filter((m) => m.estado === 'pendiente').length
  const totalRecaudado = mensualidades
    .filter((m) => m.estado === 'pagado')
    .reduce((acc, m) => acc + m.valor, 0)
  const vencidas = mensualidades.filter(
    (m) => m.estado !== 'pagado' && m.createdAt && diasDesde(m.createdAt) > 30
  )

  return (
    <main className="container">
      <h2>Mensualidades</h2>

      {vencidas.length > 0 && (
        <div style={{ background: '#fdecea', borderLeft: '4px solid red', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px' }}>
          <strong style={{ color: '#b71c1c' }}>
            ⚠️ {vencidas.length} mensualidad(es) con más de 30 días sin pagar
          </strong>
          {vencidas.map((m) => (
            <div key={m._id} style={{ marginTop: '6px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span>
                {m.jugadorId?.nombre} {m.jugadorId?.apellido} — {diasDesde(m.createdAt!)} días
              </span>
              {m.jugadorId && (
                <button
                  style={{ backgroundColor: '#25d366' }}
                  onClick={() => enviarWhatsApp(m.jugadorId.telefono, m.jugadorId.nombre, diasDesde(m.createdAt!))}
                >
                  💬 Cobrar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={tarjeta}><p>Pagados</p><h2 style={{ color: 'green' }}>{pagados}</h2></div>
        <div style={tarjeta}><p>Pendientes</p><h2 style={{ color: 'red' }}>{pendientes}</h2></div>
        <div style={tarjeta}><p>Total recaudado</p><h2>${totalRecaudado.toLocaleString()}</h2></div>
      </div>

      <button
        onClick={() => (mostrarForm ? cerrarForm() : setMostrarForm(true))}
        style={{ marginBottom: '15px' }}
      >
        {mostrarForm ? 'Cancelar' : '+ Registrar pago'}
      </button>

      {mostrarForm && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', marginBottom: '20px', ...tarjeta }}>
          <h3 style={{ margin: 0 }}>{editandoId ? 'Editar pago' : 'Registrar pago'}</h3>

          <label>Jugador:</label>
          <select
            name="jugadorId"
            value={formPago.jugadorId}
            onChange={handleChange}
            required
            disabled={!!editandoId}
          >
            <option value="">Selecciona jugador</option>
            {jugadores
              .filter((j) => j.estado === 'activo' || j._id === formPago.jugadorId)
              .map((j) => (
                <option key={j._id} value={j._id}>{j.nombre} {j.apellido}</option>
              ))}
          </select>

          <label>Mes:</label>
          <select name="mes" value={formPago.mes} onChange={handleChange}>
            {MESES.map((m) => <option key={m}>{m}</option>)}
          </select>

          <label>Año:</label>
          <input name="anio" type="number" value={formPago.anio} onChange={handleChange} required />

          <label>Valor (máx ${VALOR_MAXIMO.toLocaleString()}):</label>
          <input name="valor" type="number" value={formPago.valor} onChange={handleChange} required />
          {errorValor && <span style={{ color: 'red', fontSize: '13px' }}>{errorValor}</span>}

          <label>Estado:</label>
          <select name="estado" value={formPago.estado} onChange={handleChange}>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Parcial</option>
          </select>

          {formPago.estado === 'pagado' && (
            <>
              <label>Método de pago:</label>
              <select name="metodoPago" value={formPago.metodoPago} onChange={handleChange} required>
                {METODOS.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </>
          )}

          <button type="submit">{editandoId ? 'Guardar cambios' : 'Guardar pago'}</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Jugador</th><th>Mes</th><th>Año</th><th>Valor</th>
            <th>Estado</th><th>Método</th><th>Días pendiente</th><th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {mensualidades.length === 0 ? (
            <tr><td colSpan={8}>No hay pagos registrados aún.</td></tr>
          ) : (
            mensualidades.map((m) => {
              const dias = m.createdAt ? diasDesde(m.createdAt) : 0
              const vencida = m.estado !== 'pagado' && dias > 30
              return (
                <tr key={m._id} style={vencida ? { background: '#fdecea' } : undefined}>
                  <td>{m.jugadorId ? `${m.jugadorId.nombre} ${m.jugadorId.apellido}` : '-'}</td>
                  <td>{m.mes}</td>
                  <td>{m.anio}</td>
                  <td>${m.valor.toLocaleString()}</td>
                  <td>{m.estado}</td>
                  <td>{m.estado === 'pagado' ? (METODOS.find((o) => o.valor === m.metodoPago)?.etiqueta ?? '—') : '—'}</td>
                  <td>{m.estado !== 'pagado' ? `${vencida ? '🔴 ' : ''}${dias} días` : '✅ Al día'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {m.estado !== 'pagado' && m.jugadorId && (
                        <button
                          style={{ backgroundColor: '#25d366' }}
                          onClick={() => enviarWhatsApp(m.jugadorId.telefono, m.jugadorId.nombre, dias)}
                        >
                          💬 Cobrar
                        </button>
                      )}
                      <button onClick={() => handleEditar(m)}>Editar</button>
                      <button style={{ backgroundColor: 'red' }} onClick={() => handleEliminar(m._id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </main>
  )
}