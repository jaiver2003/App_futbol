import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Asistencia from '../models/Asistencia';
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
    return res.status(409).json({ mensaje: 'Ya existe un registro de asistencia de ese jugador para esa fecha' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

// Registrar asistencia
router.post('/', async (req: Request, res: Response) => {
  try {
    const { jugadorId } = req.body;
    if (!jugadorId || idInvalido(jugadorId)) {
      return res.status(400).json({ mensaje: 'jugadorId es obligatorio y debe tener formato válido' });
    }
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) return res.status(404).json({ mensaje: 'El jugador no existe' });
    if (jugador.estado === 'inactivo') {
      return res.status(400).json({ mensaje: 'No se puede registrar asistencia a un jugador inactivo' });
    }
    const asistencia = await Asistencia.create(req.body);
    res.status(201).json(asistencia);
  } catch (err) { manejarError(res, err); }
});

// Listar asistencias (filtros opcionales ?fecha=2026-11-10&presente=true)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.fecha) filtro.fecha = new Date(String(req.query.fecha));
    if (req.query.presente !== undefined) filtro.presente = req.query.presente === 'true';
    const asistencias = await Asistencia.find(filtro)
      .populate('jugadorId', 'nombre apellido numeroCamiseta')
      .sort({ fecha: -1 });
    res.status(200).json(asistencias);
  } catch (err) { manejarError(res, err); }
});

// Historial y porcentaje de asistencia de un jugador
router.get('/jugador/:jugadorId', async (req: Request, res: Response) => {
  try {
    const { jugadorId } = req.params;
    if (idInvalido(jugadorId)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });

    const historial = await Asistencia.find({ jugadorId }).sort({ fecha: -1 });
    const presentes = historial.filter((a) => a.presente).length;
    const porcentaje = historial.length ? Math.round((presentes / historial.length) * 100) : 0;

    res.status(200).json({
      jugador: `${jugador.nombre} ${jugador.apellido}`,
      totalRegistros: historial.length,
      presentes,
      ausentes: historial.length - presentes,
      porcentajeAsistencia: porcentaje,
      historial
    });
  } catch (err) { manejarError(res, err); }
});

// Obtener un registro
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const asistencia = await Asistencia.findById(req.params.id).populate('jugadorId', 'nombre apellido numeroCamiseta');
    if (!asistencia) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.status(200).json(asistencia);
  } catch (err) { manejarError(res, err); }
});

// Actualizar registro (por ejemplo, corregir presente u observación)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const { presente, observacion, fecha } = req.body;
    const cambios: Record<string, any> = { presente, observacion, fecha };
    Object.keys(cambios).forEach((k) => cambios[k] === undefined && delete cambios[k]);
    const asistencia = await Asistencia.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });
    if (!asistencia) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.status(200).json(asistencia);
  } catch (err) { manejarError(res, err); }
});

// Eliminar registro
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const asistencia = await Asistencia.findByIdAndDelete(req.params.id);
    if (!asistencia) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.status(200).json({ mensaje: 'Registro eliminado' });
  } catch (err) { manejarError(res, err); }
});

export default router;