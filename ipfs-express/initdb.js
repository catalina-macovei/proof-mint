import pool from './db.js'; // adjust the path to your connection file

const createTables = async () => {
    try {
        await pool.query(`
      
      DROP TABLE IF EXISTS Students CASCADE;
      DROP TABLE IF EXISTS Faculties CASCADE;
      DROP TABLE IF EXISTS Universities CASCADE;
      DROP TABLE IF EXISTS Users CASCADE;


      CREATE TABLE IF NOT EXISTS Users (
        UserID SERIAL PRIMARY KEY,
        UserType VARCHAR(50) NOT NULL,
        UserName VARCHAR(100),
        Email VARCHAR(100),
        EthAddress VARCHAR(42) UNIQUE,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Students (
        StudentID SERIAL PRIMARY KEY,
        UserID INT UNIQUE,
        FacultyID INT,
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
      );

        CREATE TABLE IF NOT EXISTS Universities (
        UniversityID SERIAL PRIMARY KEY,
        UserID INT UNIQUE,
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        );

        CREATE TABLE IF NOT EXISTS Faculties (
        FacultyID SERIAL PRIMARY KEY,
        UserID INT UNIQUE,
        UniversityID INT NOT NULL,
        DepartmentName VARCHAR(100),
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID)
        );

        CREATE TABLE IF NOT EXISTS Applications (
        ApplicationID SERIAL PRIMARY KEY,
        StudentID INT NOT NULL,
        FacultyID INT NOT NULL,
        Status VARCHAR(50) DEFAULT 'Pending',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (FacultyID) REFERENCES Faculties(FacultyID)
        );

        COMMIT;
    `);

        console.log("Tables created successfully.");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        await pool.end(); // close the connection
    }
};

createTables();
