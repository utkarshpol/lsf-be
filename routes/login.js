import express from 'express';
import db from '../connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Secret key for JWT (use a strong, unique key in a production environment)
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your actual secret key

// Route to log in a provider
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body; // Get email and password from request body

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // Fetch the provider with the given email from the database
        const result = await db.query('SELECT * FROM service_providers WHERE email = $1', [email]);

        // Check if provider exists
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const provider = result.rows[0];

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, provider.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT token with provider's ID
        const token = jwt.sign({ userid: provider.id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        // Send the token as a cookie
        res.cookie('token', token, {
            httpOnly: true, // Helps prevent XSS attacks
            maxAge: 3600000, // 1 hour in milliseconds
        });

        // Successful login, respond with provider details (excluding password)
        const { password: _, ...providerDetails } = provider; // Exclude password from response
        res.status(200).json({
            success: true,
            provider: providerDetails, // Return provider details without password
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});

export default router;