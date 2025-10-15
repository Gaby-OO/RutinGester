import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Profesor = sequelize.define('Profesor', {
  id_profesor: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  gmail: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});
