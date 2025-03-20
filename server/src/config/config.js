require('dotenv').config();

module.exports = {
    // Database Configuration
    DB: {
        HOST: process.env.DB_HOST || 'mysql-db',
        USER: process.env.DB_USER || 'appuser',
        PASSWORD: process.env.DB_PASSWORD || 'apppassword',
        NAME: process.env.DB_NAME || 'appdb',
        PORT: process.env.DB_PORT || 3306,
        POOL: {
            MAX: parseInt(process.env.DB_POOL_MAX) || 10,
            MIN: parseInt(process.env.DB_POOL_MIN) || 0,
            ACQUIRE: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            IDLE: parseInt(process.env.DB_POOL_IDLE) || 10000
        }
    },

    // Service Ports
    PORT: parseInt(process.env.PORT) || 3000,
    CALC_SERVICE_PORT: parseInt(process.env.CALC_SERVICE_PORT) || 3001,
    TODO_SERVICE_PORT: parseInt(process.env.TODO_SERVICE_PORT) || 3002,

    // Service URLs
    CALC_SERVICE_URL: process.env.CALC_SERVICE_URL || 'http://calc-service:3001',
    TODO_SERVICE_URL: process.env.TODO_SERVICE_URL || 'http://todo-service:3002',

    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development'
}; 