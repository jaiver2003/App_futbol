import mongoose, { Schema, Document } from 'mongoose';

export interface IEstadisticaPartido extends Document {
  partidoId: mongoose.Types.ObjectId;
  jugadorId: mongoose.Types.ObjectId;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  minutos: number;
}

const EstadisticaSchema = new Schema<IEstadisticaPartido>({
  partidoId: { type: Schema.Types.ObjectId, ref: 'Partido', required: [true, 'partidoId es obligatorio'] },
  jugadorId: { type: Schema.Types.ObjectId, ref: 'Jugador', required: [true, 'jugadorId es obligatorio'] },
  goles: { type: Number, default: 0, min: [0, 'Los goles no pueden ser negativos'] },
  asistencias: { type: Number, default: 0, min: [0, 'Las asistencias no pueden ser negativas'] },
  amarillas: { type: Number, default: 0, min: [0, 'No puede ser negativo'], max: [2, 'Máximo 2 amarillas por partido'] },
  rojas: { type: Number, default: 0, min: [0, 'No puede ser negativo'], max: [1, 'Máximo 1 roja por partido'] },
  minutos: { type: Number, default: 0, min: [0, 'No puede ser negativo'], max: [120, 'Máximo 120 minutos'] }
}, { timestamps: true });

// Un jugador solo tiene una fila de estadísticas por partido
EstadisticaSchema.index({ partidoId: 1, jugadorId: 1 }, { unique: true });

export default mongoose.model<IEstadisticaPartido>('EstadisticaPartido', EstadisticaSchema);