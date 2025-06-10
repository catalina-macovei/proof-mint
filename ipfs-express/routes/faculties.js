import express from 'express';
import pool from '../db.js';
const router = express.Router();

// CREATE faculty
router.post('/', async (req, res) => {
  const { UserID, UniversityID, DepartmentName } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Faculties (UserID, UniversityID, DepartmentName)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [UserID, UniversityID, DepartmentName]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// READ all faculties
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Faculties`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// READ one faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM Faculties WHERE FacultyID = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE faculty
router.put('/:id', async (req, res) => {
  const { UserID, UniversityID, DepartmentName } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Faculties
       SET UserID = $1, UniversityID = $2, DepartmentName = $3
       WHERE FacultyID = $4
       RETURNING *`,
      [UserID, UniversityID, DepartmentName, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE faculty
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM Faculties WHERE FacultyID = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
