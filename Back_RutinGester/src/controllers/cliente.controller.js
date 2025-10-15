import { Cliente } from '../models/cliente.js';
import { Rutina } from '../models/rutina.js';

export const crearCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarClientes = async (req, res) => {
  const clientes = await Cliente.findAll();
  res.json(clientes);
};

export const obtenerCliente = async (req, res) => {
  const cliente = await Cliente.findByPk(req.params.id, { include: Rutina });
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  res.json(cliente);
};

export const actualizarCliente = async (req, res) => {
  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  await cliente.update(req.body);
  res.json(cliente);
};

export const eliminarCliente = async (req, res) => {
  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  await cliente.destroy();
  res.json({ mensaje: 'Eliminado' });
};

export const inscribirseEnRutina = async (req, res) => {
  try {
    const { idCliente, idRutina } = req.body;
    const cliente = await Cliente.findByPk(idCliente);
    const rutina = await Rutina.findByPk(idRutina);
    if (!cliente || !rutina) return res.status(404).json({ error: 'Cliente o rutina no encontrada' });

    await cliente.addRutina(rutina);
    res.json({ mensaje: 'Cliente inscrito a la rutina correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
