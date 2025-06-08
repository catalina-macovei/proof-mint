import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const { UserID, EnrollmentNumber, FacultyID } = req.body;
  const result = await pool.query(
    `INSERT INTO Students (UserID, EnrollmentNumber, FacultyID) VALUES ($1, $2, $3) RETURNING *`,
    [UserID, EnrollmentNumber, FacultyID]
  );
  res.json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Students`);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Students WHERE StudentID = $1`, [req.params.id]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { UserID, EnrollmentNumber, FacultyID } = req.body;
  const result = await pool.query(
    `UPDATE Students SET UserID = $1, EnrollmentNumber = $2, FacultyID = $3 WHERE StudentID = $4 RETURNING *`,
    [UserID, EnrollmentNumber, FacultyID, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const result = await pool.query(`DELETE FROM Students WHERE StudentID = $1 RETURNING *`, [req.params.id]);
  res.json(result.rows[0]);
});

export default router;
