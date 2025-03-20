const express = require('express');
const router = express.Router();
const axios = require('axios');
const retryRequest = require('../middleware/retry');
const config = require('../config/config');

router.post('/calculate', async (req, res) => {
    try {
        const { numbers } = req.body;
        
        const calcResponse = await retryRequest(() => 
            axios.post(`${config.CALC_SERVICE_URL}/calculate`, { numbers })
        );

        const result = {
            ...calcResponse.data,
            processed_by: process.env.HOSTNAME || 'unknown',
            timestamp: new Date().toISOString(),
            calc_service_url: config.CALC_SERVICE_URL
        };

        res.json(result);
    } catch (error) {
        console.error('Error calling calculation service:', error.message);
        res.status(500).json({
            error: 'Failed to process calculation',
            details: error.message,
            calc_service_url: config.CALC_SERVICE_URL
        });
    }
});

module.exports = router; 