const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
require('dotenv').config();

// ── Venus Config
const BBPS_BASE = 'https://venusrecharge.co.in';
const BBPS_AUTHKEY = '10092';
const BBPS_AUTHPASS = 'RUPIKSHA@816';
const BBPS_STYPE = 'EB';
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const app = express();
app.use(express.json());
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: "UP", message: "Rupiksha Node.js Backend is Running on Vercel!" });
});

// Stateless OTP Store
const otpStore = new Map();

// Email Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

// --- EMAIL ENDPOINTS ---

app.post('/api/send-otp', async (req, res) => {
    const { to, email, otp: clientOtp, name } = req.body;
    const targetEmail = to || email;
    if (!targetEmail) return res.status(400).json({ success: false, message: "Email is required" });
    const otp = clientOtp || Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(targetEmail, { otp, expires: Date.now() + 300000 });

    try {
        await transporter.sendMail({
            from: `"RuPiKsha Support" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: 'Email Verification OTP - RuPiKsha',
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #2c3e50;">Email Verification</h2>
                <p>Hello <b>${name || 'Partner'}</b>,</p>
                <p>Your OTP for RuPiKsha verification is: <h1 style="color: #3498db; letter-spacing: 5px;">${otp}</h1></p>
                <p>This OTP will expire in 5 minutes.</p>
            </div>`
        });
        res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
});

app.post('/api/send-approval', async (req, res) => {
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
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/send-credentials', async (req, res) => {
    const { to, name, login_id, password, portal_type, added_by } = req.body;
    try {
        await transporter.sendMail({
            from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `Your Login Credentials`,
            html: `<div style="font-family: Arial; padding: 20px;">
                <p>Hello ${name}, you've been added by ${added_by} as a ${portal_type}.</p>
                <p>Login ID: ${login_id}<br/>Pass: ${password}</p>
            </div>`
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- SMS & OTP ---

app.post('/api/send-mobile-otp', async (req, res) => {
    const { mobile } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(mobile, { otp, expires: Date.now() + 300000 });
    if (!process.env.FAST2SMS_KEY || process.env.FAST2SMS_KEY.length < 10) {
        return res.json({ message: "OTP sent (Simulation)", preview: otp });
    }
    try {
        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: { authorization: process.env.FAST2SMS_KEY, route: 'otp', variables_values: otp, numbers: mobile }
        });
        res.json({ success: true, message: "OTP sent to mobile" });
    } catch (e) { res.status(500).json({ message: "SMS Gateway Error" }); }
});

app.post('/api/verify-otp', (req, res) => {
    const { identity, otp } = req.body;
    const stored = otpStore.get(identity);
    if (stored && stored.otp === otp && Date.now() < stored.expires) {
        otpStore.delete(identity);
        return res.json({ success: true, message: "Verified" });
    }
    res.status(400).json({ message: "Invalid or expired OTP" });
});

// --- VERIFICATION STUBS ---

app.post('/api/verify-account', (req, res) => res.json({ success: true, accountHolderName: "MR. OM DUBEY" }));
app.post('/api/verify-pan', (req, res) => res.json({ success: true, data: { status: "VALID", name: "OM DUBEY" } }));
app.post('/api/verify-upi', (req, res) => res.json({ success: true, data: { status: "VALID", name: "OM DUBEY" } }));

// --- BILLS & RECHARGE (VENUS) ---

app.get('/api/bill-fetch', async (req, res) => {
    const { consumerNo, mobile, opcode, subDiv, dob } = req.query;
    if (!opcode) return res.status(400).json({ success: false, message: "Select Biller" });
    const merchantRef = "R" + Date.now().toString().slice(-11);
    const params = new URLSearchParams({
        authkey: BBPS_AUTHKEY, authpass: BBPS_AUTHPASS, opcode, Merchantrefno: merchantRef,
        ConsumerID: consumerNo, ConsumerMobileNo: mobile || "9876543210", ServiceType: BBPS_STYPE
    });
    if (subDiv) params.append('SubDiv', subDiv);
    if (dob) params.append('Field1', dob);

    try {
        const response = await axios.get(`${BBPS_BASE}/FetchBill.aspx?${params.toString()}`);
        const root = xmlParser.parse(response.data).Response || {};
        if (root.ResponseStatus === 'TXN' || root.Description?.toUpperCase().includes('SUCCESS')) {
            return res.json({ success: true, bill: { custName: root.ConsumerName, amount: root.DueAmount, orderId: root.OrderId, merchantRef } });
        }
        res.json({ success: false, message: root.Description || "Fetch Failed" });
    } catch (e) { res.status(500).json({ success: false, message: "Venus API Offline/Blocked" }); }
});

app.post('/api/bill-pay', async (req, res) => {
    const { consumerNo, amount, opcode, mobile, orderId, dob } = req.body;
    const merchantRef = "R" + Date.now().toString().slice(-11);
    const params = new URLSearchParams({
        authkey: BBPS_AUTHKEY, authpass: BBPS_AUTHPASS, opcode, Merchantrefno: merchantRef,
        ConsumerID: consumerNo, ConsumerMobileNo: mobile || "9876543210", ServiceType: BBPS_STYPE,
        Amount: amount, Orderid: orderId || merchantRef
    });
    if (dob) params.append('Field1', dob);

    try {
        const response = await axios.get(`${BBPS_BASE}/PaymentBill.aspx?${params.toString()}`);
        const root = xmlParser.parse(response.data).Response || {};
        if (root.ResponseStatus === 'TXN') return res.json({ success: true, txid: root.OperatorTxnId });
        res.json({ success: false, message: root.Description });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/recharge', async (req, res) => {
    const { mobile, operator, amount } = req.body;
    const merchantRefNo = `RPK${Date.now()}`;
    try {
        const venusRes = await axios.post('https://api.venusrecharge.com/V2/api/recharge/transaction', {
            mobileNo: mobile, operatorCode: operator?.toUpperCase().slice(0, 3) || 'JIO',
            serviceType: 'MR', amount: Number(amount), merchantRefNo
        }, { headers: { authkey: BBPS_AUTHKEY, authpass: BBPS_AUTHPASS } });
        const d = venusRes.data;
        res.json({ success: d.responseStatus === 'SUCCESS', message: d.description, txid: d.orderNo });
    } catch (e) { res.status(200).json({ success: false, message: "Recharge API Issue" }); }
});

app.get('/api/recharge-balance', async (req, res) => {
    try {
        const r = await axios.get(`${BBPS_BASE}/Balance.aspx?authkey=${BBPS_AUTHKEY}&authpass=${BBPS_AUTHPASS}&service=recharge`);
        const p = xmlParser.parse(r.data).Response || {};
        res.json({ success: true, balance: p.Balance });
    } catch (e) { res.json({ success: false }); }
});

// --- ADMIN OTP ---

app.post('/api/send-admin-otp', async (req, res) => {
    const { email } = req.body;
    if (email !== 'dubeyom1406@gmail.com') return res.status(403).json({ error: "Unauthorized" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 120000 });
    try {
        await transporter.sendMail({
            from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
            to: email, subject: "Admin OTP",
            html: `<h1 style="text-align:center">${otp}</h1>`
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.post('/api/verify-admin-otp', (req, res) => {
    const { email, otp } = req.body;
    const s = otpStore.get(email);
    if (s && s.otp === otp && Date.now() < s.expires) {
        otpStore.delete(email);
        return res.json({ success: true });
    }
    res.status(400).json({ error: "Invalid OTP" });
});

module.exports = app;
