import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Ejercicio = sequelize.define('Ejercicio', {
  id_ejercicio: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  imagen: { type: DataTypes.STRING, allowNull: true },
  video_url: { type: DataTypes.STRING, allowNull: true },
  duracion_segundos: { type: DataTypes.INTEGER, allowNull: true },
  categoria: {
    type: DataTypes.ENUM('Cardio', 'Fuerza', 'Flexibilidad', 'Balance'),
    allowNull: false,
    defaultValue: 'Fuerza'
  }
});

export default Ejercicio;
