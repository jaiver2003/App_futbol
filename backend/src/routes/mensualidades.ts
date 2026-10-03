import { Router } from 'express';
import Mensualidad from '../models/Mensualidad';

const router = Router();

// Obtener todas las mensualidades
router.get('/', async (req, res) => {
  try {
    const mensualidades = await Mensualidad.find().populate('jugadorId');
    res.json(mensualidades);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mensualidades' });
  }
});

// Crear mensualidad
router.post('/', async (req, res) => {
  try {
    const mensualidad = new Mensualidad(req.body);
    await mensualidad.save();
    res.status(201).json(mensualidad);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear mensualidad' });
  }
});

// Actualizar estado de mensualidad
router.put('/:id', async (req, res) => {
  try {
    const mensualidad = await Mensualidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(mensualidad);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar mensualidad' });
  }
});

export default router;