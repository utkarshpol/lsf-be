import { Client } from 'pg';

const connectionString = process.env.STRING;

// Create a new client instance
const client = new Client({ connectionString });

const connectDB = client.connect().then(() => {
    console.log('Connected to the PostgreSQL database');
}).catch(err => {
    console.error('Connection error:', err.stack);
});

export default connectDB;