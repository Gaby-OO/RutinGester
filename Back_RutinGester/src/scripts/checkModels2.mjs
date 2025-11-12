// Cargar todos los modelos y luego mostrar los modelos registrados
import './src/models/index.js';
import { sequelize } from '../config/db.js';

(async ()=>{
  console.log('Registered models after importing index.js:', Object.keys(sequelize.models));
  for (const [name, model] of Object.entries(sequelize.models)){
    console.log(name, '->', model.getTableName && model.getTableName());
  }
  process.exit(0);
})();
