import mongoose, { Schema, Document } from 'mongoose';

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export interface IClase extends Document {
  categoriaId: mongoose.Types.ObjectId;
  entrenadorId: mongoose.Types.ObjectId;
  sedeId: mongoose.Types.ObjectId;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estado: 'activa' | 'inactiva';
}

const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

const ClaseSchema = new Schema<IClase>({
  categoriaId: { type: Schema.Types.ObjectId, ref: 'Categoria', required: [true, 'categoriaId es obligatorio'] },
  entrenadorId: { type: Schema.Types.ObjectId, ref: 'Entrenador', required: [true, 'entrenadorId es obligatorio'] },
  sedeId: { type: Schema.Types.ObjectId, ref: 'Sede', required: [true, 'sedeId es obligatorio'] },
  diaSemana: { type: String, enum: { values: DIAS, message: 'Día inválido' }, required: [true, 'El día es obligatorio'] },
  horaInicio: { type: String, match: [formatoHora, 'La hora de inicio debe tener formato HH:MM'], required: [true, 'La hora de inicio es obligatoria'] },
  horaFin: { type: String, match: [formatoHora, 'La hora de fin debe tener formato HH:MM'], required: [true, 'La hora de fin es obligatoria'] },
  estado: { type: String, enum: ['activa', 'inactiva'], default: 'activa' }
}, { timestamps: true });

export default mongoose.model<IClase>('Clase', ClaseSchema);