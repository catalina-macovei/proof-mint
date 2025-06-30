import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const { StudentID, FacultyID, Status, AttestationType } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Applications (StudentID, FacultyID, Status, AttestationType) VALUES ($1, $2, $3, $4) RETURNING *`,
      [StudentID, FacultyID, Status || 'Pending', AttestationType || 'Public']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Applications`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Applications WHERE ApplicationID = $1`, [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get applications by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        f.DepartmentName as facultyname,
        f.DepartmentName as departmentname
       FROM Applications a
       LEFT JOIN Faculties f ON a.FacultyID = f.FacultyID
       WHERE a.StudentID = $1
       ORDER BY a.CreatedAt DESC`,
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get applications by faculty ID
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    console.log('Fetching applications for faculty ID:', req.params.facultyId);

    const result = await pool.query(
      `SELECT 
        a.*,
        f.DepartmentName as facultyname,
        f.DepartmentName as departmentname,
        u.UserName as studentname,
        u.Email as studentemail,
        u.EthAddress as studentethaddress,
        s.StudentID as studentid
       FROM Applications a
       LEFT JOIN Faculties f ON a.FacultyID = f.FacultyID
       LEFT JOIN Students s ON a.StudentID = s.StudentID
       LEFT JOIN Users u ON s.UserID = u.UserID
       WHERE a.FacultyID = $1
       ORDER BY a.CreatedAt DESC`,
      [req.params.facultyId]
    );

    console.log('Applications found:', result.rows.length);
    console.log('Applications data:', result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error('Error in /applications/faculty/:facultyId:', err.message);
    res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { StudentID, FacultyID, Status, AttestationType, uid } = req.body;
  
  // Print the parameters being updated
  console.log('Updating application with ID:', req.params.id);
  console.log('Parameters being updated:', {
    StudentID,
    FacultyID,
    Status,
    AttestationType,
    uid
  });
  
  try {
    const result = await pool.query(
      `UPDATE Applications 
       SET StudentID = $1, FacultyID = $2, Status = $3, AttestationType = $4, uid = $5 
       WHERE ApplicationID = $6 
       RETURNING *`,
      [StudentID, FacultyID, Status, AttestationType, uid, req.params.id]
    );
    
    console.log('Update successful. Updated record:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating application:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM Applications WHERE ApplicationID = $1 RETURNING *`, [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
