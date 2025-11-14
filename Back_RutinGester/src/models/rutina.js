import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Rutina = sequelize.define('Rutina', {
  id_rutina: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  imagen: { type: DataTypes.STRING, allowNull: true },
  auth0_user_id: { type: DataTypes.STRING, allowNull: true },
});
