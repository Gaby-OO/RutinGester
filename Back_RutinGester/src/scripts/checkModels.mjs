import { sequelize } from '../config/db.js';

(async ()=>{
  console.log('Registered models:', Object.keys(sequelize.models));
  // show model names and table names
  for (const [name, model] of Object.entries(sequelize.models)){
    console.log(name, '->', model.getTableName && model.getTableName());
  }
  process.exit(0);
})();
