import express from 'express';
import {
  crearEjercicio,
  listarEjercicios,
  obtenerEjercicio,
  actualizarEjercicio,
  eliminarEjercicio,
  asociarARutina
} from '../controllers/ejercicio.controller.js';

const router = express.Router();

router.post('/', crearEjercicio);
router.get('/', listarEjercicios);
router.get('/:id', obtenerEjercicio);
router.put('/:id', actualizarEjercicio);
router.delete('/:id', eliminarEjercicio);

// Endpoint espejo: asociar ejercicio a rutina (por conveniencia)
router.post('/:ejercicioId/rutinas', asociarARutina);

export default router;
