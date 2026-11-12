import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import { obtenerSecreto, verificarToken } from '../middleware/auth';

const router = Router();

function manejarError(res: Response, err: any) {
  if (err instanceof mongoose.Error.ValidationError) {
    const detalles = Object.values(err.errors).map((e: any) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: detalles });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const datosPublicos = (u: any) => ({ _id: u._id, nombre: u.nombre, email: u.email, rol: u.rol });

// Crea el primer administrador. Solo funciona mientras no exista ningún usuario.
router.post('/primer-admin', async (req: Request, res: Response) => {
  try {
    if ((await Usuario.countDocuments()) > 0) {
      return res.status(403).json({ mensaje: 'Ya existe un usuario. Inicia sesión con tu cuenta' });
    }
    const { nombre, email, password } = req.body;
    if (!password || String(password).length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 6 caracteres' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const usuario = await Usuario.create({ nombre, email, password: hash, rol: 'administrador' });
    res.status(201).json(datosPublicos(usuario));
  } catch (err) { manejarError(res, err); }
});

// Iniciar sesión
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });

    const usuario = await Usuario.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    const correcta = usuario ? await bcrypt.compare(String(password), usuario.password) : false;
    // Mismo mensaje en ambos casos: no revelamos si el correo existe
    if (!usuario || !correcta) return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    if (usuario.estado === 'inactivo') return res.status(403).json({ mensaje: 'Tu usuario está inactivo' });

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
      obtenerSecreto(),
      { expiresIn: '8h' }
    );
    res.status(200).json({ token, usuario: datosPublicos(usuario) });
  } catch (err) { manejarError(res, err); }
});

// Quién soy (sirve para validar el token guardado en el navegador)
router.get('/me', verificarToken, async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findById(req.usuario!.id);
    if (!usuario || usuario.estado === 'inactivo') return res.status(401).json({ mensaje: 'Usuario no válido' });
    res.status(200).json(datosPublicos(usuario));
  } catch (err) { manejarError(res, err); }
});

export default router;