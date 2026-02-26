const mysql = require('mysql2/promise');

async function update() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Plmnkopo@09',
        database: 'rupiksha',
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL');

        const statements = [
            `CREATE TABLE IF NOT EXISTS commissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_name VARCHAR(50) NOT NULL,
                role ENUM('RETAILER', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR') NOT NULL,
                commission_type ENUM('PERCENTAGE', 'FLAT') DEFAULT 'PERCENTAGE',
                value DECIMAL(10, 2) NOT NULL,
                min_amount DECIMAL(10, 2) DEFAULT 0.00,
                max_amount DECIMAL(10, 2) DEFAULT 999999.00,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            `TRUNCATE TABLE commissions`,
            `INSERT INTO commissions (service_name, role, value) VALUES 
                ('MOBILE_RECHARGE', 'RETAILER', 3.00),
                ('MOBILE_RECHARGE', 'DISTRIBUTOR', 0.50),
                ('MOBILE_RECHARGE', 'SUPER_DISTRIBUTOR', 0.20),
                ('AEPS', 'RETAILER', 0.80),
                ('AEPS', 'DISTRIBUTOR', 0.10),
                ('BBPS', 'RETAILER', 0.50)`
        ];

        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('Commission settings connected and updated successfully.');
    } catch (err) {
        console.error('Error during update:', err);
    } finally {
        await connection.end();
    }
}

update();
