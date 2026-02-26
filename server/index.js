const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

// --- MySQL Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Plmnkopo@09',
    database: process.env.DB_NAME || 'rupiksha',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify DB Connection
pool.getConnection()
    .then(conn => {
        console.log("✅ Database Connected Successfully");
        conn.release();
    })
    .catch(err => {
        console.log("❌ Database Connection Failed:", err.message);
    });

// ── Venus BBPS Config (Confirmed Real Credentials)
const BBPS_BASE = 'https://venusrecharge.co.in';
const BBPS_AUTHKEY = '10092';
const BBPS_AUTHPASS = 'RUPIKSHA@816';
const BBPS_STYPE = 'EB';
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const app = express();
app.use(express.json());
app.use(cors());

// Simple Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') console.log('Body:', req.body);
    next();
});

// Health Check Route
app.get('/', (req, res) => {
    res.send('<h1>RuPiKsha OTP Server is Running!</h1><p>The system is ready to send professional emails.</p>');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'online' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'online' });
});

// Temporary in-memory storage for OTPs
const otpStore = new Map();

// Email Transporter - Using port 587 (STARTTLS) is generally more compatible
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps in some restricted environments
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ Mail Server Error:", error);
    } else {
        console.log("✅ Mail Server is ready to take our messages");
    }
});

// Endpoint to Send Email OTP
app.post('/api/send-otp', async (req, res) => {
    const { to, email, otp: clientOtp, name } = req.body;
    const targetEmail = to || email;
    if (!targetEmail) return res.status(400).json({ success: false, message: "Email is required" });

    const otp = clientOtp || Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(targetEmail, { otp, expires: Date.now() + 300000 });

    const mailOptions = {
        from: `"RuPiKsha Support" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'Email Verification OTP - RuPiKsha',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 20px;">
                <h1 style="color: #f59e0b; margin-bottom: 20px;">Verification Code</h1>
                <p style="font-size: 16px; color: #4b5563;">Hello <b>${name || 'Partner'}</b>,</p>
                <p style="font-size: 16px; color: #4b5563;">Your verification code for RUPIKSHA Fintech is:</p>
                <div style="background: #fffbeb; border: 2px dashed #f59e0b; padding: 20px; text-align: center; border-radius: 15px; margin: 30px 0;">
                    <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #b45309;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #9ca3af;">This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 RUPIKSHA FINTECH. All rights reserved.</p>
            </div>
        `
    };

    try {
        console.log(`Attempting to send OTP to ${targetEmail}...`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent successfully to ${targetEmail}`);
        res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.error('❌ Email send error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message,
            code: error.code
        });
    }
});

// Endpoint to Send Approval Credentials
app.post('/api/send-approval', async (req, res) => {
    const { to, name, login_id, password, id_label, id_value, portal_type } = req.body;
    if (!to) return res.status(400).json({ success: false, message: "Email is required" });

    const mailOptions = {
        from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Success! Your ${portal_type} account is Approved`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <div style="background: #0f172a; padding: 40px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Account Approved</h1>
                </div>
                <div style="padding: 40px; background: white;">
                    <p style="font-size: 16px; color: #1f2937;">Hello <b>${name}</b>,</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">Welcome to <b>RUPIKSHA FINTECH</b>! Your request for <b>${portal_type}</b> has been approved by the Administrator.</p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #6366f1; font-size: 14px; text-transform: uppercase;">Login Credentials</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 5px 0; font-size: 14px; color: #64748b;">Login ID:</td><td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1e293b;">${login_id}</td></tr>
                            <tr><td style="padding: 5px 0; font-size: 14px; color: #64748b;">Password:</td><td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #f59e0b;">${password}</td></tr>
                            <tr><td style="padding: 5px 0; font-size: 14px; color: #64748b;">${id_label}:</td><td style="padding: 5px 0; font-size: 14px; font-weight: bold; color: #1e293b;">${id_value}</td></tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || '#'}" style="background: #0f172a; color: white; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Login to Portal</a>
                    </div>
                </div>
                <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                    This is an automated message. Please do not reply to this email.
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Approval email sent" });
    } catch (error) {
        console.error('Approval email error:', error);
        res.status(500).json({ success: false, message: "Failed to send approval email" });
    }
});

