import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const RutinaEjercicio = sequelize.define('RutinaEjercicio', {
  orden: { type: DataTypes.INTEGER, allowNull: true },
  series: { type: DataTypes.INTEGER, allowNull: true },
  repeticiones: { type: DataTypes.INTEGER, allowNull: true },
  descanso_seg: { type: DataTypes.INTEGER, allowNull: true },
  notas: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: false });

export default RutinaEjercicio;
