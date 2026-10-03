import { useState, useEffect } from 'react'

interface Jugador {
  _id: string
  nombre: string
  apellido: string
  edad: number
  posicion: string
  numeroCamiseta: number
  telefono: string
  estado: string
}

interface Mensualidad {
  _id: string
  jugadorId: Jugador
  mes: string
  anio: number
  valor: number
  estado: 'pagado' | 'pendiente' | 'parcial'
  fechaPago?: string
  createdAt?: string
}

const formVacio = {
  nombre: '', apellido: '', edad: '', posicion: '',
  numeroCamiseta: '', telefono: '', estado: 'activo'
}

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const VALOR_MAXIMO = 70000

function diasDesde(fecha: string) {
  const hoy = new Date()
  const creacion = new Date(fecha)
  const diff = hoy.getTime() - creacion.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function App() {
  const [vista, setVista] = useState<'jugadores' | 'mensualidades'>('jugadores')
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarFormPago, setMostrarFormPago] = useState(false)
  const [form, setForm] = useState(formVacio)
  const [formPago, setFormPago] = useState({ jugadorId: '', mes: 'Enero', anio: 2026, valor: 30000, estado: 'pagado' })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [errorValor, setErrorValor] = useState('')

  const cargarJugadores = () => {
    fetch('http://localhost:3001/api/jugadores')
      .then(res => res.json())
      .then(data => setJugadores(data))
  }

  const cargarMensualidades = () => {
    fetch('http://localhost:3001/api/mensualidades')
      .then(res => res.json())
      .then(data => setMensualidades(data))
  }

  useEffect(() => {
    cargarJugadores()
    cargarMensualidades()
  }, [])

  const jugadoresFiltrados = jugadores.filter(j =>
    `${j.nombre} ${j.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    j.posicion.toLowerCase().includes(busqueda.toLowerCase())
  )

  const guardarJugador = async () => {
    const url = editandoId
      ? `http://localhost:3001/api/jugadores/${editandoId}`
      : 'http://localhost:3001/api/jugadores'
    const method = editandoId ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, edad: Number(form.edad), numeroCamiseta: Number(form.numeroCamiseta) })
    })
    cargarJugadores()
    setMostrarFormulario(false)
    setEditandoId(null)
    setForm(formVacio)
  }

  const guardarPago = async () => {
    if (Number(formPago.valor) > VALOR_MAXIMO) {
      setErrorValor(`⚠️ El valor no puede superar $${VALOR_MAXIMO.toLocaleString()}`)
      return
    }
    setErrorValor('')
    await fetch('http://localhost:3001/api/mensualidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formPago, valor: Number(formPago.valor), fechaPago: new Date() })
    })
    cargarMensualidades()
    setMostrarFormPago(false)
    setFormPago({ jugadorId: '', mes: 'Enero', anio: 2026, valor: 30000, estado: 'pagado' })
  }

  const editarJugador = (j: Jugador) => {
    setForm({ nombre: j.nombre, apellido: j.apellido, edad: String(j.edad), posicion: j.posicion, numeroCamiseta: String(j.numeroCamiseta), telefono: j.telefono, estado: j.estado })
    setEditandoId(j._id)
    setMostrarFormulario(true)
  }

  const eliminarJugador = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este jugador?')) return
    await fetch(`http://localhost:3001/api/jugadores/${id}`, { method: 'DELETE' })
    cargarJugadores()
  }

  const cancelar = () => {
    setMostrarFormulario(false)
    setEditandoId(null)
    setForm(formVacio)
  }

  const enviarWhatsApp = (telefono: string, nombre: string, dias?: number) => {
    const mensaje = dias && dias > 30
      ? `Hola ${nombre}  Llevas más de ${dias} días con tu mensualidad pendiente. Por favor realiza el pago urgente. — Club Deportivo Academia Dorada `
      : `Hola ${nombre}  Te recordamos que tienes una mensualidad pendiente. Por favor realiza el pago a la brevedad. — Club Deportivo Academia Dorada `
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const pagados = mensualidades.filter(m => m.estado === 'pagado').length
  const pendientes = mensualidades.filter(m => m.estado === 'pendiente').length
  const totalRecaudado = mensualidades.filter(m => m.estado === 'pagado').reduce((acc, m) => acc + m.valor, 0)
  const vencidas = mensualidades.filter(m => m.estado !== 'pagado' && m.createdAt && diasDesde(m.createdAt) > 30)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-yellow-500 p-4 shadow">
        <h1 className="text-2xl font-bold text-white">⚽ Club Deportivo Academia Dorada</h1>
        <p className="text-yellow-100 text-sm">Gestión de jugadores y mensualidades</p>
      </div>

      {/* Alerta mensualidades vencidas */}
      {vencidas.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded-lg">
          <p className="text-red-700 font-bold">⚠️ {vencidas.length} jugador(es) llevan más de 30 días sin pagar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {vencidas.map(m => (
              <div key={m._id} className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                <span className="text-red-700 text-sm">{m.jugadorId?.nombre} {m.jugadorId?.apellido} — {diasDesde(m.createdAt!)} días</span>
                <button
                  onClick={() => enviarWhatsApp(m.jugadorId.telefono, m.jugadorId.nombre, diasDesde(m.createdAt!))}
                  className="text-green-600 hover:text-green-800 text-xs font-medium"
                >
                  💬 Cobrar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="bg-white shadow mt-2">
        <div className="flex">
          <button
            onClick={() => setVista('jugadores')}
            className={`px-6 py-3 font-medium text-sm border-b-2 ${vista === 'jugadores' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            👤 Jugadores
          </button>
          <button
            onClick={() => setVista('mensualidades')}
            className={`px-6 py-3 font-medium text-sm border-b-2 ${vista === 'mensualidades' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            💰 Mensualidades {pendientes > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendientes}</span>}
          </button>
        </div>
      </div>

      <div className="p-6">

        {/* ===== VISTA JUGADORES ===== */}
        {vista === 'jugadores' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-gray-500 text-sm">Total jugadores</p>
                <p className="text-3xl font-bold text-yellow-500">{jugadores.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-gray-500 text-sm">Activos</p>
                <p className="text-3xl font-bold text-green-500">{jugadores.filter(j => j.estado === 'activo').length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-gray-500 text-sm">Inactivos</p>
                <p className="text-3xl font-bold text-red-500">{jugadores.filter(j => j.estado === 'inactivo').length}</p>
              </div>
            </div>

            <div className="mb-4">
              <input
                className="w-full border rounded-lg p-2 shadow-sm bg-white"
                placeholder="🔍 Buscar por nombre o posición..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-700">Jugadores</h2>
              <button onClick={() => { setMostrarFormulario(true); setEditandoId(null); setForm(formVacio) }} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                + Nuevo jugador
              </button>
            </div>

            {mostrarFormulario && (
              <div className="bg-white rounded-xl p-4 shadow mb-4">
                <h3 className="font-bold text-gray-700 mb-3">{editandoId ? '✏️ Editar jugador' : '➕ Agregar jugador'}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border rounded-lg p-2" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                  <input className="border rounded-lg p-2" placeholder="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
                  <input className="border rounded-lg p-2" placeholder="Edad" type="number" value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} />
                  <select className="border rounded-lg p-2" value={form.posicion} onChange={e => setForm({...form, posicion: e.target.value})}>
                    <option value="">Selecciona posición</option>
                    <option>Portero</option>
                    <option>Defensa</option>
                    <option>Mediocampista</option>
                    <option>Delantero</option>
                  </select>
                  <input className="border rounded-lg p-2" placeholder="Número camiseta" type="number" value={form.numeroCamiseta} onChange={e => setForm({...form, numeroCamiseta: e.target.value})} />
                  <input className="border rounded-lg p-2" placeholder="Teléfono WhatsApp" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                  <select className="border rounded-lg p-2" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={guardarJugador} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">{editandoId ? 'Actualizar' : 'Guardar'}</button>
                  <button onClick={cancelar} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-yellow-500 text-white">
                  <tr>
                    <th className="p-3 text-left">Jugador</th>
                    <th className="p-3 text-left">Posición</th>
                    <th className="p-3 text-left">Camiseta</th>
                    <th className="p-3 text-left">Teléfono</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadoresFiltrados.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-400">{busqueda ? 'No se encontraron jugadores' : 'No hay jugadores aún. ¡Agrega el primero!'}</td></tr>
                  ) : (
                    jugadoresFiltrados.map(j => (
                      <tr key={j._id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{j.nombre} {j.apellido}</td>
                        <td className="p-3">{j.posicion}</td>
                        <td className="p-3">#{j.numeroCamiseta}</td>
                        <td className="p-3">{j.telefono}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${j.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{j.estado}</span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button onClick={() => editarJugador(j)} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-200">✏️ Editar</button>
                          <button onClick={() => eliminarJugador(j._id)} className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm hover:bg-red-200">🗑️ Eliminar</button>
                          <button onClick={() => enviarWhatsApp(j.telefono, j.nombre)} className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm hover:bg-green-200">💬 WhatsApp</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== VISTA MENSUALIDADES ===== */}
        {vista === 'mensualidades' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-gray-500 text-sm">Pagados</p>
                <p className="text-3xl font-bold text-green-500">{pagados}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-gray-500 text-sm">Pendientes</p>
                <p className="text-3xl font-bold text-red-500">{pendientes}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-gray-500 text-sm">Total recaudado</p>
                <p className="text-3xl font-bold text-yellow-500">${totalRecaudado.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-700">Control de pagos</h2>
              <button onClick={() => setMostrarFormPago(true)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                + Registrar pago
              </button>
            </div>

            {mostrarFormPago && (
              <div className="bg-white rounded-xl p-4 shadow mb-4">
                <h3 className="font-bold text-gray-700 mb-3">💰 Registrar pago</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select className="border rounded-lg p-2" value={formPago.jugadorId} onChange={e => setFormPago({...formPago, jugadorId: e.target.value})}>
                    <option value="">Selecciona jugador</option>
                    {jugadores.map(j => (
                      <option key={j._id} value={j._id}>{j.nombre} {j.apellido}</option>
                    ))}
                  </select>
                  <select className="border rounded-lg p-2" value={formPago.mes} onChange={e => setFormPago({...formPago, mes: e.target.value})}>
                    {meses.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <input className="border rounded-lg p-2" placeholder="Año" type="number" value={formPago.anio} onChange={e => setFormPago({...formPago, anio: Number(e.target.value)})} />
                  <div>
                    <input
                      className={`border rounded-lg p-2 w-full ${errorValor ? 'border-red-500' : ''}`}
                      placeholder="Valor (máx $70.000)"
                      type="number"
                      value={formPago.valor}
                      onChange={e => {
                        setFormPago({...formPago, valor: Number(e.target.value)})
                        if (Number(e.target.value) > VALOR_MAXIMO) {
                          setErrorValor(`⚠️ El valor no puede superar $${VALOR_MAXIMO.toLocaleString()}`)
                        } else {
                          setErrorValor('')
                        }
                      }}
                    />
                    {errorValor && <p className="text-red-500 text-xs mt-1">{errorValor}</p>}
                  </div>
                  <select className="border rounded-lg p-2" value={formPago.estado} onChange={e => setFormPago({...formPago, estado: e.target.value})}>
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={guardarPago} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Guardar pago</button>
                  <button onClick={() => { setMostrarFormPago(false); setErrorValor('') }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-yellow-500 text-white">
                  <tr>
                    <th className="p-3 text-left">Jugador</th>
                    <th className="p-3 text-left">Mes</th>
                    <th className="p-3 text-left">Año</th>
                    <th className="p-3 text-left">Valor</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Días pendiente</th>
                    <th className="p-3 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {mensualidades.length === 0 ? (
                    <tr><td colSpan={7} className="p-4 text-center text-gray-400">No hay pagos registrados aún.</td></tr>
                  ) : (
                    mensualidades.map(m => {
                      const dias = m.createdAt ? diasDesde(m.createdAt) : 0
                      const vencida = m.estado !== 'pagado' && dias > 30
                      return (
                        <tr key={m._id} className={`border-t ${vencida ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                          <td className="p-3 font-medium">{m.jugadorId ? `${m.jugadorId.nombre} ${m.jugadorId.apellido}` : '-'}</td>
                          <td className="p-3">{m.mes}</td>
                          <td className="p-3">{m.anio}</td>
                          <td className="p-3">${m.valor.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.estado === 'pagado' ? 'bg-green-100 text-green-700' : m.estado === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {m.estado}
                            </span>
                          </td>
                          <td className="p-3">
                            {m.estado !== 'pagado' ? (
                              <span className={`text-sm font-medium ${vencida ? 'text-red-600' : 'text-gray-500'}`}>
                                {vencida ? `🔴 ${dias} días` : `${dias} días`}
                              </span>
                            ) : <span className="text-green-600 text-sm">✅ Al día</span>}
                          </td>
                          <td className="p-3">
                            {m.estado !== 'pagado' && m.jugadorId && (
                              <button onClick={() => enviarWhatsApp(m.jugadorId.telefono, m.jugadorId.nombre, dias)} className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm hover:bg-green-200">
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App