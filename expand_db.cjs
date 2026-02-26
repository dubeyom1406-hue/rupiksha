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
        console.log('Expanding Database with Plans and Hierarchy...');

        const statements = [
            `CREATE TABLE IF NOT EXISTS plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plan_code VARCHAR(50) UNIQUE NOT NULL,
                role_type ENUM('RETAILER', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR') NOT NULL,
                label VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                commission_rate DECIMAL(5, 2) DEFAULT 0.00,
                features TEXT,
                active BOOLEAN DEFAULT TRUE
            )`,
            `CREATE TABLE IF NOT EXISTS user_plans (
                user_id INT PRIMARY KEY,
                plan_id INT,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (plan_id) REFERENCES plans(id)
            )`,
            `INSERT IGNORE INTO plans (plan_code, role_type, label, price, commission_rate, features) VALUES 
                ('RET_BASIC', 'RETAILER', 'Basic', 0.00, 0.25, 'AEPS, Money Transfer'),
                ('RET_GOLD', 'RETAILER', 'Gold', 4999.00, 0.75, 'PAN Card, Priority Support'),
                ('DIST_STANDARD', 'DISTRIBUTOR', 'Standard', 5000.00, 0.40, '50 Retailer IDs'),
                ('SD_PREMIUM', 'SUPER_DISTRIBUTOR', 'Premium', 1999.00, 0.50, 'Priority Payouts')`
        ];

        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('Database expanded successfully.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

update();
