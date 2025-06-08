// index.js
import express from 'express';
import cors from 'cors';
import studentRoutes from './routes/student.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies

// Routes
app.use('/students', studentRoutes); // POST /students/register

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.send('Student Registration API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
