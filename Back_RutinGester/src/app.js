import express from 'express';
import cors from 'cors';
import { sequelize } from './config/db.js';
import { Profesor } from './models/profesor.js';
import { Cliente } from './models/cliente.js';
import { Rutina } from './models/rutina.js';
import clienteRoutes from './routes/cliente.routes.js';
import rutinaRoutes from './routes/rutina.routes.js';
import profesorRoutes from './routes/profesor.routes.js';


const app = express();
app.use(cors());
app.use(express.json());
app.use('/profesores', profesorRoutes);
app.use('/clientes', clienteRoutes);
app.use('/rutinas', rutinaRoutes);

sequelize.sync({ alter: true })
  .then(() => console.log('DB sincronizada'))
  .catch(err => console.error('Error DB:', err));

app.get('/', (req, res) => res.send('Gestor de rutinas backend'));

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor corriendo en puerto', process.env.PORT || 3000);
});
