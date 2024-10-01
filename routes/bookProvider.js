import express from 'express';
import db from '../connection.js';

const router = express.Router();

router.post('/api/book', async (req, res) => {
    // Destructure the request body
    const { name, number, timestamp, provider_id } = req.body;

    // Validate the input data
    if (!name || !number || !timestamp || !provider_id) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Query to insert a new booking into the booking_logs table
        const result = await db.query(
            `INSERT INTO booking_logs (user_name, number_of_customers, booking_datetime, provider_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, number, timestamp, provider_id]
        );

        // Respond with the created booking details
        res.status(201).json({
            success: true,
            booking: result.rows[0], // Return the booking details
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Error creating booking' });
    }
});

export default router;