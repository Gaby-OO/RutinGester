import express from 'express';
import {
  crearRutina,
  listarRutinas,
  obtenerRutina,
  actualizarRutina,
  eliminarRutina
} from '../controllers/rutina.controller.js';

const router = express.Router();

router.post('/', crearRutina);
router.get('/', listarRutinas);
router.get('/:id', obtenerRutina);
router.put('/:id', actualizarRutina);
router.delete('/:id', eliminarRutina);

export default router;
