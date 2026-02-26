const mysql = require('mysql2/promise');

async function fixSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Plmnkopo@09',
        database: 'rupiksha'
    });

    try {
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const colNames = columns.map(c => c.Field);

        if (!colNames.includes('mobile')) {
            await connection.query('ALTER TABLE users ADD COLUMN mobile VARCHAR(15)');
            console.log("Added mobile");
        }
        if (!colNames.includes('email')) {
            await connection.query('ALTER TABLE users ADD COLUMN email VARCHAR(100)');
            console.log("Added email");
        }
        if (!colNames.includes('pincode')) {
            await connection.query('ALTER TABLE users ADD COLUMN pincode VARCHAR(10)');
            console.log("Added pincode");
        }

    } catch (err) {
        console.error("Schema fix failed:", err);
    } finally {
        await connection.end();
    }
}

fixSchema();
