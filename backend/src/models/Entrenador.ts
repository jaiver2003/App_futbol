import mongoose, { Schema, Document } from 'mongoose';

export interface IEntrenador extends Document {
  nombre: string;
  apellido: string;
  telefono: string;
  especialidad: string;
  categoriaId?: mongoose.Types.ObjectId;
  estado: 'activo' | 'inactivo';
}

const EntrenadorSchema = new Schema<IEntrenador>({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  apellido: { type: String, required: [true, 'El apellido es obligatorio'], trim: true },
  telefono: { type: String, required: [true, 'El teléfono es obligatorio'], trim: true },
  especialidad: { type: String, required: [true, 'La especialidad es obligatoria'], trim: true },
  categoriaId: { type: Schema.Types.ObjectId, ref: 'Categoria' },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

export default mongoose.model<IEntrenador>('Entrenador', EntrenadorSchema);