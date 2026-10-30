import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { obtenerMensualidades, crearMensualidad } from '../api/mensualidades'
import { obtenerJugadores } from '../api/jugadores'
import { mensajeDeError } from '../api/errores'
import type { Jugador, Mensualidad, MensualidadInput } from '../types'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const VALOR_MAXIMO = 70000

const pagoVacio: MensualidadInput = { jugadorId: '', mes: 'Enero', anio: 2026, valor: 30000, estado: 'pagado' }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (formPago.valor > VALOR_MAXIMO) {
      setErrorValor(`⚠️ El valor no puede superar $${VALOR_MAXIMO.toLocaleString()}`)
      return
    }
    try {
      await crearMensualidad(formPago)
      cargar()
      setMostrarForm(false)
      setFormPago(pagoVacio)
      setErrorValor('')
    } catch (err) {
      alert(`❌ ${mensajeDeError(err, 'Error al registrar el pago')}`)
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

      <button onClick={() => setMostrarForm(!mostrarForm)} style={{ marginBottom: '15px' }}>
        {mostrarForm ? 'Cancelar' : '+ Registrar pago'}
      </button>

      {mostrarForm && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', marginBottom: '20px', ...tarjeta }}>
          <label>Jugador:</label>
          <select name="jugadorId" value={formPago.jugadorId} onChange={handleChange} required>
            <option value="">Selecciona jugador</option>
            {jugadores.filter((j) => j.estado === 'activo').map((j) => (
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

          <button type="submit">Guardar pago</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Jugador</th><th>Mes</th><th>Año</th><th>Valor</th>
            <th>Estado</th><th>Días pendiente</th><th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {mensualidades.length === 0 ? (
            <tr><td colSpan={7}>No hay pagos registrados aún.</td></tr>
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
                  <td>{m.estado !== 'pagado' ? `${vencida ? '🔴 ' : ''}${dias} días` : '✅ Al día'}</td>
                  <td>
                    {m.estado !== 'pagado' && m.jugadorId && (
                      <button
                        style={{ backgroundColor: '#25d366' }}
                        onClick={() => enviarWhatsApp(m.jugadorId.telefono, m.jugadorId.nombre, dias)}
                      >
                        💬 Cobrar
                      </button>
                    )}
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