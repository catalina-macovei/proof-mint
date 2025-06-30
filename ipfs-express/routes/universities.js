import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const { UserID, UniversityCode } = req.body;
  const result = await pool.query(
    `INSERT INTO Universities (UserID, UniversityCode) VALUES ($1, $2) RETURNING *`,
    [UserID, UniversityCode]
  );
  res.json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Universities`);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Universities WHERE UniversityID = $1`, [req.params.id]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { UserID, UniversityCode } = req.body;
  const result = await pool.query(
    `UPDATE Universities SET UserID = $1, UniversityCode = $2 WHERE UniversityID = $3 RETURNING *`,
    [UserID, UniversityCode, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const result = await pool.query(`DELETE FROM Universities WHERE UniversityID = $1 RETURNING *`, [req.params.id]);
  res.json(result.rows[0]);
});

export default router;