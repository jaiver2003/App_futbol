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