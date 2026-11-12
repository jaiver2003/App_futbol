import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Clase, { DIAS } from '../models/Clase';
import Categoria from '../models/Categoria';
import Entrenador from '../models/Entrenador';
import Sede from '../models/Sede';

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

// "16:30" -> 990 (minutos desde la medianoche), para comparar horas fácilmente
const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

// Validaciones de negocio. Devuelve { codigo, mensaje } si algo falla, o null si todo está bien.
async function validarClase(datos: any, idExcluir?: string) {
  for (const campo of ['categoriaId', 'entrenadorId', 'sedeId']) {
    if (idInvalido(datos[campo])) return { codigo: 400, mensaje: `${campo} es obligatorio y debe tener formato válido` };
  }
  if (!DIAS.includes(datos.diaSemana)) return { codigo: 400, mensaje: 'Día inválido' };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(datos.horaInicio ?? '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(datos.horaFin ?? '')) {
    return { codigo: 400, mensaje: 'Las horas deben tener formato HH:MM (ej. 16:30)' };
  }
  if (aMinutos(datos.horaFin) <= aMinutos(datos.horaInicio)) {
    return { codigo: 400, mensaje: 'La hora de fin debe ser mayor que la hora de inicio' };
  }

  if (!(await Categoria.findById(datos.categoriaId))) return { codigo: 404, mensaje: 'La categoría no existe' };
  const entrenador = await Entrenador.findById(datos.entrenadorId);
  if (!entrenador) return { codigo: 404, mensaje: 'El entrenador no existe' };
  if (entrenador.estado === 'inactivo') return { codigo: 400, mensaje: 'El entrenador está inactivo' };
  const sede = await Sede.findById(datos.sedeId);
  if (!sede) return { codigo: 404, mensaje: 'La sede no existe' };
  if (sede.estado === 'inactiva') return { codigo: 400, mensaje: 'La sede está inactiva' };

  // Choques de horario: mismo día, misma sede o mismo entrenador, y horas que se cruzan
  const filtro: Record<string, any> = {
    diaSemana: datos.diaSemana,
    estado: 'activa',
    $or: [{ sedeId: datos.sedeId }, { entrenadorId: datos.entrenadorId }]
  };
  if (idExcluir) filtro._id = { $ne: idExcluir };
  const delDia = await Clase.find(filtro);
  const inicio = aMinutos(datos.horaInicio);
  const fin = aMinutos(datos.horaFin);
  for (const otra of delDia) {
    const seCruzan = inicio < aMinutos(otra.horaFin) && fin > aMinutos(otra.horaInicio);
    if (!seCruzan) continue;
    if (String(otra.sedeId) === String(datos.sedeId)) {
      return { codigo: 409, mensaje: `La sede ya tiene una clase de ${otra.horaInicio} a ${otra.horaFin} ese día` };
    }
    return { codigo: 409, mensaje: `El entrenador ya tiene una clase de ${otra.horaInicio} a ${otra.horaFin} ese día` };
  }
  return null;
}

const poblar = (consulta: any) =>
  consulta
    .populate('categoriaId', 'nombre')
    .populate('entrenadorId', 'nombre apellido')
    .populate('sedeId', 'nombre');

// Registrar clase
router.post('/', async (req: Request, res: Response) => {
  try {
    const problema = await validarClase(req.body);
    if (problema) return res.status(problema.codigo).json({ mensaje: problema.mensaje });
    const clase = await Clase.create(req.body);
    res.status(201).json(clase);
  } catch (err) { manejarError(res, err); }
});

// Listar clases (filtros opcionales ?categoriaId=...&sedeId=...&diaSemana=Lunes)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.categoriaId) filtro.categoriaId = req.query.categoriaId;
    if (req.query.sedeId) filtro.sedeId = req.query.sedeId;
    if (req.query.diaSemana) filtro.diaSemana = req.query.diaSemana;
    const clases = await poblar(Clase.find(filtro)).sort({ horaInicio: 1 });
    // Ordenadas por día de la semana y luego por hora
    clases.sort((a: any, b: any) => DIAS.indexOf(a.diaSemana) - DIAS.indexOf(b.diaSemana) || a.horaInicio.localeCompare(b.horaInicio));
    res.status(200).json(clases);
  } catch (err) { manejarError(res, err); }
});

// Obtener una clase
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const clase = await poblar(Clase.findById(req.params.id));
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    res.status(200).json(clase);
  } catch (err) { manejarError(res, err); }
});

// Actualizar clase
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const actual = await Clase.findById(req.params.id);
    if (!actual) return res.status(404).json({ mensaje: 'Clase no encontrada' });

    const resultado = { ...actual.toObject(), ...req.body };
    if (resultado.estado !== 'inactiva') {
      const problema = await validarClase(resultado, req.params.id);
      if (problema) return res.status(problema.codigo).json({ mensaje: problema.mensaje });
    }
    const clase = await Clase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(clase);
  } catch (err) { manejarError(res, err); }
});

// Eliminar clase
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const clase = await Clase.findByIdAndDelete(req.params.id);
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    res.status(200).json({ mensaje: 'Clase eliminada' });
  } catch (err) { manejarError(res, err); }
});

export default router;