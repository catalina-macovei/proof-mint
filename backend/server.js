import express from 'express';
import multer from 'multer';
import { Blob } from 'buffer'; // Import Blob from buffer in Node.js
import cors from 'cors'; // Import CORS middleware
import dotenv from 'dotenv';
import W3client from './w3client.js';

// Initialize the express app
const app = express();
const port = 8000;
dotenv.config();

// Initialize W3client and Web3.Storage client
const w2c = new W3client();  // Use the Singleton instance
await w2c.init();  // Initialize the client

// Use CORS middleware
app.use(cors());

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory as buffer
const upload = multer({ storage });

// API endpoint to upload file to Web3.Storage
app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Convert the buffer to a Blob
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

        // Optional: Define upload options if required
        const uploadOptions = {}; // Customize this if needed

        // Call the Client.uploadFile function with the Blob
        const cid = await w2c.client.uploadFile(fileBlob, uploadOptions);
    
        // Log the file CID (this can be used to reference the file on Web3.Storage)
        console.log('File uploaded successfully with CID:', cid);
        // Return success response with the CID of the uploaded file
        res.status(200).json({
            message: 'File uploaded successfully',
            cid: cid
        });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ message: 'Error uploading the file to Web3.Storage' });
    }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
