import { Rutina } from '../models/rutina.js';
import { Ejercicio } from '../models/ejercicio.js';

export const crearRutina = async (req, res) => {
  try {
    const payload = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || null,
      imagen: req.body.imagen || null,
      auth0_user_id: req.auth.sub,
    };
    const rutina = await Rutina.create(payload);
    res.json(rutina);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarRutinas = async (req, res) => {
  const rutinas = await Rutina.findAll({
    include: [
      { model: Ejercicio, through: { attributes: ['orden', 'series', 'repeticiones', 'descanso_seg', 'notas'] } }
    ]
  });
  res.json(rutinas);
};

export const obtenerRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.id, {
    include: [
      { model: Ejercicio, through: { attributes: ['orden', 'series', 'repeticiones', 'descanso_seg', 'notas'] } }
    ]
  });
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  res.json(rutina);
};

export const actualizarRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  // evitar actualizar campos no permitidos
  const updates = {};
  if (req.body.nombre !== undefined) updates.nombre = req.body.nombre;
  if (req.body.descripcion !== undefined) updates.descripcion = req.body.descripcion;
  if (req.body.imagen !== undefined) updates.imagen = req.body.imagen;
  await rutina.update(updates);
  res.json(rutina);
};

export const eliminarRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  await rutina.destroy();
  res.json({ mensaje: 'Eliminada' });
};

export const subirImagenRutina = async (req, res) => {
  try {
    const { id } = req.params;
    const rutina = await Rutina.findByPk(id);
    if (!rutina) return res.status(404).json({ error: 'No encontrada' });
    if (!req.file) return res.status(400).json({ error: 'Archivo no recibido' });
    // Guardar ruta relativa a /uploads
    const imagePath = `/uploads/${req.file.filename}`;
    await rutina.update({ imagen: imagePath });
    res.json({ mensaje: 'Imagen subida', imagen: imagePath, rutina });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const asociarEjercicio = async (req, res) => {
  try {
    const { rutinaId } = req.params;
    const { ejercicioId, orden, series, repeticiones, descanso_seg, notas } = req.body;
    const rutina = await Rutina.findByPk(rutinaId);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    // add association with through data
    await rutina.addEjercicio(ejercicioId, { through: { orden, series, repeticiones, descanso_seg, notas } });
    res.json({ mensaje: 'Asociado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const desasociarEjercicio = async (req, res) => {
  try {
    const { rutinaId, ejercicioId } = req.params;
    const rutina = await Rutina.findByPk(rutinaId);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    await rutina.removeEjercicio(ejercicioId);
    res.json({ mensaje: 'Desasociado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarEjerciciosDeRutina = async (req, res) => {
  const rutina = await Rutina.findByPk(req.params.rutinaId, {
    include: [{ model: Ejercicio }],
  });
  if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
  res.json(rutina);
};
