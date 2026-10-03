import { Router } from 'express';
import Jugador from '../models/Jugador';

const router = Router();

// Obtener todos los jugadores
router.get('/', async (req, res) => {
  try {
    const jugadores = await Jugador.find();
    res.json(jugadores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener jugadores' });
  }
});

// Crear jugador
router.post('/', async (req, res) => {
  try {
    const jugador = new Jugador(req.body);
    await jugador.save();
    res.status(201).json(jugador);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear jugador' });
  }
});

// Actualizar jugador
router.put('/:id', async (req, res) => {
  try {
    const jugador = await Jugador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(jugador);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar jugador' });
  }
});

// Eliminar jugador
router.delete('/:id', async (req, res) => {
  try {
    await Jugador.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Jugador eliminado' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar jugador' });
  }
});

export default router;