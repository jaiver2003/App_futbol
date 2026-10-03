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
  nombre:         { type: String, required: true },
  apellido:       { type: String, required: true },
  edad:           { type: Number, required: true },
  posicion:       { type: String, enum: ['Portero','Defensa','Mediocampista','Delantero'], required: true },
  numeroCamiseta: { type: Number, required: true, unique: true },
  telefono:       { type: String, required: true },
  estado:         { type: String, enum: ['activo','inactivo'], default: 'activo' }
}, { timestamps: true });

export default mongoose.model<IJugador>('Jugador', JugadorSchema);