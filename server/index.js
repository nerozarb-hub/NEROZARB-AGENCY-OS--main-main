import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set up basic multer configuration for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Basic health check route
app.get('/ping', (req, res) => {
    res.json({ message: 'pong', status: 'ok', service: 'NEROZARB Agency OS API' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
