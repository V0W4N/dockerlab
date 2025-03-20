const express = require('express');
const router = express.Router();
const axios = require('axios');
const retryRequest = require('../middleware/retry');
const config = require('../config/config');

router.get('/todos', async (req, res) => {
    try {
        const response = await retryRequest(() => 
            axios.get(`${config.TODO_SERVICE_URL}/todos`)
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching todos:', error.message);
        res.status(500).json({
            error: 'Failed to fetch todos',
            details: error.message
        });
    }
});

router.post('/todos', async (req, res) => {
    try {
        const response = await retryRequest(() => 
            axios.post(`${config.TODO_SERVICE_URL}/todos`, req.body)
        );
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating todo:', error.message);
        res.status(500).json({
            error: 'Failed to create todo',
            details: error.message
        });
    }
});

router.put('/todos/:id', async (req, res) => {
    try {
        const response = await retryRequest(() => 
            axios.put(`${config.TODO_SERVICE_URL}/todos/${req.params.id}`, req.body)
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error updating todo:', error.message);
        res.status(500).json({
            error: 'Failed to update todo',
            details: error.message
        });
    }
});

router.patch('/todos/:id/complete', async (req, res) => {
    try {
        const response = await retryRequest(() => 
            axios.patch(`${config.TODO_SERVICE_URL}/todos/${req.params.id}/complete`, req.body)
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error updating todo completion:', error.message);
        res.status(500).json({
            error: 'Failed to update todo completion',
            details: error.message
        });
    }
});

router.delete('/todos/:id', async (req, res) => {
    try {
        await retryRequest(() => 
            axios.delete(`${config.TODO_SERVICE_URL}/todos/${req.params.id}`)
        );
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting todo:', error.message);
        res.status(500).json({
            error: 'Failed to delete todo',
            details: error.message
        });
    }
});

module.exports = router; 