const express = require('express');
const cors = require('cors');
const os = require('os');
const axios = require('axios');
const config = require('./config/config');
const calculatorRoutes = require('./routes/calculator');
const todoRoutes = require('./routes/todo');
const retryRequest = require('./middleware/retry');

const app = express();

// Added timestamp to show update
console.log('Server starting at:', new Date().toISOString());
console.log('Calculation service URL:', config.CALC_SERVICE_URL);
console.log('Todo service URL:', config.TODO_SERVICE_URL);

// Get network interfaces
function getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const networkInfo = {};
    
    for (const [name, addrs] of Object.entries(interfaces)) {
        networkInfo[name] = addrs.map(addr => ({
            address: addr.address,
            family: addr.family,
            internal: addr.internal
        }));
    }
    
    return networkInfo;
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', calculatorRoutes);
app.use('/api', todoRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API Gateway is running!',
        serverHostname: os.hostname(),
        networkInterfaces: getNetworkInfo(),
        services: {
            calculation: config.CALC_SERVICE_URL,
            todo: config.TODO_SERVICE_URL
        }
    });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const [calcHealth, todoHealth] = await Promise.all([
            retryRequest(() => axios.get(`${config.CALC_SERVICE_URL}/health`)),
            retryRequest(() => axios.get(`${config.TODO_SERVICE_URL}/health`))
        ]);

        res.json({
            status: 'healthy',
            service: 'api-gateway',
            timestamp: new Date().toISOString(),
            services: {
                calculation: calcHealth.data,
                todo: todoHealth.data
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'degraded',
            service: 'api-gateway',
            timestamp: new Date().toISOString(),
            error: 'One or more services are unavailable'
        });
    }
});

// Start server
app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${config.PORT}`);
    console.log('Network interfaces:', JSON.stringify(getNetworkInfo(), null, 2));
});