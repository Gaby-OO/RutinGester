import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RutinGester API',
      version: '1.0.0',
      description: 'API para el backend de RutinGester',
    },
    // Seguridad global para que Swagger UI muestre el botón "Authorize" (Bearer JWT)
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js', './src/docs/*.js'],
};

const specs = swaggerJsdoc(options);
export default specs;
