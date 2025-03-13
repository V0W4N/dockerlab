const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Calculate service
app.post('/calculate', (req, res) => {
    const { numbers } = req.body;
    if (!Array.isArray(numbers)) {
        return res.status(400).json({ error: 'Please provide an array of numbers' });
    }

    const result = {
        sum: numbers.reduce((a, b) => a + b, 0),
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        max: Math.max(...numbers),
        min: Math.min(...numbers)
    };

    console.log(`Calculation performed: ${JSON.stringify(result)}`);
    res.json(result);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'calculation' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculation service running on port ${PORT}`);
});