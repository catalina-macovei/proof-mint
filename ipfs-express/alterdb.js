import pool from './db.js';

const addUIDColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE Applications 
            ADD COLUMN IF NOT EXISTS UID VARCHAR(100);
        `);
        
        console.log("UID column added successfully to Applications table.");
    } catch (err) {
        console.error("Error adding UID column:", err);
    } finally {
        await pool.end();
    }
};

addUIDColumn();
