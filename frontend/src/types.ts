export interface Jugador {
  _id: string
  nombre: string
  apellido: string
  edad: number
  posicion: string
  numeroCamiseta: number
  telefono: string
  estado: 'activo' | 'inactivo'
}

// Datos que se envían al crear o editar (sin _id)
export type JugadorInput = Omit<Jugador, '_id'>

export interface Mensualidad {
  _id: string
  jugadorId: Jugador // el backend lo devuelve poblado (populate)
  mes: string
  anio: number
  valor: number
  estado: 'pagado' | 'pendiente' | 'parcial'
  fechaPago?: string
  createdAt?: string
}

export interface MensualidadInput {
  jugadorId: string
  mes: string
  anio: number
  valor: number
  estado: 'pagado' | 'pendiente' | 'parcial'
  fechaPago?: string
}

export interface Categoria {
  _id: string
  nombre: string
  edadMin: number
  edadMax: number
  horario: string
  createdAt?: string
}

export type CategoriaInput = Omit<Categoria, '_id' | 'createdAt'>

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