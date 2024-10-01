import express from 'express';
import db from '../connection.js';

const router = express.Router();

// Route to add provider details
router.post('/api/add-provider-details', async (req, res) => {
    // Destructure the request body
    const { location, latitude, longitude, about, category } = req.body;
    const { user_id } = req.cookies

    // Validate the input data
    if (!user_id || !location || !latitude || !longitude || !category) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate latitude and longitude types
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ success: false, message: 'Latitude and longitude must be numbers' });
    }

    try {
        // Query to insert new provider details into the provider_details table
        const result = await db.query(
            `INSERT INTO provider_details (user_id, location, latitude, longitude, about, category)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id, location, latitude, longitude, about, category]
        );

        // Respond with the created provider details
        res.status(201).json({
            success: true,
            providerDetails: result.rows[0], // Return the provider details
        });
    } catch (error) {
        console.error('Error adding provider details:', error);
        res.status(500).json({ success: false, message: 'Error adding provider details' });
    }
});

export default router;