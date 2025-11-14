import { Rutina } from '../models/rutina.js';
import { Ejercicio } from '../models/ejercicio.js';
import { RutinaEjercicio } from '../models/rutinaEjercicio.js';

export const crearRutina = async (req, res) => {
  const { nombre, descripcion, ejercicios } = req.body;
  const auth0_user_id = req.auth?.sub || 'user_de_prueba';

  try {
    // 1. Crear la rutina
    const rutina = await Rutina.create({
      nombre,
      descripcion: descripcion || null,
      auth0_user_id,
    });

    // 2. Si hay ejercicios, buscarlos por slug y asociarlos por su PK numérico
    if (ejercicios && ejercicios.length > 0) {
      for (const ej of ejercicios) {
        const exercise = await Ejercicio.findOne({ where: { slug: ej.ejercicioId } });
        if (exercise) {
          await rutina.addEjercicio(exercise.id_ejercicio, {
            through: {
              series: ej.series,
              repeticiones: ej.repeticiones,
              descanso_seg: ej.descanso_seg,
            },
          });
        } else {
          console.warn(`Ejercicio con slug '${ej.ejercicioId}' no encontrado en la BD. No se asoció a la rutina.`);
        }
      }
    }

    // 3. Devolver la rutina completa con sus ejercicios recién asociados
    const rutinaCompleta = await Rutina.findByPk(rutina.id_rutina, {
      include: [
        {
          model: Ejercicio,
          through: { attributes: ['series', 'repeticiones', 'descanso_seg'] },
        },
      ],
    });

    res.status(201).json(rutinaCompleta);
  } catch (err) {
    console.error('Error al crear la rutina:', err);
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

  // DEBUG: Imprimir el objeto para ver su estructura
  console.log('Objeto Rutina a punto de ser enviado:', JSON.stringify(rutina, null, 2));

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
    const { ejercicioId: slug, orden, series, repeticiones, descanso_seg, notas } = req.body;

    const rutina = await Rutina.findByPk(rutinaId);
    if (!rutina) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    const ejercicio = await Ejercicio.findOne({ where: { slug } });
    if (!ejercicio) {
      return res.status(404).json({ error: `Ejercicio con slug '${slug}' no encontrado` });
    }

    const association = await RutinaEjercicio.findOne({
      where: {
        rutinaId: rutina.id_rutina,
        ejercicioId: ejercicio.id_ejercicio,
      },
    });

    const throughData = { orden, series, repeticiones, descanso_seg, notas };

    if (association) {
      await association.update(throughData);
    } else {
      await rutina.addEjercicio(ejercicio, { through: throughData });
    }

    res.json({ mensaje: 'Asociación actualizada/creada' });
  } catch (err) {
    console.error('Error al asociar/actualizar ejercicio:', err);
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
