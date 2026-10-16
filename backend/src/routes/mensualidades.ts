import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Mensualidad, { MESES } from '../models/Mensualidad';
import Jugador from '../models/Jugador';

const router = Router();
const LISTA_MESES = MESES as readonly string[];

function manejarError(res: Response, err: any): void {
  if (err instanceof mongoose.Error.ValidationError) {
    const detalles = Object.values(err.errors).map((e: any) => ({ campo: e.path, mensaje: e.message }));
    res.status(400).json({ mensaje: 'Datos inválidos', errores: detalles });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ mensaje: `Valor inválido para el campo '${err.path}'` });
    return;
  }
  if (err?.code === 11000) {
    res.status(409).json({ mensaje: 'Ya existe una mensualidad de ese jugador para ese mes y año' });
    return;
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const normalizarMes = (m: unknown): string => {
  const s = String(m ?? '').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
};

function leerPeriodo(req: Request, res: Response) {
  const mes = normalizarMes(req.query.mes);
  const anioRaw = String(req.query.anio ?? '').trim();
  const anio = Number(anioRaw);
  if (!LISTA_MESES.includes(mes) || !anioRaw || !Number.isInteger(anio)) {
    res.status(400).json({ mensaje: "Debes enviar 'mes' (ej. Agosto) y 'anio' (ej. 2026) como parámetros de consulta" });
    return null;
  }
  return { mes, anio };
}

// Listar mensualidades (filtros opcionales ?mes=Agosto&anio=2026&estado=pagado)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.mes) filtro.mes = normalizarMes(req.query.mes);
    if (req.query.anio) filtro.anio = Number(req.query.anio);
    if (req.query.estado) filtro.estado = req.query.estado;
    // jugadorId llega como objeto { _id, nombre, apellido, telefono, numeroCamiseta }
    const mensualidades = await Mensualidad.find(filtro)
      .populate('jugadorId', 'nombre apellido telefono numeroCamiseta')
      .sort({ anio: -1, createdAt: -1 });
    res.status(200).json(mensualidades);
  } catch (err) { manejarError(res, err); }
});

// 7. Registrar mensualidad
router.post('/', async (req: Request, res: Response) => {
  try {
    const { jugadorId, mes, anio, valor, estado, fechaPago } = req.body;
    if (!mongoose.isValidObjectId(jugadorId)) {
      res.status(400).json({ mensaje: 'jugadorId con formato inválido' });
      return;
    }
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
      res.status(404).json({ mensaje: 'El jugador no existe' });
      return;
    }
    if (jugador.estado === 'inactivo') {
      res.status(400).json({ mensaje: 'No se puede registrar mensualidad a un jugador inactivo' });
      return;
    }
    const datos: any = { jugadorId, mes: normalizarMes(mes), anio, valor, estado };
    if (estado === 'pagado') datos.fechaPago = fechaPago || new Date();
    const mensualidad = await Mensualidad.create(datos);
    res.status(201).json(mensualidad);
  } catch (err) { manejarError(res, err); }
});

// 8. Historial de mensualidades de un jugador
router.get('/jugador/:jugadorId', async (req: Request, res: Response) => {
  try {
    const { jugadorId } = req.params;
    if (!mongoose.isValidObjectId(jugadorId)) {
      res.status(400).json({ mensaje: 'ID con formato inválido' });
      return;
    }
    const jugador = await Jugador.findById(jugadorId);
    if (!jugador) {
      res.status(404).json({ mensaje: 'Jugador no encontrado' });
      return;
    }
    const historial = (await Mensualidad.find({ jugadorId }).lean()).sort(
      (a, b) => b.anio - a.anio || LISTA_MESES.indexOf(b.mes) - LISTA_MESES.indexOf(a.mes)
    );
    res.status(200).json({
      jugador: `${jugador.nombre} ${jugador.apellido}`,
      totalRegistros: historial.length,
      historial
    });
  } catch (err) { manejarError(res, err); }
});

// 9. Jugadores en mora (activos sin mensualidad 'pagado' en el periodo; los 'parcial' cuentan como morosos)
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

export default router;