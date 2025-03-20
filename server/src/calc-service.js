const express = require('express');
const cors = require('cors');
const os = require('os');
const { sequelize, Calculation, initializeDatabase, testConnection } = require('./config/db');

const app = express();
const PORT = process.env.CALC_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup with retries
initializeDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Calculate service with database retry
app.post('/calculate', async (req, res) => {
    console.log('Received calculate request:', req.body);
    const { numbers } = req.body;
    if (!Array.isArray(numbers)) {
        console.log('Invalid input:', req.body);
        return res.status(400).json({ error: 'Please provide an array of numbers' });
    }

    const result = {
        numbers: numbers,
        sum: numbers.reduce((a, b) => a + b, 0),
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        max: Math.max(...numbers),
        min: Math.min(...numbers)
    };

    // Try to store in database with retries
    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            await Calculation.create({
                numbers: numbers,
                sum: result.sum,
                average: result.average,
                max_value: result.max,
                min_value: result.min
            });
            console.log(`Calculation performed and stored: ${JSON.stringify(result)}`);
            return res.json(result);
        } catch (error) {
            attempts++;
            console.error(`Database storage attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                console.error('Failed to store calculation after all attempts');
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed',
                    calculation: result // Still return the calculation even if storage failed
                });
            }
            
            console.log(`Retrying database storage in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
});

// Get calculation history with retry
app.get('/history', async (req, res) => {
    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            const calculations = await Calculation.findAll({
                order: [['created_at', 'DESC']]
            });
            return res.json(calculations);
        } catch (error) {
            attempts++;
            console.error(`History fetch attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed'
                });
            }
            
            console.log(`Retrying history fetch in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
});

// Health check with database status
app.get('/health', async (req, res) => {
    const networkInfo = Object.entries(os.networkInterfaces())
        .reduce((acc, [name, interfaces]) => {
            acc[name] = interfaces.map(int => ({
                address: int.address,
                family: int.family
            }));
            return acc;
        }, {});

    const dbStatus = await testConnection();

    const health = {
        status: dbStatus ? 'healthy' : 'degraded',
        service: 'calculation',
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
        network: networkInfo,
        database: {
            status: dbStatus ? 'connected' : 'disconnected'
        }
    };
    
    console.log('Health check response:', health);
    res.json(health);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculation service running on port ${PORT}`);
    console.log('Network interfaces:', JSON.stringify(os.networkInterfaces(), null, 2));
});