import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Jugador from '../models/Jugador';

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
    return res.status(400).json({ mensaje: 'Ese número de camiseta ya está asignado a otro jugador' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: string) => !mongoose.isValidObjectId(id);

// 1. Registrar jugador
router.post('/', async (req: Request, res: Response) => {
  try {
    const jugador = await Jugador.create(req.body);
    res.status(201).json(jugador);
  } catch (err) { manejarError(res, err); }
});

// 2 y 3. Listar jugadores (filtros opcionales ?posicion=Delantero&estado=activo)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.posicion) filtro.posicion = req.query.posicion;
    if (req.query.estado) filtro.estado = req.query.estado;
    const jugadores = await Jugador.find(filtro).sort({ numeroCamiseta: 1 });
    res.status(200).json(jugadores);
  } catch (err) { manejarError(res, err); }
});

// 6. Verificar si una camiseta está disponible
router.get('/camiseta/:numero', async (req: Request, res: Response) => {
  try {
    const numero = Number(req.params.numero);
    if (!Number.isInteger(numero) || numero < 1 || numero > 99) {
      return res.status(400).json({ mensaje: 'El número de camiseta debe ser un entero entre 1 y 99' });
    }
    const dueno = await Jugador.findOne({ numeroCamiseta: numero });
    if (dueno) {
      return res.status(200).json({
        numero, disponible: false,
        ocupadaPor: `${dueno.nombre} ${dueno.apellido}`
      });
    }
    res.status(200).json({ numero, disponible: true });
  } catch (err) { manejarError(res, err); }
});

// Obtener un jugador
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findById(req.params.id);
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    res.status(200).json(jugador);
  } catch (err) { manejarError(res, err); }
});

// 4. Actualizar jugador
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    res.status(200).json(jugador);
  } catch (err) { manejarError(res, err); }
});

// 5. Inactivar jugador (baja lógica)
router.patch('/:id/inactivar', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findByIdAndUpdate(req.params.id, { estado: 'inactivo' }, { returnDocument: 'after' });
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    res.status(200).json({ mensaje: 'Jugador inactivado', jugador });
  } catch (err) { manejarError(res, err); }
});

// Eliminar jugador (lo usa el botón Eliminar del frontend)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findByIdAndDelete(req.params.id);
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    res.status(200).json({ mensaje: 'Jugador eliminado' });
  } catch (err) { manejarError(res, err); }
});

export default router;