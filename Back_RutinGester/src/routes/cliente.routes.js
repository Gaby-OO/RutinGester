import express from 'express';
import {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
  inscribirseEnRutina
} from '../controllers/cliente.controller.js';

const router = express.Router();

router.post('/', crearCliente);
router.get('/', listarClientes);
router.get('/:id', obtenerCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);
router.post('/inscribirse', inscribirseEnRutina);

export default router;
