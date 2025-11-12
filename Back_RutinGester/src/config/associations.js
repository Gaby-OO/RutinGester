
import { Rutina } from '../models/rutina.js';
import { Ejercicio } from '../models/ejercicio.js';
import { RutinaEjercicio } from '../models/rutinaEjercicio.js';

// Asociación Rutina <-> Ejercicios (many-to-many con metadata)
Rutina.belongsToMany(Ejercicio, { 
    through: RutinaEjercicio,
    foreignKey: 'rutinaId'
});

Ejercicio.belongsToMany(Rutina, {
    through: RutinaEjercicio,
    foreignKey: 'ejercicioId'
});
