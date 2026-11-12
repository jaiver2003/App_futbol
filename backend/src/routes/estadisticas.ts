import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import EstadisticaPartido from '../models/EstadisticaPartido';
import Partido from '../models/Partido';
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
    return res.status(409).json({ mensaje: 'Ese jugador ya tiene estadísticas registradas en este partido' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

// Tabla de goleadores (?limit=10)
router.get('/goleadores', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const filas = await EstadisticaPartido.aggregate([
      { $group: {
          _id: '$jugadorId',
          goles: { $sum: '$goles' }, asistencias: { $sum: '$asistencias' },
          amarillas: { $sum: '$amarillas' }, rojas: { $sum: '$rojas' },
          partidos: { $sum: 1 }
      } },
      { $match: { $or: [{ goles: { $gt: 0 } }, { asistencias: { $gt: 0 } }] } },
      { $sort: { goles: -1, asistencias: -1 } },
      { $limit: limit },
      { $lookup: { from: 'jugadors', localField: '_id', foreignField: '_id', as: 'jugador' } },
      { $unwind: '$jugador' },
      { $project: {
          _id: 0, jugadorId: '$_id',
          nombre: { $concat: ['$jugador.nombre', ' ', '$jugador.apellido'] },
          numeroCamiseta: '$jugador.numeroCamiseta',
          goles: 1, asistencias: 1, amarillas: 1, rojas: 1, partidos: 1
      } }
    ]);
    res.status(200).json(filas);
  } catch (err) { manejarError(res, err); }
});

// Registrar estadísticas de un jugador en un partido (solo partidos jugados)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { partidoId, jugadorId } = req.body;
    if (idInvalido(partidoId) || idInvalido(jugadorId)) {
      return res.status(400).json({ mensaje: 'partidoId y jugadorId son obligatorios y deben tener formato válido' });
    }
    const partido = await Partido.findById(partidoId);
    if (!partido) return res.status(404).json({ mensaje: 'El partido no existe' });
    if (partido.estado !== 'jugado') {
      return res.status(400).json({ mensaje: 'Solo se registran estadísticas de partidos ya jugados' });
    }
    if (!(await Jugador.findById(jugadorId))) return res.status(404).json({ mensaje: 'El jugador no existe' });
    const estadistica = await EstadisticaPartido.create(req.body);
    res.status(201).json(estadistica);
  } catch (err) { manejarError(res, err); }
});

// Listar (filtros opcionales ?partidoId=...&jugadorId=...)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.partidoId) filtro.partidoId = req.query.partidoId;
    if (req.query.jugadorId) filtro.jugadorId = req.query.jugadorId;
    const lista = await EstadisticaPartido.find(filtro)
      .populate('jugadorId', 'nombre apellido numeroCamiseta')
      .populate('partidoId', 'fecha rival')
      .sort({ createdAt: -1 });
    res.status(200).json(lista);
  } catch (err) { manejarError(res, err); }
});

// Eliminar registro
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const e = await EstadisticaPartido.findByIdAndDelete(req.params.id);
    if (!e) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.status(200).json({ mensaje: 'Registro eliminado' });
  } catch (err) { manejarError(res, err); }
});

export default router;