// Endpoint to Send Registration Credentials (added by Dist/Admin)
app.post('/api/send-credentials', async (req, res) => {
    const { to, name, login_id, password, added_by, portal_type } = req.body;
    if (!to) return res.status(400).json({ success: false, message: "Email is required" });

    const mailOptions = {
        from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Your ${portal_type} Login Credentials`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden;">
                <div style="background: #f59e0b; padding: 30px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Welcome to RUPIKSHA</h2>
                </div>
                <div style="padding: 30px;">
                    <p>Hello <b>${name}</b>,</p>
                    <p>You have been registered as a <b>${portal_type}</b> by <b>${added_by}</b>.</p>
                    <p>Below are your account credentials to access the portal:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><b>Login ID:</b> ${login_id}</p>
                        <p style="margin: 5px 0;"><b>Password:</b> ${password}</p>
                    </div>
                    <p>Please login and complete your profile if prompted.</p>
                </div>
                <div style="background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                    RUPIKSHA FINTECH GATEWAY
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Credentials email sent" });
    } catch (error) {
        console.error('Credentials email error:', error);
        res.status(500).json({ success: false, message: "Failed to send credentials email" });
    }
});

// Endpoint to Send Mobile OTP via Fast2SMS
app.post('/api/send-mobile-otp', async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(mobile, { otp, expires: Date.now() + 300000 });

    const apiKey = process.env.FAST2SMS_KEY;

    if (!apiKey || apiKey === 'YOUR_FAST2SMS_API_KEY_HERE') {
        console.log(`[SIMULATION] Mobile: ${mobile}, OTP: ${otp}`);
        return res.status(200).json({ message: "OTP sent (Simulation)", preview: otp });
    }

    try {
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: apiKey,
                route: 'otp',
                variables_values: otp,
                numbers: mobile
            }
        });

        console.log("Fast2SMS Response:", response.data);

        if (response.data.return) {
            res.status(200).json({ message: "OTP sent successfully to mobile" });
        } else {
            console.error("Fast2SMS Error Response:", response.data);
            res.status(500).json({ message: `Fast2SMS Error: ${response.data.message || 'Unknown Error'}` });
        }
    } catch (error) {
        if (error.response) {
            console.error("Fast2SMS HTTP Error:", error.response.status, error.response.data);
            res.status(500).json({ message: `SMS Gateway Error: ${error.response.data.message || 'Check Fast2SMS Balance/Settings'}` });
        } else {
            console.error("Fast2SMS Connectivity Error:", error.message);
            res.status(500).json({ message: "Failed to connect to SMS Gateway" });
        }
    }
});

// Endpoint to Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { identity, otp } = req.body;
    const stored = otpStore.get(identity);

    if (!stored) return res.status(400).json({ message: "No OTP found" });
    if (Date.now() > stored.expires) {
        otpStore.delete(identity);
        return res.status(400).json({ message: "OTP expired" });
    }

    if (stored.otp === otp) {
        otpStore.delete(identity);
        res.status(200).json({ message: "Verified" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});

// --- COMMISSION MANAGEMENT ---

// Get all commissions
app.get('/api/commissions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM commissions');
        res.json({ success: true, commissions: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update a commission
app.post('/api/commissions/update', async (req, res) => {
    const { id, value } = req.body;
    try {
        await pool.query('UPDATE commissions SET value = ? WHERE id = ?', [value, id]);
        res.json({ success: true, message: "Commission updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- PORTAL CONFIG ---
app.get('/api/portal-config', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM admin_portal WHERE id = 1');
        res.json({ success: true, config: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/my-retailers', async (req, res) => {
    const { parentId } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE parent_id = ?', [parentId]);
        res.json({ success: true, retailers: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/update-portal-config', async (req, res) => {
    const { news_ticker, support_number, support_email } = req.body;
    try {
        await pool.query(
            'UPDATE admin_portal SET news_ticker = ?, support_number = ?, support_email = ? WHERE id = 1',
            [news_ticker, support_number, support_email]
        );
        res.json({ success: true, message: "Portal configuration updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Endpoint to Verify Account
app.post('/api/verify-account', (req, res) => {
    res.status(200).json({ success: true, accountHolderName: "MR. OM DUBEY" });
});

// --- USER & AUTH ---

app.post('/api/register', async (req, res) => {
    const { username, password, name, role, parent_id, business_name, email, mobile, city, state, address, pincode, status } = req.body;

    // Robust fallbacks for self-registration
    const finalUsername = username || mobile || `user_${Date.now()}`;
    const finalPassword = password || '123456'; // Default temporary password
    const finalRole = role || 'RETAILER';

    try {
        const sql = 'INSERT INTO users (username, password, name, role, parent_id, business_name, email, mobile, city, state, address, pincode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const vals = [finalUsername, finalPassword, name, finalRole, parent_id || null, business_name || '', email, mobile, city || '', state, address || '', pincode || '', status || 'Pending'];

        console.log("📝 EXECUTING REGISTRATION QUERY...");
        // console.log(sql, vals);

        const [result] = await pool.query(sql, vals);
        const userId = result.insertId;
        // Create wallet for new user
        await pool.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0.00)', [userId]);
        res.json({ success: true, userId });
    } catch (err) {
        console.error("❌ REGISTRATION FAILED:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/approve-user', async (req, res) => {
    const { username, password, status, partyCode, parent_id } = req.body;
    try {
        await pool.query(
            'UPDATE users SET status = ?, password = ?, partyCode = ?, parent_id = ? WHERE username = ?',
            [status || 'Approved', password, partyCode || null, parent_id || null, username]
        );
        res.json({ success: true, message: "User status updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/update-profile', async (req, res) => {
    const { userId, name, email, business_name, address, city, state, pincode } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, business_name = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
            [name, email, business_name, address, city, state, pincode, userId]
        );
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password, location } = req.body;
    try {
        // Search by username or mobile
        const [users] = await pool.query(
            'SELECT * FROM users WHERE (username = ? OR mobile = ?) AND password = ?',
            [username, username, password]
        );

        if (users.length > 0) {
            const user = users[0];
            if (user.status !== 'Approved') {
                await pool.query('INSERT INTO login_logs (user_id, status) VALUES (?, "PENDING_APPROVAL")', [user.id]);
                return res.json({ success: false, message: "Account pending approval" });
            }
            // Update Location if provided
            if (location && location.lat && location.lng) {
                await pool.query('UPDATE users SET latitude = ?, longitude = ? WHERE id = ?', [location.lat, location.lng, user.id]);
            }

            // Log Success
            await pool.query('INSERT INTO login_logs (user_id, status) VALUES (?, "SUCCESS")', [user.id]);

            // Fetch wallet balance
            const [wallets] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [user.id]);
            user.balance = wallets[0]?.balance || 0;

            // Fetch assigned plan
            const [p] = await pool.query(
                'SELECT p.* FROM plans p JOIN user_plans up ON p.id = up.plan_id WHERE up.user_id = ?',
                [user.id]
            );
            user.plan = p[0] || null;

            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- KYC MANAGEMENT ---
app.post('/api/upload-kyc', async (req, res) => {
    const { userId, docType, docNumber, filePath } = req.body;
    try {
        await pool.query(
            'INSERT INTO kyc_documents (user_id, doc_type, doc_number, file_path, status) VALUES (?, ?, ?, ?, "PENDING") ON DUPLICATE KEY UPDATE doc_number = ?, file_path = ?, status = "PENDING"',
            [userId, docType, docNumber, filePath, docNumber, filePath]
        );
        res.json({ success: true, message: "Document uploaded for verification" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/kyc-status', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM kyc_documents WHERE user_id = ?', [userId]);
        res.json({ success: true, documents: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- SUPPORT TICKETS ---
app.post('/api/raise-ticket', async (req, res) => {
    const { userId, subject, message, priority } = req.body;
    try {
        await pool.query(
            'INSERT INTO support_tickets (user_id, subject, message, priority, status) VALUES (?, ?, ?, ?, "OPEN")',
            [userId, subject, message, priority || 'MEDIUM']
        );
        res.json({ success: true, message: "Ticket raised successfully. Our team will contact you soon." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/my-tickets', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json({ success: true, tickets: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "Missing UserID" });
    try {
        const [rows] = await pool.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100', [userId]);
        const transactions = rows.map(r => ({
            id: r.txn_id,
            timestamp: r.timestamp,
            service: r.service_type,
            amount: parseFloat(r.amount),
            status: r.status,
            details: r.details ? (typeof r.details === 'string' ? JSON.parse(r.details) : r.details) : {}
        }));
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/plans', async (req, res) => {
    const { role } = req.query;
    try {
        let query = 'SELECT * FROM plans WHERE active = TRUE';
        const params = [];
        if (role) {
            query += ' AND role_type = ?';
            params.push(role);
        }
        const [rows] = await pool.query(query, params);
        res.json({ success: true, plans: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get Wallet Balance
app.post('/api/get-balance', async (req, res) => {
    const { userId } = req.body;
    try {
        const [wallets] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
        res.json({ success: true, balance: wallets[0]?.balance || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/assign-plan', async (req, res) => {
    const { userId, planId } = req.body;
    try {
        await pool.query(
            'INSERT INTO user_plans (user_id, plan_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE plan_id = ?',
            [userId, planId, planId]
        );
        res.json({ success: true, message: "Plan assigned successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Wallet (Add/Deduct Money)
app.post('/api/update-wallet', async (req, res) => {
    const { userId, amount, type } = req.body; // type: 'add' or 'deduct'
    try {
        const change = type === 'add' ? amount : -amount;
        await pool.query('UPDATE wallets SET balance = balance + ? WHERE user_id = ?', [change, userId]);
        const [updated] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
        res.json({ success: true, balance: updated[0].balance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Log Database Transaction
app.post('/api/log-txn', async (req, res) => {
    const { userId, service, amount, operator, number, status } = req.body;
    const txnId = 'RPK' + Date.now();
    try {
        await pool.query(
            'INSERT INTO transactions (txn_id, user_id, service_type, operator_name, number, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [txnId, userId, service, operator, number, amount, status || 'SUCCESS']
        );
        res.json({ success: true, txnId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Endpoint to Check Venus Balance (Documentation)
app.get('/api/recharge-balance', async (req, res) => {
    try {
        const url = `${BBPS_BASE}/Balance.aspx?authkey=${BBPS_AUTHKEY}&authpass=${BBPS_AUTHPASS}&service=recharge`;
        const response = await axios.get(url);
        const parsed = xmlParser.parse(response.data);
        const balance = parsed.Response?.Balance || 0;
        res.json({ success: true, balance, raw: parsed });
    } catch (err) {
        res.status(500).json({ success: false, message: "Balance Check Failed", error: err.message });
    }
});

// ══════════════════════════════════════════════
// 📱 MOBILE & DTH RECHARGE ENDPOINT — VENUS REAL API
// ══════════════════════════════════════════════
app.post('/api/recharge', async (req, res) => {
    const { mobile, operator, circle, amount, serviceType } = req.body;

    if (!mobile || !amount || Number(amount) < 1) {
        return res.status(400).json({ success: false, message: 'Mobile number and amount are required' });
    }
    if (!operator) {
        return res.status(400).json({ success: false, message: 'Operator not specified' });
    }

    const type = serviceType || 'MOBILE';
    const merchantRefNo = `RPKSHA${Date.now()}`;

    // Map operator name to Venus operator code
    const getVenusCode = (op) => {
        const u = op.toUpperCase();
        if (u.includes('AIRTEL')) return 'ATL';
        if (u.includes('JIO')) return 'JIO';
        if (u.includes('BSNL')) return 'BSN';
        if (u.includes('VI') || u.includes('VODAFONE') || u.includes('IDEA')) return 'VOD';
        return u;
    };

    const operatorCode = getVenusCode(operator);
    const venusServiceType = type === 'DTH' ? 'DTH' : 'MR';

    console.log(`[RECHARGE] ${type} | Op:${operator}(${operatorCode}) | Num:${mobile} | Amt:Rs${amount} | Ref:${merchantRefNo}`);

    try {
        const venusRes = await axios.post(
            'https://api.venusrecharge.com/V2/api/recharge/transaction',
            {
                mobileNo: mobile,
                operatorCode,
                serviceType: venusServiceType,
                amount: Number(amount),
                merchantRefNo
            },
            {
                headers: {
                    authkey: '10092',
                    authpass: 'RUPIKSHA@816',
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );

        const d = venusRes.data;
        console.log('Venus Response:', JSON.stringify(d));

        const ok = d && (d.responseStatus?.toUpperCase() === 'SUCCESS' || d.status?.toUpperCase() === 'SUCCESS');

        if (ok) {
            return res.status(200).json({
                success: true,
                txid: d.orderNo || d.operatorTxnId || merchantRefNo,
                message: d.description || `Recharge of Rs${amount} successful for ${mobile}`,
                operator, circle: circle || '',
                amount: Number(amount), mobile, serviceType: type,
                merchantRefNo, operatorTxnId: d.operatorTxnId || null,
                timestamp: new Date().toISOString(),
                status: 'SUCCESS', source: 'VENUS_REAL'
            });
        } else {
            console.log('Venus failure:', d?.description);
            return res.status(200).json({
                success: false,
                message: d?.description || 'Recharge failed. Please try again.',
                merchantRefNo, source: 'VENUS_REAL'
            });
        }

    } catch (err) {
        console.error('Venus API Error:', err?.response?.data || err.message);
        const errMsg = err?.response?.data?.description || err?.response?.data?.message;
        return res.status(200).json({
            success: false,
            message: 'Could not connect to Venus Recharge API. Please check Venus account balance or try again.',
            source: 'VENUS_OFFLINE'
        });
    }
});

// ══════════════════════════════════════════════
// 📡 BILL FETCH — REAL VENUS BBPS API
// ══════════════════════════════════════════════
app.post('/api/bill-fetch', async (req, res) => {
    const { consumerNo, mobile, opcode, subDiv } = req.body;

    const normalizedOp = (opcode || '').toString().trim().toUpperCase();
    if (!opcode || normalizedOp === 'UNDEFINED' || normalizedOp === 'NULL' || normalizedOp === 'NONE' || normalizedOp === '' || normalizedOp.length < 3) {
        console.error(`[VENUS FETCH ERROR] Blocked invalid opcode: "${opcode}"`);
        return res.status(200).json({
            success: false,
            message: 'Invalid Biller selection. Please select the provider again.'
        });
    }

    console.log(`[VENUS FETCH] Incoming: opcode=${opcode}, consumerNo=${consumerNo}, subDiv=${subDiv}`);
    const merchantRef = (Date.now().toString() + Math.floor(10 + Math.random() * 90)).slice(0, 14);
    if (!mobile || mobile.length < 10) {
        return res.status(200).json({ success: false, message: 'Valid Consumer Mobile Number is required for BBPS.' });
    }
    const consumerMobile = mobile;

    // Construct URL using URLSearchParams as requested
    const params = new URLSearchParams({
        authkey: BBPS_AUTHKEY,
        authpass: BBPS_AUTHPASS,
        opcode: opcode,
        Merchantrefno: merchantRef,
        ConsumerID: consumerNo,
        ConsumerMobileNo: consumerMobile,
        ServiceType: BBPS_STYPE
    });

    if (subDiv) params.append('SubDiv', subDiv);
    params.append('Field1', '');
    params.append('Field2', '');

    const url = `${BBPS_BASE}/FetchBill.aspx?${params.toString()}`;

    console.log(`[VENUS FETCH] Requesting: ${url}`);

    try {
        const response = await axios.get(url, { timeout: 15000, responseType: 'text' });
        const xml = response.data;
        console.log(`[VENUS FETCH] Raw: ${xml}`);

        const parsed = xmlParser.parse(xml);
        const root = parsed.Response || parsed.BillFetch || parsed;

        const status = root.ResponseStatus?.toString().toUpperCase();
        const desc = root.Description;

        if (status === 'TXN' || status === 'SAC' || status === 'RCS' || (desc && desc.toUpperCase().includes('SUCCESS'))) {
            return res.status(200).json({
                success: true,
                bill: {
                    custName: root.ConsumerName || 'Valued Customer',
                    amount: Number(root.DueAmount) || 0,
                    dueDate: root.DueDate || 'N/A',
                    billNo: root.OrderId || merchantRef, // Fallback to merchantRef if OrderId missing
                    orderId: root.OrderId,
                    merchantRef: merchantRef
                },
                source: 'VENUS_REAL'
            });
        }

        return res.status(200).json({
            success: false,
            message: desc || `Venus Error: ${status || 'Unknown'}`,
            code: status
        });

    } catch (err) {
        console.error('[VENUS FETCH ERROR]:', err.message);
        return res.status(200).json({
            success: false,
            message: 'Venus API Timeout (Could be IP whitelist issue).',
            source: 'VENUS_OFFLINE'
        });
    }
});

// ══════════════════════════════════════════════
// 💳 BILL PAY — REAL VENUS BBPS API
// ══════════════════════════════════════════════
app.post('/api/bill-pay', async (req, res) => {
    const { consumerNo, amount, mobile, orderId, opcode, subDiv } = req.body;

    if (!consumerNo || !amount) {
        return res.status(400).json({ success: false, message: 'Consumer number and amount are required' });
    }

    const normalizedOp = (opcode || '').toString().trim().toUpperCase();
    if (!opcode || normalizedOp === 'UNDEFINED' || normalizedOp === 'NULL' || normalizedOp === 'NONE' || normalizedOp === '' || normalizedOp.length < 3) {
        console.error(`[VENUS PAY ERROR] Blocked invalid opcode: "${opcode}"`);
        return res.status(400).json({ success: false, message: 'Invalid or missing Biller code (NONE). Please select the biller again.' });
    }

    if (!mobile || mobile.length < 10) {
        return res.status(400).json({ success: false, message: 'Valid Consumer Mobile Number is required.' });
    }

    const merchantRef = (Date.now().toString() + Math.floor(10 + Math.random() * 90)).slice(0, 14);
    const consumerMobile = mobile;
    const billOrderId = orderId || merchantRef;

    const url = `${BBPS_BASE}/PaymentBill.aspx` +
        `?authkey=${BBPS_AUTHKEY}` +
        `&authpass=${BBPS_AUTHPASS}` +
        `&opcode=${opcode}` +
        `&Merchantrefno=${merchantRef}` +
        `&ConsumerID=${consumerNo}` +
        `&ConsumerMobileNo=${consumerMobile}` +
        `&ServiceType=${BBPS_STYPE}` +
        `&Amount=${amount}` +
        `&Orderid=${billOrderId}` +
        `&SubDiv=${subDiv || ''}` +
        `&Field1=&Field2=`;

    console.log(`[VENUS PAY] Requesting: ${url}`);

    try {
        const response = await axios.get(url, { timeout: 30000, responseType: 'text' });
        const xml = response.data;
        console.log(`[VENUS PAY] Raw: ${xml}`);

        const parsed = xmlParser.parse(xml);
        const root = parsed.Response || parsed.PaymentBill || parsed;

        const status = root.ResponseStatus?.toString().toUpperCase();
        const desc = root.Description;

        if (status === 'TXN' || status === 'SAC' || status === 'RCS' || (desc && desc.toUpperCase().includes('SUCCESS'))) {
            return res.status(200).json({
                success: true,
                message: desc || 'Payment Successful!',
                txid: root.OperatorTxnId || root.OrderId || merchantRef,
                source: 'VENUS_REAL'
            });
        }

        return res.status(200).json({
            success: false,
            message: desc || `Payment Error: ${status || 'Unknown'}`,
            code: status
        });

    } catch (err) {
        console.error('[VENUS PAY ERROR]:', err.message);
        return res.status(200).json({
            success: false,
            message: 'Payment Request Timeout. Please verify status manually.',
            source: 'VENUS_OFFLINE'
        });
    }
});

// ══════════════════════════════════════════════
// 📡 VENUS CALLBACK / WEBHOOK ENDPOINT
// ══════════════════════════════════════════════
app.all('/api/callback', (req, res) => {
    const data = {
        method: req.method,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
    };

    console.log('🔔 [VENUS CALLBACK RECEIVED]:', JSON.stringify(data, null, 2));

    // Venus expects a 'SUCCESS' or 'OK' string response usually
    res.status(200).send('SUCCESS');
});

app.get('/api/all-users', async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.*, w.balance 
            FROM users u 
            LEFT JOIN wallets w ON u.id = w.user_id
        `);
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/all-transactions', async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT t.*, u.username, u.name as user_name 
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC 
            LIMIT 500
        `);
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

