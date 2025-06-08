import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const { UserType, UserName, Email, EthAddress } = req.body;
  const result = await pool.query(
    `INSERT INTO Users (UserType, UserName, Email, EthAddress) VALUES ($1, $2, $3, $4) RETURNING *`,
    [UserType, UserName, Email, EthAddress]
  );
  res.json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Users`);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Users WHERE UserID = $1`, [req.params.id]);
  res.json(result.rows[0]);
});

router.get('/eth/:ethAddress', async (req, res) => {
  const result = await pool.query(`SELECT * FROM Users WHERE EthAddress = $1`, [req.params.ethAddress]);
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { UserType, UserName, Email, EthAddress } = req.body;
  const result = await pool.query(
    `UPDATE Users SET UserType = $1, UserName = $2, Email = $3, EthAddress = $4 WHERE UserID = $5 RETURNING *`,
    [UserType, UserName, Email, EthAddress, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const result = await pool.query(`DELETE FROM Users WHERE UserID = $1 RETURNING *`, [req.params.id]);
  res.json(result.rows[0]);
});

export default router;