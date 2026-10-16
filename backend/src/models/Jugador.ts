import mongoose, { Schema, Document } from 'mongoose';

export interface IJugador extends Document {
  nombre: string;
  apellido: string;
  edad: number;
  posicion: 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
  numeroCamiseta: number;
  telefono: string;
  estado: 'activo' | 'inactivo';
}

const JugadorSchema = new Schema<IJugador>({
  nombre:   { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  apellido: { type: String, required: [true, 'El apellido es obligatorio'], trim: true },
  edad:     { type: Number, required: [true, 'La edad es obligatoria'], min: [4, 'Edad mínima 4'], max: [60, 'Edad máxima 60'] },
  posicion: {
    type: String,
    enum: { values: ['Portero', 'Defensa', 'Mediocampista', 'Delantero'], message: 'Posición inválida' },
    required: [true, 'La posición es obligatoria']
  },
  numeroCamiseta: {
    type: Number, required: [true, 'El número de camiseta es obligatorio'],
    unique: true, min: [1, 'Camiseta mínima 1'], max: [99, 'Camiseta máxima 99']
  },
  telefono: { type: String, required: [true, 'El teléfono es obligatorio'], trim: true },
  estado:   { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

export default mongoose.model<IJugador>('Jugador', JugadorSchema);