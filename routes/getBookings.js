import express from 'express';
import db from '../connection.js';

const router = express.Router();

// Route to check bookings for a specific provider
router.get('/api/check-bookings/:providerId', async (req, res) => {
    const providerId = parseInt(req.params.providerId, 10); // Get provider ID from request parameters

    // Validate provider ID
    if (isNaN(providerId)) {
        return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }

    try {
        // Query to fetch bookings for the specified provider where isDone is false
        const result = await db.query(
            `SELECT * FROM booking_logs
             WHERE provider_id = $1 AND is_done = false`,
            [providerId]
        );

        // Check if there are any bookings
        if (result.rows.length === 0) {
            return res.status(404).json({ success: true, message: 'No pending bookings found for this provider' });
        }

        // Respond with the list of bookings
        res.status(200).json({
            success: true,
            bookings: result.rows, // Return the bookings for the provider
        });
    } catch (error) {
        console.error('Error checking bookings:', error);
        res.status(500).json({ success: false, message: 'Error checking bookings' });
    }
});

export default router;