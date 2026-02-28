// server/index.js
// Rupiksha Backend — Node.js Express
// 
// Install: npm install express cors jsonwebtoken bcryptjs mysql2 dotenv
// Run: node server/index.js

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
// port 5008 matches the Vite proxy configuration
const PORT = process.env.PORT || 5008;
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

const allowedOrigins = [
  'https://rupiksha.in',
  'https://www.rupiksha.in',
  'https://rupiksha.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5008',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS: Not allowed — ' + origin));
  },
  credentials: true
}));

app.use(express.json());

// --- In-Memory Data Store (Replaces Database) ---
const memoryStore = {
  users: [
    {
      id: 1,
      username: 'admin',
      password_hash: '$2a$10$8K9Vp2P5Qh5v5k5k5k5k5u5u5u5u5u5u5u5u5u5u5u5u5u5u5u5u5', // Placeholder for admin123 (hashed below)
      full_name: 'Super Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      balance: 1000000
    },
    {
      id: 2,
      username: 'retailer',
      password_hash: '', // will hash on start
      full_name: 'Premium Retailer',
      role: 'RETAILER',
      status: 'ACTIVE',
      balance: 24500
    },
    {
      id: 3,
      username: 'nat_head',
      password_hash: '',
      full_name: 'Ravi Sharma',
      role: 'NATIONAL_HEADER',
      status: 'ACTIVE',
      balance: 0
    },
    {
      id: 4,
      username: 'state_mh',
      password_hash: '',
      full_name: 'Ajit Patil',
      role: 'STATE_HEADER',
      status: 'ACTIVE',
      balance: 0
    }
  ],
  wallets: [
    { user_id: 1, balance: 1000000 },
    { user_id: 2, balance: 24500 },
    { user_id: 3, balance: 0 },
    { user_id: 4, balance: 0 }
  ],
  transactions: [],
  permissions: [],
  locations: [],
  otpStore: new Map()
};

// Initialize hashes for mock users
(async () => {
  const adminHash = await bcrypt.hash('admin123', 10);
  const pass123Hash = await bcrypt.hash('password123', 10);
  const retailerHash = await bcrypt.hash('retailer123', 10);

  memoryStore.users[0].password_hash = adminHash;
  memoryStore.users[1].password_hash = retailerHash;
  memoryStore.users[2].password_hash = pass123Hash;
  memoryStore.users[3].password_hash = pass123Hash;
})();

// register endpoint
app.post('/register', async (req, res) => {
  try {
    const payload = req.body || {};
    const { name, mobile, email, password, role, businessName, state } = payload;
    const username = mobile || email;
    if (!username) return res.status(400).json({ success: false, error: "Mobile or Email required" });

    const existing = memoryStore.users.find(u => u.username === username);
    if (existing) return res.json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password || 'retailer123', 10);
    const newUser = {
      id: Date.now(),
      username,
      password_hash: hashedPassword,
      full_name: name,
      phone: mobile,
      email,
      address: businessName,
      role: role || 'MEMBER',
      territory: state,
      status: 'ACTIVE',
      created_at: new Date()
    };
    memoryStore.users.push(newUser);
    memoryStore.wallets.push({ user_id: newUser.id, balance: 0 });

    return res.json({
      success: true,
      message: 'User registered successfully',
      userId: newUser.id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error during registration" });
  }
});


// DB Connection Removed
console.log("ℹ️ Database removed. Using In-Memory Storage.");

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
// POST /api/auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = memoryStore.users.find(u => u.username === username || u.phone === username);

    if (!user || user.status === 'INACTIVE') {
      return res.status(401).json({ error: "Invalid credentials or account inactive" });
    }

    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    const wallet = memoryStore.wallets.find(w => w.user_id === user.id);
    const perms = memoryStore.permissions.filter(p => p.user_id === user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET, { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        mobile: user.phone,
        email: user.email,
        role: user.role,
        balance: wallet ? wallet.balance : 0,
        permissions: perms,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// Alias for /api/login (Frontend compatibility)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = memoryStore.users.find(u => u.username === username || u.phone === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const validPass = await bcrypt.compare(password, user.password_hash);
  if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ success: true, token, user: { ...user, name: user.full_name, mobile: user.phone, balance: memoryStore.wallets.find(w => w.user_id === user.id)?.balance || 0 } });
});

// ─── ADMIN & USER MANAGEMENT ROUTES ──────────────────────────────────────────

// GET /api/all-users
app.get("/all-users", async (req, res) => {
  const users = memoryStore.users.filter(u => u.status !== 'TRASH').map(u => {
    const w = memoryStore.wallets.find(wallet => wallet.user_id === u.id);
    return { ...u, name: u.full_name, mobile: u.phone, balance: w ? w.balance : 0 };
  });
  res.json({ success: true, users });
});

// GET /api/trash-users
app.get("/trash-users", async (req, res) => {
  const users = memoryStore.users.filter(u => u.status === 'TRASH');
  res.json({ success: true, users });
});

// POST /api/delete-user
app.post("/delete-user", async (req, res) => {
  const { username } = req.body;
  const user = memoryStore.users.find(u => u.username === username || u.phone === username);
  if (user) user.status = 'TRASH';
  res.json({ success: true });
});

// POST /api/restore-user
app.post("/restore-user", async (req, res) => {
  const { username } = req.body;
  const user = memoryStore.users.find(u => u.username === username || u.phone === username);
  if (user) user.status = 'ACTIVE';
  res.json({ success: true });
});

// POST /api/approve-user
app.post("/approve-user", async (req, res) => {
  const { username, password, status, partyCode, parent_id } = req.body;
  const user = memoryStore.users.find(u => u.username === username || u.phone === username);
  if (user) {
    if (status) user.status = status;
    if (password) user.password_hash = await bcrypt.hash(password, 10);
    if (partyCode) user.partyCode = partyCode;
    if (parent_id) user.created_by = parent_id;
  }
  res.json({ success: true });
});

// POST /api/update-user-role
app.post("/update-user-role", async (req, res) => {
  const { username, newRole } = req.body;
  const user = memoryStore.users.find(u => u.username === username || u.phone === username);
  if (user) user.role = newRole;
  res.json({ success: true });
});

// ─── WALLET & TRANSACTION ROUTES ─────────────────────────────────────────────

// POST /api/get-balance
app.post("/get-balance", async (req, res) => {
  const { userId } = req.body;
  const user = memoryStore.users.find(u => u.username === userId || u.id == userId);
  const w = memoryStore.wallets.find(wallet => wallet.user_id === (user ? user.id : -1));
  res.json({ success: true, balance: w ? w.balance : "0.00" });
});

// GET /api/transactions
app.get("/transactions", async (req, res) => {
  const { userId } = req.query;
  const user = memoryStore.users.find(u => u.username === userId || u.id == userId);
  const txns = memoryStore.transactions.filter(t => t.user_id === (user ? user.id : -1));
  res.json({ success: true, transactions: txns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
});

// GET /api/all-transactions
app.get("/all-transactions", async (req, res) => {
  res.json({ success: true, transactions: memoryStore.transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
});

// GET /api/kyc-status
app.get("/kyc-status", async (req, res) => {
  const { userId } = req.query;
  const user = memoryStore.users.find(u => u.username === userId || u.id == userId);
  const docs = [
    { name: 'Profile KYC', status: user ? user.profile_kyc_status : 'NOT_DONE' },
    { name: 'AEPS KYC', status: user ? user.aeps_kyc_status : 'NOT_DONE' }
  ];
  res.json({ success: true, documents: docs });
});

// GET /api/portal-config
app.get("/portal-config", (req, res) => {
  res.json({ success: true, config: { maintenance: false, notice: "Welcome to Rupiksha!" } });
});

// GET /api/commissions
app.get("/commissions", (req, res) => {
  res.json({ success: true, commissions: [] });
});

// POST /api/auth/logout
app.post("/auth/logout", authMiddleware, (req, res) => {
  // JWT is stateless — client deletes token
  res.json({ success: true });
});

// ─── DASHBOARD ROUTES ────────────────────────────────────────────────────────

// GET /api/dashboard/topbar
app.get("/dashboard/topbar", authMiddleware, async (req, res) => {
  const totalWallet = memoryStore.wallets.reduce((acc, w) => acc + (parseFloat(w.balance) || 0), 0);
  const totalCommission = memoryStore.transactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + (parseFloat(t.commission) || 0), 0);
  const totalCharges = memoryStore.transactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + (parseFloat(t.charges) || 0), 0);
  res.json({ charges: totalCharges, commission: totalCommission, wallet: totalWallet });
});

// GET /api/dashboard/live  — single endpoint for full live admin dashboard
app.get("/dashboard/live", async (req, res) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const activeUsers = memoryStore.users.filter(u => u.status === 'ACTIVE' || u.status === 'Approved');
  const pendingUsers = memoryStore.users.filter(u => u.status === 'Pending' || u.status === 'PENDING');
  const totalWalletBalance = memoryStore.wallets.reduce((acc, w) => acc + (parseFloat(w.balance) || 0), 0);
  const fundRequests = memoryStore.wallets.filter(w => w.status === 'PENDING').length;
  const lockedAmount = memoryStore.wallets.reduce((acc, w) => acc + (parseFloat(w.locked_amount) || 0), 0);

  const kycDone = memoryStore.users.filter(u => u.profile_kyc_status === 'DONE').length;
  const kycNotDone = memoryStore.users.filter(u => !u.profile_kyc_status || u.profile_kyc_status === 'NOT_DONE').length;
  const kycPending = memoryStore.users.filter(u => u.profile_kyc_status === 'PENDING').length;
  const aepsKycDone = memoryStore.users.filter(u => u.aeps_kyc_status === 'DONE').length;
  const aepsKycNotDone = memoryStore.users.filter(u => !u.aeps_kyc_status || u.aeps_kyc_status === 'NOT_DONE').length;
  const aepsKycPending = memoryStore.users.filter(u => u.aeps_kyc_status === 'PENDING').length;

  const getTxnStats = (type) => {
    const all = memoryStore.transactions.filter(t => t.type === type && t.status === 'SUCCESS');
    const todayTxns = all.filter(t => (t.created_at || '').startsWith(todayStr));
    const monthlyTxns = all.filter(t => (t.created_at || '') >= monthStart);
    return {
      todayTxn: todayTxns.length,
      todayAmt: todayTxns.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0),
      monthlyTxn: monthlyTxns.length,
      monthlyAmt: monthlyTxns.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0),
      todayComm: todayTxns.reduce((s, t) => s + (parseFloat(t.commission) || 0), 0),
      monthlyComm: monthlyTxns.reduce((s, t) => s + (parseFloat(t.commission) || 0), 0),
    };
  };

  const totalCommission = memoryStore.transactions.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + (parseFloat(t.commission) || 0), 0);
  const totalCharges = memoryStore.transactions.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + (parseFloat(t.charges) || 0), 0);

  // Recent 10 transactions for activity feed
  const recentTxns = [...memoryStore.transactions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map(t => {
      const user = memoryStore.users.find(u => u.id === t.user_id || u.username === t.user_id);
      return { ...t, userName: user?.full_name || user?.username || 'Unknown User' };
    });

  res.json({
    serverTime: now.toISOString(),
    charges: totalCharges,
    commission: totalCommission,
    wallet: totalWalletBalance,
    users: {
      total: memoryStore.users.length,
      active: activeUsers.length,
      pending: pendingUsers.length,
      inactive: memoryStore.users.filter(u => u.status === 'INACTIVE').length,
    },
    kyc: { done: kycDone, notDone: kycNotDone, pending: kycPending },
    aepsKyc: { done: aepsKycDone, notDone: aepsKycNotDone, pending: aepsKycPending },
    walletStats: { total: totalWalletBalance, fundRequest: fundRequests, locked: lockedAmount },
    aeps: getTxnStats("AEPS"),
    payout: getTxnStats("PAYOUT"),
    cms: getTxnStats("CMS"),
    dmt: getTxnStats("DMT"),
    bharatConnect: getTxnStats("BHARAT_CONNECT"),
    otherService: getTxnStats("OTHER"),
    recentTransactions: recentTxns,
  });
});

// POST /api/log-txn  — record a transaction
app.post("/log-txn", async (req, res) => {
  const { userId, service, amount, operator, number, status, commission, charges } = req.body;
  const txn = {
    id: Date.now(),
    user_id: userId,
    type: (service || 'OTHER').toUpperCase(),
    amount: parseFloat(amount) || 0,
    operator: operator || '',
    number: number || '',
    status: status || 'SUCCESS',
    commission: parseFloat(commission) || 0,
    charges: parseFloat(charges) || 0,
    created_at: new Date().toISOString(),
  };
  memoryStore.transactions.push(txn);

  // Update wallet balance if success
  if (status === 'SUCCESS') {
    const user = memoryStore.users.find(u => u.username === userId || u.id == userId);
    const wallet = user ? memoryStore.wallets.find(w => w.user_id === user.id) : null;
    if (wallet) wallet.balance = Math.max(0, (parseFloat(wallet.balance) || 0) - txn.amount);
  }
  res.json({ success: true, txnId: txn.id });
});

// GET /api/dashboard/stats
app.get("/dashboard/stats", authMiddleware, async (req, res) => {
  const totalUsers = memoryStore.users.length;
  const activeUsers = memoryStore.users.filter(u => u.status === 'ACTIVE').length;
  const inactiveUsers = totalUsers - activeUsers;

  const kycDone = memoryStore.users.filter(u => u.profile_kyc_status === 'DONE').length;
  const kycNotDone = memoryStore.users.filter(u => u.profile_kyc_status === 'NOT_DONE').length;
  const kycPending = memoryStore.users.filter(u => u.profile_kyc_status === 'PENDING').length;

  const aepsKycDone = memoryStore.users.filter(u => u.aeps_kyc_status === 'DONE').length;
  const aepsKycNotDone = memoryStore.users.filter(u => u.aeps_kyc_status === 'NOT_DONE').length;
  const aepsKycPending = memoryStore.users.filter(u => u.aeps_kyc_status === 'PENDING').length;

  const totalWalletBalance = memoryStore.wallets.reduce((acc, w) => acc + (parseFloat(w.balance) || 0), 0);
  const fundRequests = memoryStore.wallets.filter(w => w.status === 'PENDING').length; // Assuming wallet status for fund requests
  const lockedAmount = memoryStore.wallets.reduce((acc, w) => acc + (parseFloat(w.locked_amount) || 0), 0);

  const getTxnStats = (type) => {
    const today = new Date().toISOString().split("T")[0];
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const filteredTxns = memoryStore.transactions.filter(t => t.type === type && t.status === 'SUCCESS');

    const todayTxn = filteredTxns.filter(t => t.created_at.startsWith(today)).length;
    const todayAmt = filteredTxns.filter(t => t.created_at.startsWith(today)).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const monthlyTxn = filteredTxns.filter(t => t.created_at >= firstDay).length;
    const monthlyAmt = filteredTxns.filter(t => t.created_at >= firstDay).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const todayComm = filteredTxns.filter(t => t.created_at.startsWith(today)).reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0);
    const monthlyComm = filteredTxns.filter(t => t.created_at >= firstDay).reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0);

    return { todayTxn, todayAmt, monthlyTxn, monthlyAmt, todayComm, monthlyComm };
  };

  const aeps = getTxnStats("AEPS");
  const payout = getTxnStats("PAYOUT");
  const cms = getTxnStats("CMS");
  const dmt = getTxnStats("DMT");
  const bharatConnect = getTxnStats("BHARAT_CONNECT");
  const otherService = getTxnStats("OTHER");

  res.json({
    users: { total: totalUsers, active: activeUsers, inactive: inactiveUsers },
    kyc: { done: kycDone, notDone: kycNotDone, pending: kycPending },
    aepsKyc: { done: aepsKycDone, notDone: aepsKycNotDone, pending: aepsKycPending },
    wallet: { total: totalWalletBalance, fundRequest: fundRequests, locked: lockedAmount },
    aeps, payout, cms, dmt, bharatConnect, otherService
  });
});

// ─── EMPLOYEE ROUTES ─────────────────────────────────────────────────────────

// GET /api/employees
app.get("/employees", authMiddleware, async (req, res) => {
  const employees = memoryStore.users.filter(u => ['NATIONAL', 'STATE', 'REGIONAL'].includes(u.role));
  const employeesWithUserCount = employees.map(emp => {
    const totalUsers = memoryStore.users.filter(u => u.created_by === emp.id).length;
    return { ...emp, totalUsers };
  });
  res.json(employeesWithUserCount);
});

// GET /api/employees/:id
app.get("/employees/:id", authMiddleware, async (req, res) => {
  const user = memoryStore.users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const u = { ...user }; // Create a copy to avoid modifying original in store
  delete u.password_hash;
  res.json(u);
});

// POST /api/employees/create
app.post("/employees/create", authMiddleware, adminOnly, async (req, res) => {
  const { username, password, fullName, phone, email, address, role, territory } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);
  const newUser = {
    id: memoryStore.users.length > 0 ? Math.max(...memoryStore.users.map(u => u.id)) + 1 : 1, // Simple ID generation
    username,
    password_hash: hashedPass,
    full_name: fullName,
    phone,
    email,
    address,
    role,
    territory,
    status: 'ACTIVE',
    created_by: req.user.id,
    created_at: new Date().toISOString(),
    profile_kyc_status: 'NOT_DONE',
    aeps_kyc_status: 'NOT_DONE',
    last_login: null,
    photo_url: null
  };
  memoryStore.users.push(newUser);
  res.json({ success: true, id: newUser.id, userId: newUser.id });
});

// PUT /api/employees/:id
app.put("/employees/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fullName, phone, email, address, territory } = req.body;
    const user = memoryStore.users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (fullName) user.full_name = fullName;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (address) user.address = address;
    if (territory) user.territory = territory;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id/toggle-status
app.put("/employees/:id/toggle-status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = memoryStore.users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PERMISSIONS ROUTES ───────────────────────────────────────────────────────

// GET /api/employees/:id/permissions
app.get("/employees/:id/permissions", authMiddleware, async (req, res) => {
  try {
    const perms = memoryStore.permissions.filter(p => p.user_id == req.params.id)
      .map(p => ({ module: p.module_name, action: p.action_name, allowed: p.is_allowed }));
    res.json(perms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id/permissions
app.put("/employees/:id/permissions", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { permissions } = req.body;
    const userId = req.params.id;

    // Remove old permissions
    memoryStore.permissions = memoryStore.permissions.filter(p => p.user_id != userId);

    // Add new ones
    if (permissions && permissions.length > 0) {
      permissions.forEach(p => {
        memoryStore.permissions.push({
          user_id: parseInt(userId),
          module_name: p.module,
          action_name: p.action,
          is_allowed: p.allowed
        });
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOCATION ROUTES ─────────────────────────────────────────────────────────

// PUT /api/location/update (user apni location bhejta hai)
app.put("/location/update", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;
    const existingIdx = memoryStore.locations.findIndex(l => l.user_id == req.user.id);
    const locData = {
      user_id: req.user.id,
      latitude,
      longitude,
      recorded_at: timestamp || new Date()
    };

    if (existingIdx !== -1) {
      memoryStore.locations[existingIdx] = locData;
    } else {
      memoryStore.locations.push(locData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/location/all (admin ko sab locations)
app.get("/location/all", authMiddleware, async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const locations = memoryStore.locations
      .filter(l => new Date(l.recorded_at) > oneHourAgo)
      .map(l => {
        const user = memoryStore.users.find(u => u.id == l.user_id);
        return {
          ...l,
          full_name: user?.full_name,
          role: user?.role,
          territory: user?.territory
        };
      })
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/location/:userId
app.get("/location/:userId", authMiddleware, async (req, res) => {
  try {
    const loc = memoryStore.locations.find(l => l.user_id == req.params.userId);
    res.json(loc || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── OTP & EMAIL ROUTES ──────────────────────────────────────────────────────
app.post("/send-otp", async (req, res) => {
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

app.post("/verify-otp", (req, res) => {
  const { email, identity, otp } = req.body;
  const target = email || identity;
  const stored = otpStore.get(target);
  if (stored && stored.otp === otp && Date.now() < stored.expires) {
    otpStore.delete(target);
    return res.json({ success: true });
  }
  res.status(400).json({ error: "Invalid or expired OTP" });
});

app.post("/send-credentials", async (req, res) => {
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
app.post("/send-approval", async (req, res) => {
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

app.post("/send-admin-otp", async (req, res) => {
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

app.post("/verify-admin-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore.get(email);
  if (stored && stored.otp === otp && Date.now() < stored.expires) {
    otpStore.delete(email);
    return res.json({ success: true });
  }
  res.status(400).json({ error: "Invalid OTP" });
});

// ─── ALIAS & MISSING ROUTES ──────────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => res.json({ success: true, status: "OK" }));

// SuperAdmin OTP alias (frontend calls /api/request-otp)
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 120000 });
  try {
    await transporter.sendMail({
      from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Login OTP - RuPiKsha",
      html: `<div style="font-family:Arial;padding:30px;text-align:center"><h2>Your OTP</h2><h1 style="font-size:48px;color:#0f172a;letter-spacing:8px">${otp}</h1><p>Valid for 2 minutes</p></div>`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Forgot password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = memoryStore.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "Email not found" });
  const tempPass = Math.random().toString(36).slice(-8);
  user.password_hash = await bcrypt.hash(tempPass, 10);
  try {
    await transporter.sendMail({
      from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - RuPiKsha",
      html: `<p>Your temporary password is: <b>${tempPass}</b></p>`
    });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to send email" }); }
});

// My retailers by parent
app.get("/my-retailers", async (req, res) => {
  const { parentId } = req.query;
  const users = memoryStore.users.filter(u => u.created_by == parentId && u.status !== 'TRASH').map(u => {
    const w = memoryStore.wallets.find(w => w.user_id === u.id);
    return { ...u, name: u.full_name, mobile: u.phone, balance: w ? w.balance : 0 };
  });
  res.json({ success: true, users });
});

// Portal config & commissions
app.get("/portal-config", (req, res) => res.json({ success: true, config: { name: "RuPiKsha", version: "1.0" } }));
app.get("/commissions", (req, res) => res.json({ success: true, commissions: [] }));

// Support tickets
app.post("/raise-ticket", (req, res) => {
  res.json({ success: true, ticket: { id: Date.now(), ...req.body, status: 'OPEN', created_at: new Date().toISOString() } });
});
app.get("/my-tickets", (req, res) => res.json({ success: true, tickets: [] }));

// KYC upload stub
app.post("/upload-kyc", (req, res) => res.json({ success: true, message: "KYC uploaded" }));

// Bill fetch (BBPS)
app.post("/bill-fetch", async (req, res) => {
  const { consumerNo } = req.body;
  res.json({
    success: true,
    bill: {
      custName: "Customer",
      consumerNo: consumerNo || "N/A",
      amount: "150.00",
      dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN'),
      billNo: `BILL${Date.now()}`,
      orderId: `ORD${Date.now()}`
    }
  });
});

// Bill pay
app.post("/bill-pay", async (req, res) => {
  const { userId, biller, consumerNo, amount } = req.body;
  const txn = { id: Date.now(), user_id: userId, type: 'BBPS', amount: parseFloat(amount) || 0, operator: biller || '', number: consumerNo || '', status: 'SUCCESS', commission: 0, created_at: new Date().toISOString() };
  memoryStore.transactions.push(txn);
  res.json({ success: true, txnId: txn.id });
});

// Recharge
app.post("/recharge", async (req, res) => {
  const { userId, operator, mobile, amount, type } = req.body;
  const txn = { id: Date.now(), user_id: userId, type: (type || 'RECHARGE').toUpperCase(), amount: parseFloat(amount) || 0, operator: operator || '', number: mobile || '', status: 'SUCCESS', commission: parseFloat(amount) * 0.02, created_at: new Date().toISOString() };
  memoryStore.transactions.push(txn);
  res.json({ success: true, txnId: txn.id });
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
