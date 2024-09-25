// file: swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Cấu hình Swagger
const setupSwagger = (app, port) => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CRUD API với Node.js và JSON Files',
        version: '1.0.0',
        description: 'API đơn giản để quản lý dữ liệu JSON với folder riêng cho mỗi key.'
      },
      servers: [
        {
          url: `http://localhost:${port}`
        }
      ]
    },
    apis: ['./server.js'], // Đường dẫn tới file chứa các tài liệu API
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
