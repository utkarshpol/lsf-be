import express from 'express';
import db from '../connection.js';

const router = express.Router();

// Route to mark a task as done for a specific booking
router.put('/api/mark-task-done/:bookingId', async (req, res) => {
    const bookingId = parseInt(req.params.bookingId, 10); // Get booking ID from request parameters

    // Validate booking ID
    if (isNaN(bookingId)) {
        return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    try {
        // Execute the update query to mark the task as done
        const result = await db.query(
            `UPDATE booking_logs
             SET is_done = true
             WHERE id = $1
             RETURNING *`,
            [bookingId]
        );

        // Check if the booking was found and updated
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Respond with the updated booking details
        res.status(200).json({
            success: true,
            booking: result.rows[0], // Return the updated booking details
        });
    } catch (error) {
        console.error('Error marking task as done:', error);
        res.status(500).json({ success: false, message: 'Error marking task as done' });
    }
});

export default router;