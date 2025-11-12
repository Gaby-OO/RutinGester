import express from 'express';
import {
  crearRutina,
  listarRutinas,
  obtenerRutina,
  actualizarRutina,
  eliminarRutina
} from '../controllers/rutina.controller.js';

const router = express.Router();

/**
 * @openapi
 * /rutinas:
 *   get:
 *     summary: Obtener lista de rutinas
 *     responses:
 *       200:
 *         description: Lista de rutinas
 *   post:
 *     summary: Crear una rutina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rutina'
 *     responses:
 *       201:
 *         description: Rutina creada
 */
router.post('/', crearRutina);
router.get('/', listarRutinas);

/**
 * @openapi
 * /rutinas/{id}:
 *   get:
 *     summary: Obtener una rutina por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rutina encontrada
 */
router.get('/:id', obtenerRutina);
router.put('/:id', actualizarRutina);
router.delete('/:id', eliminarRutina);

import upload from '../middleware/upload.js';
import { subirImagenRutina, asociarEjercicio, desasociarEjercicio, listarEjerciciosDeRutina } from '../controllers/rutina.controller.js';

/**
 * @openapi
 * /rutinas/{id}/imagen:
 *   post:
 *     summary: Subir imagen para una rutina
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida
 */
router.post('/:id/imagen', upload.single('file'), subirImagenRutina);

/**
 * @openapi
 * /rutinas/{rutinaId}/ejercicios:
 *   post:
 *     summary: Asociar un ejercicio a una rutina con metadata
 *     parameters:
 *       - in: path
 *         name: rutinaId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ejercicioId:
 *                 type: integer
 *               orden:
 *                 type: integer
 *               series:
 *                 type: integer
 *               repeticiones:
 *                 type: integer
 *               descanso_seg:
 *                 type: integer
 *               notas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asociado
 */
router.post('/:rutinaId/ejercicios', asociarEjercicio);

/**
 * @openapi
 * /rutinas/{rutinaId}/ejercicios:
 *   get:
 *     summary: Listar ejercicios de una rutina (con metadata)
 *     parameters:
 *       - in: path
 *         name: rutinaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ejercicios
 */
router.get('/:rutinaId/ejercicios', listarEjerciciosDeRutina);

/**
 * @openapi
 * /rutinas/{rutinaId}/ejercicios/{ejercicioId}:
 *   delete:
 *     summary: Desasociar un ejercicio de una rutina
 *     parameters:
 *       - in: path
 *         name: rutinaId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: ejercicioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Desasociado
 */
router.delete('/:rutinaId/ejercicios/:ejercicioId', desasociarEjercicio);

export default router;
