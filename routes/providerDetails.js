import express from 'express';
import db from '../connection.js';

const router = express.Router();

router.get('/api/details/:id', async (req, res) => {
    const providerId = req.params.id; // Get the provider ID from the request parameters

    try {
        // Query to fetch service provider details based on the provider ID
        const result = await db.query(
            `SELECT sp.id, sp.name, sp.email, pd.location, pd.latitude, pd.longitude, pd.about, pd.category
             FROM service_providers sp
             JOIN provider_details pd ON sp.id = pd.provider_id
             WHERE sp.id = $1`,
            [providerId]
        );

        // Check if any provider was found
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        // Send the provider details in the response
        res.json({
            success: true,
            provider: result.rows[0] // Return the first (and only) provider details
        });
    } catch (error) {
        console.error('Error fetching provider details:', error);
        res.status(500).json({ success: false, message: 'Error fetching provider details' });
    }
});

export default router;