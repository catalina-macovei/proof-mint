import pool from './db.js'; // adjust the path to your connection file

const insertTables = async () => {
    try {
        await pool.query(`      
        INSERT INTO Universities (UniversityID, UserID)
        VALUES (1, 1)  -- Replace with actual UserID for the university
        RETURNING UniversityID;

        INSERT INTO Faculties (FacultyID, UserID, UniversityID, DepartmentName)
        VALUES 
        (1, 1, 1, 'Faculty of Mathematics and Computer Science');
        COMMIT;
    `);

        console.log("Tables inserted successfully.");
    } catch (err) {
        console.error("Error inserting tables:", err);
    } finally {
        await pool.end(); // close the connection
    }
};
insertTables();
