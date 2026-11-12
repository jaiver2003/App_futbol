import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Sede from '../models/Sede';
import Categoria from '../models/Categoria';

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
    return res.status(409).json({ mensaje: 'Ya existe una sede con ese nombre' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

// Registrar sede
router.post('/', async (req: Request, res: Response) => {
  try {
    const sede = await Sede.create(req.body);
    res.status(201).json(sede);
  } catch (err) { manejarError(res, err); }
});

// Listar sedes (filtro opcional ?estado=activa)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.estado) filtro.estado = req.query.estado;
    const sedes = await Sede.find(filtro).sort({ nombre: 1 });
    res.status(200).json(sedes);
  } catch (err) { manejarError(res, err); }
});

// Obtener una sede
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const sede = await Sede.findById(req.params.id);
    if (!sede) return res.status(404).json({ mensaje: 'Sede no encontrada' });
    res.status(200).json(sede);
  } catch (err) { manejarError(res, err); }
});

// Actualizar sede
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const sede = await Sede.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sede) return res.status(404).json({ mensaje: 'Sede no encontrada' });
    res.status(200).json(sede);
  } catch (err) { manejarError(res, err); }
});

// Eliminar sede
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
        const enUso = await Categoria.countDocuments({ sedeId: req.params.id });
    if (enUso > 0) {
      return res.status(400).json({ mensaje: `No se puede eliminar: ${enUso} categoría(s) entrenan en esta sede` });
    }
    const sede = await Sede.findByIdAndDelete(req.params.id);
    if (!sede) return res.status(404).json({ mensaje: 'Sede no encontrada' });
    res.status(200).json({ mensaje: 'Sede eliminada' });
  } catch (err) { manejarError(res, err); }
});

export default router;