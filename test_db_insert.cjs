const mysql = require('mysql2/promise');

async function testInsert() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Plmnkopo@09',
        database: 'rupiksha'
    });

    try {
        console.log("Testing insert with email column...");
        const [result] = await connection.query(
            'INSERT INTO users (username, password, name, role, email, mobile, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['testuser_' + Date.now(), 'pass', 'Test Name', 'RETAILER', 'test@example.com', '1234567890', 'Pending']
        );
        console.log("Insert successful! ID:", result.insertId);
    } catch (err) {
        console.error("Insert failed:", err.message);
    } finally {
        await connection.end();
    }
}

testInsert();
