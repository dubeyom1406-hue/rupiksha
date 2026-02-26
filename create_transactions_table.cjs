const mysql = require('mysql2/promise');

async function create() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Plmnkopo@09',
        database: 'rupiksha'
    });

    try {
        console.log('Creating Transactions Table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                txn_id VARCHAR(100) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                service_type VARCHAR(100),
                operator_name VARCHAR(100),
                number VARCHAR(50),
                amount DECIMAL(10, 2),
                status ENUM('SUCCESS', 'FAILED', 'PENDING') DEFAULT 'PENDING',
                details JSON,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('Transactions table created.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

create();
