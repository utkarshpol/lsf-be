import express from 'express';
import db from '../connection.js';

const router = express.Router();

// Route to update a provider's details based on userId
router.put('/api/update-provider-details/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10); // Get user ID from request parameters
    const { location, latitude, longitude, about, category } = req.body; // Destructure new provider details from request body

    // Validate user ID
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Validate input data
    if (!location || !latitude || !longitude || !about || !category) {
        return res.status(400).json({ success: false, message: 'All fields must be provided for update' });
    }

    try {
        // Execute the update query to update provider details
        const result = await db.query(
            `UPDATE provider_details
             SET location = $1,
                 latitude = $2,
                 longitude = $3,
                 about = $4,
                 category = $5
             WHERE provider_id = $6
             RETURNING *`,
            [location, latitude, longitude, about, category, userId]
        );

        // Check if any provider detail was updated
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Provider details not found' });
        }

        // Respond with the updated provider details
        res.status(200).json({
            success: true,
            providerDetails: result.rows[0], // Return the updated provider details
        });
    } catch (error) {
        console.error('Error updating provider details:', error);
        res.status(500).json({ success: false, message: 'Error updating provider details' });
    }
});

export default router;