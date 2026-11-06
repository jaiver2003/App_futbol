import mongoose, { Schema, Document } from 'mongoose';

export interface IPartido extends Document {
  fecha: Date;
  rival: string;
  lugar: string;
  categoriaId: mongoose.Types.ObjectId;
  golesFavor?: number;
  golesContra?: number;
  estado: 'programado' | 'jugado' | 'cancelado';
}

const PartidoSchema = new Schema<IPartido>({
  fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
  rival: { type: String, required: [true, 'El rival es obligatorio'], trim: true },
  lugar: { type: String, required: [true, 'El lugar es obligatorio'], trim: true },
  categoriaId: { type: Schema.Types.ObjectId, ref: 'Categoria', required: [true, 'categoriaId es obligatorio'] },
  golesFavor: { type: Number, min: [0, 'Los goles no pueden ser negativos'] },
  golesContra: { type: Number, min: [0, 'Los goles no pueden ser negativos'] },
  estado: { type: String, enum: ['programado', 'jugado', 'cancelado'], default: 'programado' }
}, { timestamps: true });

export default mongoose.model<IPartido>('Partido', PartidoSchema);