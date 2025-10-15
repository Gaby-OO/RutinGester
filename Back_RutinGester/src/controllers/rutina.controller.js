import { Rutina } from '../models/rutina.js';
import { Profesor } from '../models/profesor.js';
import { Cliente } from '../models/cliente.js';

export const crearRutina = async (req, res) => {
  try {
    const rutina = await Rutina.create(req.body);
    res.json(rutina);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarRutinas = async (req, res) => {
  const rutinas = await Rutina.findAll({ include: [Profesor, Cliente] });
  res.json(rutinas);
};

export const obtenerRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.id, { include: [Profesor, Cliente] });
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  res.json(rutina);
};

export const actualizarRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  await rutina.update(req.body);
  res.json(rutina);
};

export const eliminarRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  await rutina.destroy();
  res.json({ mensaje: 'Eliminada' });
};
