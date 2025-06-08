import express from 'express';
import pool from '../db.js';
const router = express.Router();

// CREATE student
router.post('/', async (req, res) => {
  const { UserID, FacultyID } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Students (UserID, FacultyID)
       VALUES ($1, $2)
       RETURNING *`,
      [UserID, FacultyID]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// READ all students
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Students`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// READ one student by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM Students WHERE StudentID = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  const { UserID, FacultyID } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Students 
       SET UserID = $1, FacultyID = $2 
       WHERE StudentID = $3 
       RETURNING *`,
      [UserID, FacultyID, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM Students WHERE StudentID = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
