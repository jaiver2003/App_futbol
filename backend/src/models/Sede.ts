import mongoose, { Schema, Document } from 'mongoose';

export interface ISede extends Document {
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono?: string;
  estado: 'activa' | 'inactiva';
}

const SedeSchema = new Schema<ISede>({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
  ciudad: { type: String, required: [true, 'La ciudad es obligatoria'], trim: true },
  direccion: { type: String, required: [true, 'La dirección es obligatoria'], trim: true },
  telefono: { type: String, trim: true },
  estado: { type: String, enum: ['activa', 'inactiva'], default: 'activa' }
}, { timestamps: true });

export default mongoose.model<ISede>('Sede', SedeSchema);