import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Partido from '../models/Partido';
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

// Un partido "jugado" debe traer el marcador completo
function marcadorFaltante(datos: any): boolean {
  return datos.estado === 'jugado' &&
    (datos.golesFavor === undefined || datos.golesFavor === null ||
     datos.golesContra === undefined || datos.golesContra === null);
}

// Registrar partido
router.post('/', async (req: Request, res: Response) => {
  try {
    const { categoriaId } = req.body;
    if (!categoriaId || idInvalido(categoriaId)) {
      return res.status(400).json({ mensaje: 'categoriaId es obligatorio y debe tener formato válido' });
    }
    const categoria = await Categoria.findById(categoriaId);
    if (!categoria) return res.status(404).json({ mensaje: 'La categoría no existe' });
    if (marcadorFaltante(req.body)) {
      return res.status(400).json({ mensaje: 'Un partido jugado debe incluir golesFavor y golesContra' });
    }
    const partido = await Partido.create(req.body);
    res.status(201).json(partido);
  } catch (err) { manejarError(res, err); }
});

// Listar partidos (filtros opcionales ?estado=jugado&categoriaId=...)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.categoriaId) filtro.categoriaId = req.query.categoriaId;
    const partidos = await Partido.find(filtro)
      .populate('categoriaId', 'nombre')
      .sort({ fecha: -1 });
    res.status(200).json(partidos);
  } catch (err) { manejarError(res, err); }
});

// Obtener un partido
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const partido = await Partido.findById(req.params.id).populate('categoriaId', 'nombre');
    if (!partido) return res.status(404).json({ mensaje: 'Partido no encontrado' });
    res.status(200).json(partido);
  } catch (err) { manejarError(res, err); }
});

// Actualizar partido (por ejemplo, registrar el resultado)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    if (req.body.categoriaId !== undefined) {
      if (idInvalido(req.body.categoriaId)) {
        return res.status(400).json({ mensaje: 'categoriaId con formato inválido' });
      }
      const categoria = await Categoria.findById(req.body.categoriaId);
      if (!categoria) return res.status(404).json({ mensaje: 'La categoría no existe' });
    }
    const actual = await Partido.findById(req.params.id);
    if (!actual) return res.status(404).json({ mensaje: 'Partido no encontrado' });

    const resultado = { ...actual.toObject(), ...req.body };
    if (marcadorFaltante(resultado)) {
      return res.status(400).json({ mensaje: 'Un partido jugado debe incluir golesFavor y golesContra' });
    }
    const partido = await Partido.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(partido);
  } catch (err) { manejarError(res, err); }
});

// Eliminar partido
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const partido = await Partido.findByIdAndDelete(req.params.id);
    if (!partido) return res.status(404).json({ mensaje: 'Partido no encontrado' });
    res.status(200).json({ mensaje: 'Partido eliminado' });
  } catch (err) { manejarError(res, err); }
});

export default router;