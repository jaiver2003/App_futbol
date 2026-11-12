export interface Jugador {
  _id: string
  nombre: string
  apellido: string
  edad: number
  posicion: string
  numeroCamiseta: number
  telefono: string
  categoriaId?: { _id: string; nombre: string; horario?: string } | string | null // el backend lo devuelve poblado
  estado: 'activo' | 'inactivo'
}

// Datos que se envían al crear o editar (sin _id)
export type JugadorInput = Omit<Jugador, '_id' | 'categoriaId'> & { categoriaId?: string }
export type MetodoPago = 'nequi' | 'bancolombia' | 'bre-b'
export interface Mensualidad {
  _id: string
  jugadorId: Jugador // el backend lo devuelve poblado (populate)
  mes: string
  anio: number
  valor: number
  estado: 'pagado' | 'pendiente' | 'parcial'
  metodoPago?: MetodoPago
  fechaPago?: string
  createdAt?: string
}

export interface MensualidadInput {
  jugadorId: string
  mes: string
  anio: number
  valor: number
  estado: 'pagado' | 'pendiente' | 'parcial'
  metodoPago?: MetodoPago
  fechaPago?: string
}

export interface Categoria {
  _id: string
  nombre: string
  edadMin: number
  edadMax: number
  horario: string
  sedeId?: { _id: string; nombre: string } | string | null // el backend lo devuelve poblado
  createdAt?: string
}

export type CategoriaInput = Omit<Categoria, '_id' | 'createdAt' | 'sedeId'> & { sedeId?: string }

export interface Entrenador {
  _id: string
  nombre: string
  apellido: string
  telefono: string
  especialidad: string
  categoriaId?: Pick<Categoria, '_id' | 'nombre' | 'horario'> | string
  estado: 'activo' | 'inactivo'
  createdAt?: string
}

export interface EntrenadorInput {
  nombre: string
  apellido: string
  telefono: string
  especialidad: string
  categoriaId?: string
  estado: 'activo' | 'inactivo'
}

export interface Partido {
  _id: string
  fecha: string
  rival: string
  lugar: string
  categoriaId: Pick<Categoria, '_id' | 'nombre'> | string
  golesFavor?: number
  golesContra?: number
  estado: 'programado' | 'jugado' | 'cancelado'
  createdAt?: string
}

export interface PartidoInput {
  fecha: string
  rival: string
  lugar: string
  categoriaId: string
  golesFavor?: number
  golesContra?: number
  estado: 'programado' | 'jugado' | 'cancelado'
}

export interface Asistencia {
  _id: string
  jugadorId: Pick<Jugador, '_id' | 'nombre' | 'apellido' | 'numeroCamiseta'> | string
  fecha: string
  presente: boolean
  observacion?: string
  createdAt?: string
}

export interface AsistenciaInput {
  jugadorId: string
  fecha: string
  presente: boolean
  observacion?: string
}

export interface HistorialAsistencia {
  jugador: string
  totalRegistros: number
  presentes: number
  ausentes: number
  porcentajeAsistencia: number
  historial: Asistencia[]
}
export interface Sede {
  _id: string
  nombre: string
  ciudad: string
  direccion: string
  telefono?: string
  estado: 'activa' | 'inactiva'
}

export type SedeInput = Omit<Sede, '_id'>

export interface Perfil {
  jugador: Jugador
  pagos: {
    totalPagado: number
    pendientes: number
    historial: Pick<Mensualidad, '_id' | 'mes' | 'anio' | 'valor' | 'estado'>[]
  }
  asistencia: { total: number; presentes: number; ausentes: number; porcentaje: number | null }
  estadisticas: { partidos: number; goles: number; asistencias: number; amarillas: number; rojas: number }
}

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'

export interface Clase {
  _id: string
  categoriaId: { _id: string; nombre: string } | string
  entrenadorId: { _id: string; nombre: string; apellido: string } | string
  sedeId: { _id: string; nombre: string } | string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  estado: 'activa' | 'inactiva'
}

export interface ClaseInput {
  categoriaId: string
  entrenadorId: string
  sedeId: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  estado: 'activa' | 'inactiva'
}

export type Rol = 'administrador' | 'tesorero' | 'entrenador'

export interface Usuario {
  _id: string
  nombre: string
  email: string
  rol: Rol
  estado?: 'activo' | 'inactivo'
}

export interface EstadisticaPartido {
  _id: string
  partidoId: Pick<Partido, '_id' | 'fecha' | 'rival'> | string
  jugadorId: Pick<Jugador, '_id' | 'nombre' | 'apellido' | 'numeroCamiseta'> | string
  goles: number
  asistencias: number
  amarillas: number
  rojas: number
  minutos: number
}

export interface EstadisticaInput {
  partidoId: string
  jugadorId: string
  goles: number
  asistencias: number
  amarillas: number
  rojas: number
  minutos: number
}

export interface Goleador {
  jugadorId: string
  nombre: string
  numeroCamiseta: number
  goles: number
  asistencias: number
  amarillas: number
  rojas: number
  partidos: number
}