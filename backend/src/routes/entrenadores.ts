import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Entrenador from '../models/Entrenador';
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
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

// Verifica que la categoría enviada exista (si se envió una)
async function categoriaValida(categoriaId: any, res: Response): Promise<boolean> {
  if (categoriaId === undefined || categoriaId === null || categoriaId === '') return true;
  if (idInvalido(String(categoriaId))) {
    res.status(400).json({ mensaje: 'categoriaId con formato inválido' });
    return false;
  }
  const existe = await Categoria.findById(categoriaId);
  if (!existe) {
    res.status(404).json({ mensaje: 'La categoría no existe' });
    return false;
  }
  return true;
}

// Registrar entrenador
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!(await categoriaValida(req.body.categoriaId, res))) return;
    const datos = { ...req.body };
    if (datos.categoriaId === '') delete datos.categoriaId;
    const entrenador = await Entrenador.create(datos);
    res.status(201).json(entrenador);
  } catch (err) { manejarError(res, err); }
});

// Listar entrenadores (filtros opcionales ?estado=activo&categoriaId=...)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.categoriaId) filtro.categoriaId = req.query.categoriaId;
    const entrenadores = await Entrenador.find(filtro)
      .populate('categoriaId', 'nombre horario')
      .sort({ apellido: 1 });
    res.status(200).json(entrenadores);
  } catch (err) { manejarError(res, err); }
});

// Obtener un entrenador
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const entrenador = await Entrenador.findById(req.params.id).populate('categoriaId', 'nombre horario');
    if (!entrenador) return res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    res.status(200).json(entrenador);
  } catch (err) { manejarError(res, err); }
});

// Actualizar entrenador
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    if (!(await categoriaValida(req.body.categoriaId, res))) return;
    const cambios = { ...req.body };
    if (cambios.categoriaId === '') cambios.categoriaId = null;
    const entrenador = await Entrenador.findByIdAndUpdate(req.params.id, cambios, { new: true, runValidators: true });
    if (!entrenador) return res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    res.status(200).json(entrenador);
  } catch (err) { manejarError(res, err); }
});

// Eliminar entrenador
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const entrenador = await Entrenador.findByIdAndDelete(req.params.id);
    if (!entrenador) return res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    res.status(200).json({ mensaje: 'Entrenador eliminado' });
  } catch (err) { manejarError(res, err); }
});

export default router;