import express from 'express';
import {
  crearProfesor,
  listarProfesores,
  obtenerProfesor,
  actualizarProfesor,
  eliminarProfesor
} from '../controllers/profesor.controller.js';

const router = express.Router();

router.post('/', crearProfesor);
router.get('/', listarProfesores);
router.get('/:id', obtenerProfesor);
router.put('/:id', actualizarProfesor);
router.delete('/:id', eliminarProfesor);

export default router;
