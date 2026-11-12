import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario';

const router = Router();

function manejarError(res: Response, err: any) {
  if (err instanceof mongoose.Error.ValidationError) {
    const detalles = Object.values(err.errors).map((e: any) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: detalles });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ mensaje: `Valor inválido para el campo '${err.path}'` });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

// Crear usuario (solo administrador, se controla en servidor.ts)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!password || String(password).length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 6 caracteres' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const usuario = await Usuario.create({ nombre, email, password: hash, rol });
    res.status(201).json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, estado: usuario.estado });
  } catch (err) { manejarError(res, err); }
});

// Listar usuarios (nunca incluye contraseñas)
router.get('/', async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: 1 });
    res.status(200).json(usuarios);
  } catch (err) { manejarError(res, err); }
});

// Cambiar rol o estado (activar/desactivar)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const { rol, estado } = req.body;
    // Un administrador no puede quitarse el rol ni desactivarse a sí mismo
    if (req.params.id === req.usuario?.id && (rol !== undefined && rol !== 'administrador' || estado === 'inactivo')) {
      return res.status(400).json({ mensaje: 'No puedes quitarte el rol de administrador ni desactivarte a ti mismo' });
    }
    const cambios: Record<string, any> = {};
    if (rol !== undefined) cambios.rol = rol;
    if (estado !== undefined) cambios.estado = estado;
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (err) { manejarError(res, err); }
});

// Eliminar usuario
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    if (req.params.id === req.usuario?.id) return res.status(400).json({ mensaje: 'No puedes eliminar tu propio usuario' });
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (err) { manejarError(res, err); }
});

export default router;