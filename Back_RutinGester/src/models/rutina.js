import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Profesor } from './profesor.js';
import { Cliente } from './cliente.js';

export const Rutina = sequelize.define('Rutina', {
  id_rutina: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  precio: { type: DataTypes.FLOAT, allowNull: false },
});

Profesor.hasMany(Rutina, { foreignKey: 'profesorId' });
Rutina.belongsTo(Profesor, { foreignKey: 'profesorId' });

Cliente.belongsToMany(Rutina, { through: 'ClienteRutina', foreignKey: 'clienteId' });
Rutina.belongsToMany(Cliente, { through: 'ClienteRutina', foreignKey: 'rutinaId' });
