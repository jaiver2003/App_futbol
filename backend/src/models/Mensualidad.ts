import mongoose, { Schema, Document } from 'mongoose';

export const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export interface IMensualidad extends Document {
  jugadorId: mongoose.Types.ObjectId;
  mes: string;
  anio: number;
  valor: number;
  estado: 'pagado' | 'pendiente' | 'parcial';
  metodoPago?: 'nequi' | 'bancolombia' | 'bre-b';
  fechaPago?: Date;
}

const MensualidadSchema = new Schema<IMensualidad>({
  jugadorId: { type: Schema.Types.ObjectId, ref: 'Jugador', required: [true, 'jugadorId es obligatorio'] },
  mes:   { type: String, enum: { values: MESES, message: 'Mes inválido' }, required: [true, 'El mes es obligatorio'] },
  anio:  { type: Number, required: [true, 'El año es obligatorio'], min: [2000, 'Año inválido'] },
  valor: { type: Number, required: [true, 'El valor es obligatorio'], min: [1, 'El valor debe ser mayor a 0'] },
  estado: { type: String, enum: ['pagado', 'pendiente', 'parcial'], default: 'pendiente' },
  metodoPago: { type: String, enum: { values: ['nequi', 'bancolombia', 'bre-b'], message: 'Método de pago inválido' } },
  fechaPago: { type: Date }
}, { timestamps: true });

// Un jugador solo puede tener una mensualidad por mes y año
MensualidadSchema.index({ jugadorId: 1, mes: 1, anio: 1 }, { unique: true });

export default mongoose.model<IMensualidad>('Mensualidad', MensualidadSchema);