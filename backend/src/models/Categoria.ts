import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoria extends Document {
  nombre: string;
  edadMin: number;
  edadMax: number;
  horario: string;
  sedeId?: mongoose.Types.ObjectId;
}

const CategoriaSchema = new Schema<ICategoria>({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
  edadMin: { type: Number, required: [true, 'La edad mínima es obligatoria'], min: [4, 'Edad mínima 4'], max: [60, 'Edad máxima 60'] },
  edadMax: { type: Number, required: [true, 'La edad máxima es obligatoria'], min: [4, 'Edad mínima 4'], max: [60, 'Edad máxima 60'] },
  horario: { type: String, required: [true, 'El horario es obligatorio'], trim: true },
  sedeId: { type: Schema.Types.ObjectId, ref: 'Sede' }
}, { timestamps: true });

export default mongoose.model<ICategoria>('Categoria', CategoriaSchema);