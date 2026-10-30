import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
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
    return res.status(409).json({ mensaje: 'Ya existe una categoría con ese nombre' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

const rangoInvalido = (min: any, max: any) =>
  min !== undefined && max !== undefined && Number(max) < Number(min);

// Registrar categoría
router.post('/', async (req: Request, res: Response) => {
  try {
    if (rangoInvalido(req.body.edadMin, req.body.edadMax)) {
      return res.status(400).json({ mensaje: 'La edad máxima no puede ser menor que la mínima' });
    }
    const categoria = await Categoria.create(req.body);
    res.status(201).json(categoria);
  } catch (err) { manejarError(res, err); }
});

// Listar categorías
router.get('/', async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.find().sort({ edadMin: 1 });
    res.status(200).json(categorias);
  } catch (err) { manejarError(res, err); }
});

// Obtener una categoría
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.status(200).json(categoria);
  } catch (err) { manejarError(res, err); }
});

// Actualizar categoría
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    if (rangoInvalido(req.body.edadMin, req.body.edadMax)) {
      return res.status(400).json({ mensaje: 'La edad máxima no puede ser menor que la mínima' });
    }
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.status(200).json(categoria);
  } catch (err) { manejarError(res, err); }
});

// Eliminar categoría
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.status(200).json({ mensaje: 'Categoría eliminada' });
  } catch (err) { manejarError(res, err); }
});

export default router;