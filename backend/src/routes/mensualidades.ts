import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Mensualidad, { MESES } from '../models/Mensualidad';
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
    return res.status(400).json({ mensaje: 'Ya existe una mensualidad de ese jugador para ese mes y año' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const normalizarMes = (m: string) => m ? m.charAt(0).toUpperCase() + m.slice(1).toLowerCase() : m;

function leerPeriodo(req: Request, res: Response) {
  const mes = normalizarMes(String(req.query.mes || ''));
  const anio = Number(req.query.anio);
  if (!MESES.includes(mes) || !Number.isInteger(anio)) {
    res.status(400).json({ mensaje: "Debes enviar 'mes' (ej. Agosto) y 'anio' (ej. 2026) como parámetros de consulta" });
    return null;
  }
  return { mes, anio };
}

// 7. Registrar mensualidad
router.post('/', async (req: Request, res: Response) => {
  try {
    const { jugadorId, mes, anio, valor, estado, fechaPago } = req.body;
    if (!mongoose.isValidObjectId(jugadorId)) {
      return res.status(400).json({ mensaje: 'jugadorId con formato inválido' });
    }
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) return res.status(404).json({ mensaje: 'El jugador no existe' });
    if (jugador.estado === 'inactivo') {
      return res.status(400).json({ mensaje: 'No se puede registrar mensualidad a un jugador inactivo' });
    }
    const datos: any = { jugadorId, mes: normalizarMes(mes), anio, valor, estado };
    if (estado === 'pagado') datos.fechaPago = fechaPago || new Date();
    const mensualidad = await Mensualidad.create(datos);
    res.status(201).json(mensualidad);
  } catch (err) { manejarError(res, err); }
});

// 9. Jugadores en mora
router.get('/morosos', async (req: Request, res: Response) => {
  try {
    const periodo = leerPeriodo(req, res);
    if (!periodo) return;
    const pagados = await Mensualidad.find({ ...periodo, estado: 'pagado' }).distinct('jugadorId');
    const morosos = await Jugador.find({ estado: 'activo', _id: { $nin: pagados } }).sort({ apellido: 1 });
    res.status(200).json({ ...periodo, totalMorosos: morosos.length, morosos });
  } catch (err) { manejarError(res, err); }
});

// 10. Resumen de recaudo
router.get('/resumen', async (req: Request, res: Response) => {
  try {
    const periodo = leerPeriodo(req, res);
    if (!periodo) return;
    const filas = await Mensualidad.aggregate([
      { $match: periodo },
      { $group: { _id: '$estado', cantidad: { $sum: 1 }, total: { $sum: '$valor' } } }
    ]);
    const porEstado: Record<string, { cantidad: number; total: number }> = {
      pagado: { cantidad: 0, total: 0 }, parcial: { cantidad: 0, total: 0 }, pendiente: { cantidad: 0, total: 0 }
    };
    filas.forEach(f => { porEstado[f._id] = { cantidad: f.cantidad, total: f.total }; });
    res.status(200).json({
      ...periodo,
      totalRecaudado: porEstado.pagado.total,
      totalPorCobrar: porEstado.pendiente.total + porEstado.parcial.total,
      porEstado
    });
  } catch (err) { manejarError(res, err); }
});

// 8. Historial de mensualidades de un jugador
router.get('/jugador/:jugadorId', async (req: Request, res: Response) => {
  try {
    const { jugadorId } = req.params;
    if (!mongoose.isValidObjectId(jugadorId)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    const historial = await Mensualidad.find({ jugadorId }).sort({ anio: -1, createdAt: -1 });
    res.status(200).json({
      jugador: `${jugador.nombre} ${jugador.apellido}`,
      totalRegistros: historial.length,
      historial
    });
  } catch (err) { manejarError(res, err); }
});

export default router;