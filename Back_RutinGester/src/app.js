import express from 'express';
import cors from 'cors';
import { sequelize } from './config/db.js';
import rutinaRoutes from './routes/rutina.routes.js';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import './config/associations.js';
import dotenv from 'dotenv';
import { checkJwt } from './middleware/auth.js';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';

// Definir relaciones
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Exponer JSON del spec en /api-docs.json para pruebas y verificaciones programáticas
app.get('/api-docs.json', (req, res) => res.json(specs));

// Rutas con autenticación (temporalmente desactivada para pruebas)
app.use('/rutinas', rutinaRoutes);
app.use('/ejercicios', ejercicioRoutes);
app.get('/privado', checkJwt, (req, res) => {
  res.json({ message: 'Acceso autorizado', user: req.auth });
});

// Sincronizar modelos con la base de datos
sequelize.sync({ alter: true })
  .then(() => console.log('DB sincronizada'))
  .catch(err => console.error('Error DB:', err));

app.get('/', (req, res) => res.send('Gestor de rutinas backend'));

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor corriendo en puerto', process.env.PORT || 3000);
});
