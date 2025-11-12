/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id_cliente:
 *           type: integer
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         gmail:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - nombre
 *         - apellido
 *         - gmail
 *         - password
 *     Profesor:
 *       type: object
 *       properties:
 *         id_profesor:
 *           type: integer
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         gmail:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - nombre
 *         - apellido
 *         - gmail
 *         - password
 *     Rutina:
 *       type: object
 *       properties:
 *         id_rutina:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la rutina
 *         imagen:
 *           type: string
 *           description: URL de la imagen representativa de la rutina
 *       required:
 *         - nombre
 *
 * security:
 *   - bearerAuth: []
 */
export default {};
