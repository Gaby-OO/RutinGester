import 'dotenv/config';
// Importamos el modelo y la instancia de sequelize
import { sequelize } from '../config/db.js';
import { Ejercicio } from '../models/ejercicio.js';

// Importamos la lista de ejercicios desde la copia local en el backend
import { EXERCISES } from '../constants/exercises.js';

async function seedDatabase() {
  try {
    console.log('Iniciando la siembra de datos de ejercicios...');

    // Sincronizar el modelo para asegurar que la tabla existe y tiene la columna 'slug'
    await Ejercicio.sync({ alter: true });

    // 1. Mapear los datos del frontend al formato del modelo del backend
    const ejerciciosParaCrear = EXERCISES.map(fe => ({
      slug: fe.id,
      nombre: fe.title,
      descripcion: fe.description,
      imagen: fe.imageUri,
      categoria: fe.group === 'abs' ? 'Fuerza' : // Mapeo simple, puedes ajustarlo
                 fe.group === 'chest' ? 'Fuerza' :
                 fe.group === 'biceps' ? 'Fuerza' :
                 fe.group === 'glutes' ? 'Fuerza' :
                 fe.group === 'quadriceps' ? 'Fuerza' :
                 fe.group === 'calves' ? 'Fuerza' : 'Fuerza',
    }));

    // 2. Usar bulkCreate para insertar todos los ejercicios de una vez
    // 'ignoreDuplicates: true' evita errores si intentas correr el script de nuevo
    await Ejercicio.bulkCreate(ejerciciosParaCrear, { ignoreDuplicates: true });

    console.log(`¡Éxito! Se han insertado o verificado ${ejerciciosParaCrear.length} ejercicios en la base de datos.`);

  } catch (error) {
    console.error('Error durante la siembra de datos:', error);
  } finally {
    // 3. Cerrar la conexión a la base de datos
    await sequelize.close();
    console.log('Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la función
seedDatabase();
