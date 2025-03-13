const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Docker network test server is running!',
        serverHostname: os.hostname(),
        networkInterfaces: getNetworkInfo(),
        clientIP: req.ip,
        headers: req.headers
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Network interfaces:', JSON.stringify(getNetworkInfo(), null, 2));
}); 