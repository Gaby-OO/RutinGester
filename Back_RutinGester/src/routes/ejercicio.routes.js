import express from 'express';
import {
  crearEjercicio,
  listarEjercicios,
  obtenerEjercicio,
  actualizarEjercicio,
  eliminarEjercicio
} from '../controllers/ejercicio.controller.js';

const router = express.Router();

router.post('/', crearEjercicio);
router.get('/', listarEjercicios);
router.get('/:id', obtenerEjercicio);
router.put('/:id', actualizarEjercicio);
router.delete('/:id', eliminarEjercicio);

// Endpoint espejo: asociar ejercicio a rutina (por conveniencia)
// La función 'asociarARutina' no existe en el controlador. Se comenta para evitar el crash.
// La funcionalidad principal para esto ya está en rutina.routes.js
// router.post('/:ejercicioId/rutinas', asociarARutina);

export default router;
