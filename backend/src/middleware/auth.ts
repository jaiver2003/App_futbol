import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Rol } from '../models/Usuario';

export interface PayloadToken {
  id: string;
  rol: Rol;
  nombre: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

export function obtenerSecreto(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) throw new Error('Falta JWT_SECRET en el archivo .env del backend');
  return secreto;
}

// 1. ¿Quién eres? Lee el token del encabezado "Authorization: Bearer <token>"
export function verificarToken(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') return next();
  const encabezado = req.headers.authorization;
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  try {
    const payload = jwt.verify(encabezado.slice(7), obtenerSecreto()) as PayloadToken;
    req.usuario = { id: payload.id, rol: payload.rol, nombre: payload.nombre };
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Sesión vencida o inválida, inicia sesión de nuevo' });
  }
}

// 2. ¿Qué puedes hacer? El administrador siempre puede; los demás roles según la lista.
//    leer = roles que pueden consultar (GET), escribir = roles que pueden crear/editar/borrar.
export const acceso = (leer: Rol[], escribir: Rol[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const rol = req.usuario?.rol;
    if (!rol) return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
    if (rol === 'administrador') return next();
    const consulta = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
    const permitidos = consulta ? leer : escribir;
    if (!permitidos.includes(rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };