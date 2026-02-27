// server/index.js
// Rupiksha Backend — Node.js Express
// 
// Install: npm install express cors jsonwebtoken bcryptjs mysql2 dotenv
// Run: node server/index.js

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "rupiksha_secret_key_change_this";

// ─── Nodemailer Setup ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

// Stateless OTP Store
const otpStore = new Map();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── DB Connection ─────────────────────────────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "rupiksha",
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── Auth Middleware ────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
  next();
};

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND status = 'ACTIVE'",
      [username]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    // Get permissions
    const [perms] = await db.query(
      "SELECT module_name as module, action_name as action, is_allowed as allowed FROM permissions WHERE user_id = ?",
      [user.id]
    );

    // Update last login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, territory: user.territory },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        role: user.role,
        territory: user.territory,
        photo: user.photo_url,
        permissions: perms,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Alias for /api/login (Frontend compatibility)
app.post("/api/login", async (req, res) => {
  // Re-use logic or redirect to /api/auth/login logic
  // For simplicity, we just alias it here
  return app._router.handle({ method: 'POST', url: '/api/auth/login', body: req.body, headers: req.headers }, res);
});

// POST /api/auth/logout
app.post("/api/auth/logout", authMiddleware, (req, res) => {
  // JWT is stateless — client deletes token
  res.json({ success: true });
});

// ─── DASHBOARD ROUTES ────────────────────────────────────────────────────────

// GET /api/dashboard/topbar
app.get("/api/dashboard/topbar", authMiddleware, async (req, res) => {
  try {
    // Aapke existing queries yahan lagao
    // Example structure:
    const territory = req.user.territory || "india";
    const whereClause = territory === "india" ? "" : "WHERE territory = ?";
    const params = territory === "india" ? [] : [territory];

    const [[charges]] = await db.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM charges ${whereClause}`, params
    );
    const [[commission]] = await db.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM commissions ${whereClause}`, params
    );
    const [[wallet]] = await db.query(
      `SELECT COALESCE(SUM(balance),0) as total FROM wallets ${whereClause}`, params
    );

    res.json({
      charges: charges.total,
      commission: commission.total,
      wallet: wallet.total,
    });
  } catch (err) {
    console.error(err);
    // Return mock data if DB not set up
    res.json({ charges: 0, commission: 0, wallet: 0 });
  }
});

