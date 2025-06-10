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

router.get('/user/:userId', async (req, res) => {
  try {
    console.log('Looking for faculty with UserID:', req.params.userId);
    
    // Try different case variations
    const result = await pool.query(
      `SELECT 
        f.facultyid as FacultyID,
        f.facultyid,
        f.userid as UserID,
        f.userid,
        f.universityid as UniversityID,
        f.universityid,
        f.departmentname as DepartmentName,
        f.departmentname,
        u.username as UserName,
        u.username,
        u.email as Email,
        u.email
       FROM Faculties f
       LEFT JOIN Users u ON f.UserID = u.UserID OR f.userid = u.userid
       WHERE f.UserID = $1 OR f.userid = $1`,
      [req.params.userId]
    );
    
    console.log('Faculty query result:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('No faculty found for UserID:', req.params.userId);
      return res.status(404).json({ 
        error: 'Faculty not found',
        debug: {
          searchedUserId: req.params.userId,
          message: 'No faculty record exists for this user. Please ensure the user is registered as faculty.'
        }
      });
    }
    
    console.log('Faculty found:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in /faculties/user/:userId:', err.message);
    res.status(500).json({ error: 'Internal Server Error: ' + err.message });
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
