const mysql = require('mysql2/promise');

async function fixStatus() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Plmnkopo@09',
        database: 'rupiksha'
    });
    try {
        console.log('Fixing status default value...');
        await connection.query("ALTER TABLE users MODIFY COLUMN status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending'");
        console.log('Status default fixed to Pending.');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}
fixStatus();
