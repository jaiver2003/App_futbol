import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Jugador from '../models/Jugador';
import Categoria from '../models/Categoria';
import Mensualidad, { MESES } from '../models/Mensualidad';
import Asistencia from '../models/Asistencia';
import EstadisticaPartido from '../models/EstadisticaPartido';

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

const idInvalido = (id: unknown) => !mongoose.isValidObjectId(id);

// Regla de negocio: la edad del jugador debe estar dentro del rango de la categoría
function mensajeEdadFueraDeRango(edad: number, categoria: { nombre: string; edadMin: number; edadMax: number }) {
  if (edad < categoria.edadMin || edad > categoria.edadMax) {
    return `La categoría ${categoria.nombre} es de ${categoria.edadMin} a ${categoria.edadMax} años y el jugador tiene ${edad}`;
  }
  return null;
}

// 1. Registrar jugador
router.post('/', async (req: Request, res: Response) => {
  try {
    const datos = { ...req.body };
    if (datos.categoriaId === '' || datos.categoriaId === null) delete datos.categoriaId;

    if (datos.categoriaId !== undefined) {
      if (idInvalido(datos.categoriaId)) return res.status(400).json({ mensaje: 'categoriaId con formato inválido' });
      const categoria = await Categoria.findById(datos.categoriaId);
      if (!categoria) return res.status(404).json({ mensaje: 'La categoría no existe' });
      const problema = mensajeEdadFueraDeRango(Number(datos.edad), categoria);
      if (problema) return res.status(400).json({ mensaje: problema });
    }

    const jugador = await Jugador.create(datos);
    res.status(201).json(jugador);
  } catch (err) { manejarError(res, err); }
});

// 2 y 3. Listar jugadores (filtros opcionales ?posicion=Delantero&estado=activo&categoriaId=...)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtro: Record<string, any> = {};
    if (req.query.posicion) filtro.posicion = req.query.posicion;
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.categoriaId) filtro.categoriaId = req.query.categoriaId;
    const jugadores = await Jugador.find(filtro).populate('categoriaId', 'nombre').sort({ numeroCamiseta: 1 });
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
    const jugador = await Jugador.findById(req.params.id).populate('categoriaId', 'nombre');
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });
    res.status(200).json(jugador);
  } catch (err) { manejarError(res, err); }
});

// Perfil del alumno: ficha con pagos, asistencia y rendimiento
router.get('/:id/perfil', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });
    const jugador = await Jugador.findById(req.params.id).populate('categoriaId', 'nombre horario');
    if (!jugador) return res.status(404).json({ mensaje: 'Jugador no encontrado' });

    // Las tres consultas corren al mismo tiempo
    const [mensualidades, asistencias, estadisticas] = await Promise.all([
      Mensualidad.find({ jugadorId: jugador._id }).lean(),
      Asistencia.find({ jugadorId: jugador._id }).lean(),
      EstadisticaPartido.find({ jugadorId: jugador._id }).lean()
    ]);

    // Pagos: del más reciente al más antiguo
    mensualidades.sort((a, b) => b.anio - a.anio || MESES.indexOf(b.mes) - MESES.indexOf(a.mes));
    const totalPagado = mensualidades
      .filter(m => m.estado === 'pagado')
      .reduce((acc, m) => acc + m.valor, 0);
    const pendientes = mensualidades.filter(m => m.estado !== 'pagado').length;

    // Asistencia
    const presentes = asistencias.filter(a => a.presente).length;
    const totalAsistencias = asistencias.length;

    // Rendimiento
    const suma = (campo: 'goles' | 'asistencias' | 'amarillas' | 'rojas') =>
      estadisticas.reduce((acc, e) => acc + (e[campo] ?? 0), 0);

    res.status(200).json({
      jugador,
      pagos: { totalPagado, pendientes, historial: mensualidades.slice(0, 6) },
      asistencia: {
        total: totalAsistencias,
        presentes,
        ausentes: totalAsistencias - presentes,
        porcentaje: totalAsistencias ? Math.round((presentes / totalAsistencias) * 100) : null
      },
      estadisticas: {
        partidos: estadisticas.length,
        goles: suma('goles'),
        asistencias: suma('asistencias'),
        amarillas: suma('amarillas'),
        rojas: suma('rojas')
      }
    });
  } catch (err) { manejarError(res, err); }
});

// 4. Actualizar jugador
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (idInvalido(req.params.id)) return res.status(400).json({ mensaje: 'ID con formato inválido' });

    const actual = await Jugador.findById(req.params.id);
    if (!actual) return res.status(404).json({ mensaje: 'Jugador no encontrado' });

    const { nombre, apellido, edad, posicion, numeroCamiseta, telefono, estado, categoriaId } = req.body;
    const cambios: Record<string, any> = { nombre, apellido, posicion, telefono };
    if (edad !== undefined && edad !== '') cambios.edad = Number(edad);
    if (numeroCamiseta !== undefined && numeroCamiseta !== '') cambios.numeroCamiseta = Number(numeroCamiseta);
    if (estado) cambios.estado = String(estado).toLowerCase();

    // quita los campos que no llegaron
    Object.keys(cambios).forEach(k => cambios[k] === undefined && delete cambios[k]);

    const operacion: Record<string, any> = { $set: cambios };

    // Categoría final del jugador después del cambio (null = sin categoría)
    let categoriaFinal: any = actual.categoriaId ?? null;
    if (categoriaId === '' || categoriaId === null) {
      operacion.$unset = { categoriaId: 1 };
      categoriaFinal = null;
    } else if (categoriaId !== undefined) {
      if (idInvalido(categoriaId)) return res.status(400).json({ mensaje: 'categoriaId con formato inválido' });
      cambios.categoriaId = categoriaId;
      categoriaFinal = categoriaId;
    }

    if (categoriaFinal) {
      const categoria = await Categoria.findById(categoriaFinal);
      if (!categoria) return res.status(404).json({ mensaje: 'La categoría no existe' });
      const problema = mensajeEdadFueraDeRango(cambios.edad ?? actual.edad, categoria);
      if (problema) return res.status(400).json({ mensaje: problema });
    }

    const jugador = await Jugador.findByIdAndUpdate(req.params.id, operacion, { new: true, runValidators: true });
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