// GET /api/dashboard/stats?territory=india
app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const territory = req.query.territory || req.user.territory || "india";
    const isAll = territory === "india";
    const tParam = isAll ? [] : [territory];
    const tWhere = isAll ? "" : "AND territory = ?";

    // Users
    const [[users]] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status='INACTIVE' THEN 1 ELSE 0 END) as inactive
       FROM users WHERE role='MEMBER' ${tWhere}`, tParam
    );

    // KYC
    const [[kyc]] = await db.query(
      `SELECT 
        SUM(CASE WHEN profile_kyc_status='DONE' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN profile_kyc_status='NOT_DONE' THEN 1 ELSE 0 END) as notDone,
        SUM(CASE WHEN profile_kyc_status='PENDING' THEN 1 ELSE 0 END) as pending
       FROM users WHERE role='MEMBER' ${tWhere}`, tParam
    );

    // AEPS KYC
    const [[aepsKyc]] = await db.query(
      `SELECT 
        SUM(CASE WHEN aeps_kyc_status='DONE' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN aeps_kyc_status='NOT_DONE' THEN 1 ELSE 0 END) as notDone,
        SUM(CASE WHEN aeps_kyc_status='PENDING' THEN 1 ELSE 0 END) as pending
       FROM users WHERE role='MEMBER' ${tWhere}`, tParam
    );

    // Wallet
    const [[wallet]] = await db.query(
      `SELECT 
        COALESCE(SUM(balance),0) as total,
        COUNT(CASE WHEN status='PENDING' THEN 1 END) as fundRequest,
        COALESCE(SUM(locked_amount),0) as locked
       FROM wallets ${isAll ? "" : "WHERE territory = ?"}`, tParam
    );

    // Helper for transaction stats
    const getTxnStats = async (type) => {
      const today = new Date().toISOString().split("T")[0];
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      const [[r]] = await db.query(
        `SELECT 
          SUM(CASE WHEN DATE(created_at)=? THEN 1 ELSE 0 END) as todayTxn,
          SUM(CASE WHEN DATE(created_at)=? THEN amount ELSE 0 END) as todayAmt,
          SUM(CASE WHEN DATE(created_at)>=? THEN 1 ELSE 0 END) as monthlyTxn,
          SUM(CASE WHEN DATE(created_at)>=? THEN amount ELSE 0 END) as monthlyAmt,
          SUM(CASE WHEN DATE(created_at)=? THEN commission ELSE 0 END) as todayComm,
          SUM(CASE WHEN DATE(created_at)>=? THEN commission ELSE 0 END) as monthlyComm
         FROM transactions 
         WHERE type=? AND status='SUCCESS' ${tWhere}`,
        [today, today, firstDay, firstDay, today, firstDay, type, ...tParam]
      );
      return r;
    };

    const [aeps, payout, cms, dmt, bharatConnect, otherService] = await Promise.all([
      getTxnStats("AEPS"),
      getTxnStats("PAYOUT"),
      getTxnStats("CMS"),
      getTxnStats("DMT"),
      getTxnStats("BHARAT_CONNECT"),
      getTxnStats("OTHER"),
    ]);

    res.json({ users, kyc, aepsKyc, wallet, aeps, payout, cms, dmt, bharatConnect, otherService });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── EMPLOYEE ROUTES ─────────────────────────────────────────────────────────

// GET /api/employees
app.get("/api/employees", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, username, full_name, phone, email, address, role, 
              territory, status, photo_url, last_login, created_at,
              (SELECT COUNT(*) FROM users u2 WHERE u2.created_by=users.id) as totalUsers
       FROM users 
       WHERE role IN ('NATIONAL','STATE','REGIONAL')
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id
app.get("/api/employees/:id", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const u = rows[0];
    delete u.password_hash;
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees/create
app.post("/api/employees/create", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, fullName, phone, email, address, role, territory } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (username, password_hash, full_name, phone, email, address, role, territory, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [username, hashedPass, fullName, phone, email, address, role, territory, req.user.id]
    );
    res.json({ success: true, id: result.insertId, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id
app.put("/api/employees/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fullName, phone, email, address, territory } = req.body;
    await db.query(
      "UPDATE users SET full_name=?, phone=?, email=?, address=?, territory=? WHERE id=?",
      [fullName, phone, email, address, territory, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id/toggle-status
app.put("/api/employees/:id/toggle-status", authMiddleware, adminOnly, async (req, res) => {
  try {
    await db.query(
      "UPDATE users SET status = CASE WHEN status='ACTIVE' THEN 'INACTIVE' ELSE 'ACTIVE' END WHERE id=?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PERMISSIONS ROUTES ───────────────────────────────────────────────────────

// GET /api/employees/:id/permissions
app.get("/api/employees/:id/permissions", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT module_name as module, action_name as action, is_allowed as allowed FROM permissions WHERE user_id=?",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id/permissions
app.put("/api/employees/:id/permissions", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { permissions } = req.body;
    const userId = req.params.id;
    // Delete old permissions and insert new ones
    await db.query("DELETE FROM permissions WHERE user_id=?", [userId]);
    if (permissions && permissions.length > 0) {
      const values = permissions.map(p => [userId, p.module, p.action, p.allowed]);
      await db.query(
        "INSERT INTO permissions (user_id, module_name, action_name, is_allowed) VALUES ?",
        [values]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOCATION ROUTES ─────────────────────────────────────────────────────────

// PUT /api/location/update (user apni location bhejta hai)
app.put("/api/location/update", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;
    await db.query(
      `INSERT INTO user_locations (user_id, latitude, longitude, recorded_at) 
       VALUES (?,?,?,?) 
       ON DUPLICATE KEY UPDATE latitude=?, longitude=?, recorded_at=?`,
      [req.user.id, latitude, longitude, timestamp || new Date(),
        latitude, longitude, timestamp || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/location/all (admin ko sab locations)
app.get("/api/location/all", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ul.user_id, ul.latitude, ul.longitude, ul.recorded_at,
              u.full_name, u.role, u.territory
       FROM user_locations ul
       JOIN users u ON u.id = ul.user_id
       WHERE ul.recorded_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY ul.recorded_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/location/:userId
app.get("/api/location/:userId", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM user_locations WHERE user_id=? ORDER BY recorded_at DESC LIMIT 1",
      [req.params.userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── OTP & EMAIL ROUTES ──────────────────────────────────────────────────────
app.post("/api/send-otp", async (req, res) => {
  const { to, email, otp: clientOtp, name } = req.body;
  const targetEmail = to || email;
  if (!targetEmail) return res.status(400).json({ error: "Email required" });

  const otp = clientOtp || Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(targetEmail, { otp, expires: Date.now() + 300000 });

  try {
    await transporter.sendMail({
      from: `"RuPiKsha Support" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: "Email Verification OTP - RuPiKsha",
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Email Verification</h2>
          <p>Hello <b>${name || 'Partner'}</b>,</p>
          <p>Your OTP for RuPiKsha verification is:</p>
          <h1 style="color: #10b981; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>`
    });
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, identity, otp } = req.body;
  const target = email || identity;
  const stored = otpStore.get(target);
  if (stored && stored.otp === otp && Date.now() < stored.expires) {
    otpStore.delete(target);
    return res.json({ success: true });
  }
  res.status(400).json({ error: "Invalid or expired OTP" });
});

