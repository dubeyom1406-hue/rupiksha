const mysql = require('mysql2/promise');

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Plmnkopo@09',
        database: 'rupiksha'
    });
    try {
        const [rows] = await connection.query('SELECT username, role, status, business_name FROM users');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}
run();
