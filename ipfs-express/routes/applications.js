import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const { UserID, FacultyID, ApplicationType, Status } = req.body;
  const result = await pool.query(
    `INSERT INTO Applications (UserID, FacultyID, ApplicationType, Status) VALUES ($1, $2, $3, $4) RETURNING *`,
    [UserID, FacultyID, ApplicationType, Status || 'Pending']
  );
  res.json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Applications`);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Applications WHERE ApplicationID = $1`, [req.params.id]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { UserID, FacultyID, ApplicationType, Status } = req.body;
  const result = await pool.query(
    `UPDATE Applications SET UserID = $1, FacultyID = $2, ApplicationType = $3, Status = $4, UpdatedAt = CURRENT_TIMESTAMP WHERE ApplicationID = $5 RETURNING *`,
    [UserID, FacultyID, ApplicationType, Status, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const result = await pool.query(`DELETE FROM Applications WHERE ApplicationID = $1 RETURNING *`, [req.params.id]);
  res.json(result.rows[0]);
});

export default router;
