// routes/student.js
import express from 'express';
import db from '../db.js'; 

const router = express.Router();

router.post("/register", async (req, res) => {
  const { ethAddress, fullName, email, facultyId } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO students (eth_address, full_name, email, faculty_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (eth_address) DO NOTHING
       RETURNING *`,
      [ethAddress, fullName, email, facultyId]
    );

    res.json(result.rows[0] || { message: "Already registered" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering student");
  }
});

router.get('/all', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM students');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching students');
    }
  });

export default router;
