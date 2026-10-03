import mongoose, { Schema, Document } from 'mongoose';

export interface IMensualidad extends Document {
  jugadorId: mongoose.Types.ObjectId;
  mes: string;
  anio: number;
  valor: number;
  estado: 'pagado' | 'pendiente' | 'parcial';
  fechaPago?: Date;
}

const MensualidadSchema = new Schema<IMensualidad>({
  jugadorId: { type: Schema.Types.ObjectId, ref: 'Jugador', required: true },
  mes:       { type: String, required: true },
  anio:      { type: Number, required: true },
  valor:     { type: Number, required: true },
  estado:    { type: String, enum: ['pagado','pendiente','parcial'], default: 'pendiente' },
  fechaPago: { type: Date }
}, { timestamps: true });

export default mongoose.model<IMensualidad>('Mensualidad', MensualidadSchema);