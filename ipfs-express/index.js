// index.js
import express from 'express';
import cors from 'cors';
import universities from './routes/universities.js';
import faculties from './routes/faculties.js';
import applications from './routes/applications.js';
import students from './routes/students.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies


app.use('/universities', universities);
app.use('/faculties', faculties);
app.use('/applications', applications);
app.use('/students', students);

app.listen(PORT, () => console.log('Server running on port 3000'));
