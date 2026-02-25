const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
require('dotenv').config();

// ── Venus BBPS Config
const BBPS_BASE = 'https://venusrecharge.co.in';
const BBPS_AUTHKEY = '10092';
const BBPS_AUTHPASS = 'RUPIKSHA@816';
const BBPS_STYPE = 'EB';
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const app = express();
app.use(express.json());
app.use(cors());

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: "UP", message: "Rupiksha Node.js Backend is Running on Vercel!" });
});

// Temporary in-memory storage for OTPs (Note: Vercel functions are stateless, this is for short-lived sessions)
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
            <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #2c3e50;">Email Verification</h2>
                <p>Hello <b>${name || 'Partner'}</b>,</p>
                <p>Your OTP for RuPiKsha verification is:</p>
                <h1 style="color: #3498db; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 5 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden;">
                <div style="background: #0f172a; padding: 30px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Account Approved</h2>
                </div>
                <div style="padding: 30px;">
                    <p>Hello <b>${name}</b>,</p>
                    <p>Your request for <b>${portal_type}</b> has been approved.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><b>Login ID:</b> ${login_id}</p>
                        <p><b>Password:</b> ${password}</p>
                        <p><b>${id_label}:</b> ${id_value}</p>
                    </div>
                    <p>Welcome to RuPiKsha!</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Approval email sent" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send approval email" });
    }
});

// Endpoint to Send Mobile OTP (Simulation mostly)
app.post('/api/send-mobile-otp', async (req, res) => {
    const { mobile } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(mobile, { otp, expires: Date.now() + 300000 });

    if (!process.env.FAST2SMS_KEY || process.env.FAST2SMS_KEY === 'YOUR_FAST2SMS_API_KEY_HERE') {
        return res.status(200).json({ message: "OTP sent (Simulation)", preview: otp });
    }

    try {
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.FAST2SMS_KEY,
                route: 'otp',
                variables_values: otp,
                numbers: mobile
            }
        });
        res.status(200).json({ success: true, message: "OTP sent to mobile" });
    } catch (error) {
        res.status(500).json({ message: "Failed to connect to SMS Gateway" });
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

// Bill Fetch with DOB support
app.get('/api/bill-fetch', async (req, res) => {
    const { consumerNo, mobile, opcode, subDiv, dob } = req.query;
    if (!opcode || !consumerNo) return res.status(400).json({ success: false, message: "Missing required fields" });

    const merchantRef = "R" + (Date.now().toString()).slice(-11);
    const params = new URLSearchParams({
        authkey: BBPS_AUTHKEY,
        authpass: BBPS_AUTHPASS,
        opcode: opcode,
        Merchantrefno: merchantRef,
        ConsumerID: consumerNo,
        ConsumerMobileNo: mobile || "9876543210",
        ServiceType: BBPS_STYPE
    });

    if (subDiv) params.append('SubDiv', subDiv);
    if (dob) {
        params.append('Field1', dob);
        params.append('dob', dob);
    } else {
        params.append('Field1', 'NONE');
    }
    params.append('Field2', 'NONE');

    try {
        const response = await axios.get(`${BBPS_BASE}/FetchBill.aspx?${params.toString()}`, { timeout: 15000 });
        const parsed = xmlParser.parse(response.data);
        const root = parsed.Response || parsed.BillFetch || parsed;
        const status = root.ResponseStatus?.toString().toUpperCase();

        if (status === 'TXN' || status === 'SAC' || status === 'RCS' || root.Description?.toUpperCase().includes('SUCCESS')) {
            return res.status(200).json({
                success: true,
                bill: {
                    custName: root.ConsumerName || 'Valued Customer',
                    amount: Number(root.DueAmount) || 0,
                    dueDate: root.DueDate || 'N/A',
                    orderId: root.OrderId,
                    merchantRef: merchantRef
                },
                source: 'VERCEL_NODE'
            });
        }
        res.status(200).json({ success: false, message: root.Description || "Fetch Failed" });
    } catch (err) {
        res.status(500).json({ success: false, message: "API Error" });
    }
});

// Bill Pay with DOB support
app.post('/api/bill-pay', async (req, res) => {
    const { consumerNo, amount, mobile, orderId, opcode, subDiv, dob } = req.body;
    if (!consumerNo || !amount || !opcode) return res.status(400).json({ success: false, message: "Missing fields" });

    const merchantRef = "R" + (Date.now().toString()).slice(-11);
    const params = new URLSearchParams({
        authkey: BBPS_AUTHKEY,
        authpass: BBPS_AUTHPASS,
        opcode: opcode,
        Merchantrefno: merchantRef,
        ConsumerID: consumerNo,
        ConsumerMobileNo: mobile || "9876543210",
        ServiceType: BBPS_STYPE,
        Amount: amount,
        Orderid: orderId || merchantRef
    });

    if (subDiv) params.append('SubDiv', subDiv);
    if (dob) {
        params.append('Field1', dob);
        params.append('dob', dob);
    } else {
        params.append('Field1', 'NONE');
    }
    params.append('Field2', 'NONE');

    try {
        const response = await axios.get(`${BBPS_BASE}/PaymentBill.aspx?${params.toString()}`, { timeout: 30000 });
        const parsed = xmlParser.parse(response.data);
        const root = parsed.Response || parsed.PaymentBill || parsed;
        const status = root.ResponseStatus?.toString().toUpperCase();

        if (status === 'TXN' || status === 'SAC' || status === 'RCS' || root.Description?.toUpperCase().includes('SUCCESS')) {
            return res.status(200).json({
                success: true,
                message: root.Description || 'Payment Successful!',
                txid: root.OperatorTxnId || root.OrderId || merchantRef,
                source: 'VERCEL_NODE'
            });
        }
        res.status(200).json({ success: false, message: root.Description || "Payment Failed" });
    } catch (err) {
        res.status(500).json({ success: false, message: "API Error" });
    }
});

// Recharge
app.post('/api/recharge', async (req, res) => {
    const { mobile, operator, amount, serviceType } = req.body;
    const operatorCode = operator?.toUpperCase().slice(0, 3) || 'JIO';
    const merchantRefNo = `RPK${Date.now()}`;

    try {
        const venusRes = await axios.post('https://api.venusrecharge.com/V2/api/recharge/transaction', {
            mobileNo: mobile,
            operatorCode,
            serviceType: serviceType || 'MR',
            amount: Number(amount),
            merchantRefNo
        }, {
            headers: { authkey: BBPS_AUTHKEY, authpass: BBPS_AUTHPASS },
            timeout: 20000
        });

        const d = venusRes.data;
        const ok = d && (d.responseStatus?.toUpperCase() === 'SUCCESS' || d.status?.toUpperCase() === 'SUCCESS');

        res.status(200).json({
            success: ok,
            message: d.description || (ok ? "Recharge Successful" : "Recharge Failed"),
            txid: d.orderNo || merchantRefNo
        });
    } catch (err) {
        res.status(200).json({ success: false, message: "Recharge Timeout" });
    }
});

// Proxy fallbacks for unknown routes to index.html (SPA)
app.use((req, res) => {
    res.status(404).json({ error: "API Route Not Found" });
});

module.exports = app;
