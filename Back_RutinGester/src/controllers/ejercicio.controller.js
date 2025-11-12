import { Ejercicio } from '../models/ejercicio.js';
import { Rutina } from '../models/rutina.js';

export const crearEjercicio = async (req, res) => {
  try {
    const ej = await Ejercicio.create(req.body);
    res.status(201).json(ej);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarEjercicios = async (req, res) => {
  const list = await Ejercicio.findAll();
  res.json(list);
};

export const obtenerEjercicio = async (req, res) => {
  const ej = await Ejercicio.findByPk(req.params.id);
  if (!ej) return res.status(404).json({ error: 'No encontrado' });
  res.json(ej);
};

export const actualizarEjercicio = async (req, res) => {
  const ej = await Ejercicio.findByPk(req.params.id);
  if (!ej) return res.status(404).json({ error: 'No encontrado' });
  await ej.update(req.body);
  res.json(ej);
};

export const eliminarEjercicio = async (req, res) => {
  const ej = await Ejercicio.findByPk(req.params.id);
  if (!ej) return res.status(404).json({ error: 'No encontrado' });
  await ej.destroy();
  res.json({ mensaje: 'Eliminado' });
};

