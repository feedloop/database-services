import { SwaggerOptions } from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Backend as a Service API',
    version: '1.0.0',
    description: 'API Documentation for BaaS Project',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
  },
};

const options: SwaggerOptions = {
  swaggerDefinition,
  apis: ['src/routes/*.ts'],
};

export default options;
