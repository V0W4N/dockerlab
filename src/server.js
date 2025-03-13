const express = require('express');
const cors = require('cors');
const os = require('os');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// The calculation service URL (using Docker service name)
const CALC_SERVICE_URL = process.env.CALC_SERVICE_URL || 'http://calc-service:3001';

// Added timestamp to show update
console.log('Server starting at:', new Date().toISOString());
console.log('Calculation service URL:', CALC_SERVICE_URL);

app.use(cors());
app.use(express.json());

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

// New endpoint that uses calculation service
app.post('/process-numbers', async (req, res) => {
    try {
        const { numbers } = req.body;
        
        // Call calculation service
        const calcResponse = await axios.post(`${CALC_SERVICE_URL}/calculate`, {
            numbers
        });

        // Add some metadata to the response
        const result = {
            ...calcResponse.data,
            processed_by: os.hostname(),
            timestamp: new Date().toISOString(),
            calc_service_url: CALC_SERVICE_URL
        };

        res.json(result);
    } catch (error) {
        console.error('Error calling calculation service:', error.message);
        res.status(500).json({
            error: 'Failed to process calculation',
            details: error.message,
            calc_service_url: CALC_SERVICE_URL
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Docker network test server is running! (Updated)',
        serverHostname: os.hostname(),
        networkInterfaces: getNetworkInfo(),
        clientIP: req.ip,
        headers: req.headers
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API service running on port ${PORT}`);
    console.log('Network interfaces:', JSON.stringify(getNetworkInfo(), null, 2));
});