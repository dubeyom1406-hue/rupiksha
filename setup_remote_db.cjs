const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' }); // Make sure to use dotenv from your logic

const setupRemoteDB = async () => {
    try {
        console.log("Connecting to Remote Database...");
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Port: ${process.env.DB_PORT}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Database: ${process.env.DB_NAME}`);

        // Ensure SSL is true based on env for Aiven
        if (process.env.DB_SSL !== 'true') {
            console.log("WARNING: DB_SSL is not set to 'true'. Aiven usually requires SSL.");
        }

        const pool = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
            multipleStatements: true // This is needed to run the massive SQL script
        });

        console.log("✅ Successfully connected to cloud database!");

        console.log("Reading setup_db.sql file...");
        let sql = fs.readFileSync('setup_db.sql', 'utf8');

        // Remove `USE rupiksha;` completely because Aiven provides its own defaultdb name
        sql = sql.replace(/USE\s+rupiksha\s*;/gi, '');
        // Remove CREATE DATABASE statement to prevent Aiven permission error
        sql = sql.replace(/CREATE DATABASE\s+IF\s+NOT\s+EXISTS\s+`?rupiksha`?\s*;/gi, '');

        console.log("Executing SQL script to build tables...");
        await pool.query(sql);

        console.log("✅ All tables created successfully on the remote database!");

        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error("❌ Setup Error:");
        console.error(e.message);
        process.exit(1);
    }
};

setupRemoteDB();
