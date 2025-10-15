import { Profesor } from '../models/profesor.js';

export const crearProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.create(req.body);
    res.json(profesor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarProfesores = async (req, res) => {
  const profesores = await Profesor.findAll();
  res.json(profesores);
};

export const obtenerProfesor = async (req, res) => {
  const profesor = await Profesor.findByPk(req.params.id);
  if (!profesor) return res.status(404).json({ error: 'No encontrado' });
  res.json(profesor);
};

export const actualizarProfesor = async (req, res) => {
  const profesor = await Profesor.findByPk(req.params.id);
  if (!profesor) return res.status(404).json({ error: 'No encontrado' });
  await profesor.update(req.body);
  res.json(profesor);
};

export const eliminarProfesor = async (req, res) => {
  const profesor = await Profesor.findByPk(req.params.id);
  if (!profesor) return res.status(404).json({ error: 'No encontrado' });
  await profesor.destroy();
  res.json({ mensaje: 'Eliminado' });
};
