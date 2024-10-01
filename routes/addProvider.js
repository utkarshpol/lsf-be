import express from 'express';
import db from '../connection.js';

const router = express.Router();

// Route to add a new provider
router.post('/api/add-provider', async (req, res) => {
    // Destructure the request body
    const { name, email, password } = req.body;

    // Validate the input data
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Query to insert a new provider into the service_providers table
        const result = await db.query(
            `INSERT INTO service_providers (name, email, password)
             VALUES ($1, $2, $3) RETURNING *`,
            [name, email, password] // Use the already hashed password
        );

        // Respond with the created provider details
        res.status(201).json({
            success: true,
            provider: result.rows[0], // Return the provider details
        });
    } catch (error) {
        console.error('Error adding provider:', error);
        
        // Handle specific error scenarios
        if (error.code === '23505') { // Unique violation error code for PostgreSQL
            return res.status(409).json({ success: false, message: 'Provider with this email already exists' });
        }

        res.status(500).json({ success: false, message: 'Error adding provider' });
    }
});

export default router;