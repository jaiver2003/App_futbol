import mongoose, { Schema, Document } from 'mongoose';

export const ROLES = ['administrador', 'tesorero', 'entrenador'] as const;
export type Rol = typeof ROLES[number];

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  estado: 'activo' | 'inactivo';
}

const UsuarioSchema = new Schema<IUsuario>({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido']
  },
  // select:false -> la contraseña (ya cifrada) nunca sale en las consultas normales
  password: { type: String, required: true, select: false },
  rol: {
    type: String,
    enum: { values: ROLES as unknown as string[], message: 'Rol inválido' },
    required: [true, 'El rol es obligatorio']
  },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);