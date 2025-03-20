const express = require('express');
const cors = require('cors');
const os = require('os');
const { Todo, initializeDatabase, testConnection } = require('./config/db');

const app = express();
const PORT = process.env.TODO_SERVICE_PORT || 3002;

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

// Get all todos
app.get('/todos', async (req, res) => {
    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            const todos = await Todo.findAll({
                order: [['created_at', 'DESC']]
            });
            return res.json(todos);
        } catch (error) {
            attempts++;
            console.error(`Todo fetch attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed'
                });
            }
            
            console.log(`Retrying todo fetch in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
});

// Create new todo
app.post('/todos', async (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            const todo = await Todo.create({
                title,
                description
            });
            
            return res.status(201).json(todo);
        } catch (error) {
            attempts++;
            console.error(`Todo creation attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed'
                });
            }
            
            console.log(`Retrying todo creation in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
});

// Update todo
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            const [updated] = await Todo.update(
                { title, description, completed },
                { where: { id } }
            );
            
            if (!updated) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            
            const todo = await Todo.findByPk(id);
            return res.json(todo);
        } catch (error) {
            attempts++;
            console.error(`Todo update attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed'
                });
            }
            
            console.log(`Retrying todo update in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
});

// Mark todo as complete/incomplete
app.patch('/todos/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed state must be a boolean' });
    }

    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            const todo = await Todo.findByPk(id);
            
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }

            const [updated] = await Todo.update(
                { completed },
                { where: { id } }
            );
            
            if (!updated) {
                return res.status(500).json({ error: 'Failed to update todo status' });
            }
            
            const updatedTodo = await Todo.findByPk(id);
            return res.json(updatedTodo);
        } catch (error) {
            attempts++;
            console.error(`Todo completion update attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed'
                });
            }
            
            console.log(`Retrying todo completion update in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
});

// Delete todo
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    let attempts = 0;
    const maxAttempts = 3;
    const delay = 3000;

    while (attempts < maxAttempts) {
        try {
            const deleted = await Todo.destroy({ where: { id } });
            
            if (!deleted) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            
            return res.status(204).send();
        } catch (error) {
            attempts++;
            console.error(`Todo deletion attempt ${attempts} failed:`, error.message);
            
            if (attempts === maxAttempts) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable',
                    details: 'Database connection failed'
                });
            }
            
            console.log(`Retrying todo deletion in ${delay/1000} seconds...`);
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
        service: 'todo',
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
    console.log(`Todo service running on port ${PORT}`);
    console.log('Network interfaces:', JSON.stringify(os.networkInterfaces(), null, 2));
}); 