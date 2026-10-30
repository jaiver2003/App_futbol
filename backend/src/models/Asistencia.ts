import mongoose, { Schema, Document } from 'mongoose';

export interface IAsistencia extends Document {
  jugadorId: mongoose.Types.ObjectId;
  fecha: Date;
  presente: boolean;
  observacion?: string;
}

const AsistenciaSchema = new Schema<IAsistencia>({
  jugadorId: { type: Schema.Types.ObjectId, ref: 'Jugador', required: [true, 'jugadorId es obligatorio'] },
  fecha: { type: Date, required: [true, 'La fecha es obligatoria'] },
  presente: { type: Boolean, required: [true, 'Debes indicar si el jugador asistió'] },
  observacion: { type: String, trim: true, maxlength: [200, 'La observación admite máximo 200 caracteres'] }
}, { timestamps: true });

// Un jugador solo puede tener un registro de asistencia por fecha
AsistenciaSchema.index({ jugadorId: 1, fecha: 1 }, { unique: true });

export default mongoose.model<IAsistencia>('Asistencia', AsistenciaSchema);