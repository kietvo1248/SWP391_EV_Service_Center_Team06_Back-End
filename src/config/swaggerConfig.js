const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EV Service Center API',
      version: '1.0.0',
      description: 'API Documentation for the EV Service Center Management System',
    },
    servers: [
      {
        url: 'http://localhost:6969', 
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Đường dẫn tới các file chứa định nghĩa API (routes)
  apis: ['./interfaces/routes/*.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;