require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
});

// Define Todo model
const Todo = sequelize.define('Todo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define Calculation model
const Calculation = sequelize.define('Calculation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numbers: {
        type: DataTypes.JSON,
        allowNull: false
    },
    sum: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    average: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    max_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at'
});

// Initialize database with retry mechanism
async function initializeDatabase(retries = 5, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempting to connect to database (attempt ${attempt}/${retries})...`);
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
            
            // Sync all models
            await sequelize.sync();
            console.log('Database models synchronized successfully');
            
            return;
        } catch (error) {
            console.error(`Database connection attempt ${attempt} failed:`, error.message);
            if (attempt === retries) {
                throw new Error(`Failed to connect to database after ${retries} attempts`);
            }
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Test database connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error.message);
        return false;
    }
}

module.exports = {
    sequelize,
    Todo,
    Calculation,
    initializeDatabase,
    testConnection
}; 