app.post("/api/send-credentials", async (req, res) => {
  const { to, name, login_id, password, portal_type, added_by } = req.body;
  try {
    await transporter.sendMail({
      from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Your Login Credentials - ${portal_type || 'RuPiKsha'}`,
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #0f172a;">Welcome to RuPiKsha</h2>
          <p>Hello ${name}, you've been added by ${added_by} as a ${portal_type}.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><b>Login ID:</b> ${login_id}</p>
            <p><b>Password:</b> <span style="color: #ef4444;">${password}</span></p>
          </div>
          <p>Please log in and change your password immediately.</p>
        </div>`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send credentials" });
  }
});

// POST /api/send-approval (Centralized from Vercel api/index.js)
app.post("/api/send-approval", async (req, res) => {
  const { to, name, login_id, password, id_label, id_value, portal_type } = req.body;
  try {
    await transporter.sendMail({
      from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Account Approved - ${portal_type}`,
      html: `<div style="font-family: Arial; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="color: #10b981;">Congratulations ${name}!</h2>
                <p>Your ${portal_type} request is approved.</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                    <p><b>Login ID:</b> ${login_id}</p>
                    <p><b>Password:</b> ${password}</p>
                    <p><b>${id_label}:</b> ${id_value}</p>
                </div>
            </div>`
    });
    res.json({ success: true, message: "Approval email sent" });
  } catch (e) {
    console.error("Mail Error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/send-admin-otp", async (req, res) => {
  const { email } = req.body;
  const ADMIN_OTP_EMAIL = "dubeyom1406@gmail.com";
  if (email !== ADMIN_OTP_EMAIL) return res.status(403).json({ error: "Access Denied" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 120000 });

  try {
    await transporter.sendMail({
      from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Login OTP",
      html: `<h1 style="text-align:center; font-size: 40px; color: #020617;">${otp}</h1>`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/api/verify-admin-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore.get(email);
  if (stored && stored.otp === otp && Date.now() < stored.expires) {
    otpStore.delete(email);
    return res.json({ success: true });
  }
  res.status(400).json({ error: "Invalid OTP" });
});

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

// Catch-all 404 for API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global JSON Error Handler (Prevents HTML error pages)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Rupiksha Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
});
