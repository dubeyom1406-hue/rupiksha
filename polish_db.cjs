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
        console.log('Polishing Database for Robust Operation...');

        const statements = [
            // 1. KYC Documents Table
            `CREATE TABLE IF NOT EXISTS kyc_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                doc_type ENUM('AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN_CARD', 'SHOP_PHOTO', 'SELFIE') NOT NULL,
                doc_number VARCHAR(50),
                file_path TEXT,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                remarks TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // 2. Support Tickets Table
            `CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') DEFAULT 'OPEN',
                priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // 3. User Login Logs
            `CREATE TABLE IF NOT EXISTS login_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                ip_address VARCHAR(45),
                browser VARCHAR(255),
                status VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`
        ];

        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('Database polished successfully. Ready for full sync.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

update();
