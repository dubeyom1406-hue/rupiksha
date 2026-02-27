import { sendOTPEmail, sendCredentialsEmail } from './emailService';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export const dataService = {
    // --- AUTH & LOGIN ---
    requestRegistration: async function (data) {
        const username = data.mobile || data.email;
        const newUser = {
            ...data,
            username: username,
            status: 'Pending', // Self-registered starts as Pending
            balance: '0.00',
            id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
            latitude: data.latitude || null,
            longitude: data.longitude || null
        };

        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const resData = await res.json();
            return resData;
        } catch (e) {
            // Local fallback
            const localData = this.getData();
            if (!localData.users.find(u => u.username === username)) {
                localData.users.push(newUser);
                this.saveData(localData);
            }
            return { success: true, message: "Request saved offline", registrationId: newUser.id };
        }
    },
    registerUser: async function (data, parentId = null) {
        const username = data.mobile || data.email;
        const newUser = {
            ...data,
            username: username,
            role: data.role || 'RETAILER',
            parent_id: parentId,
            status: 'Pending',
            balance: '0.00',
            id: 'RT-' + Math.floor(1000 + Math.random() * 9000),
            latitude: data.latitude || null,
            longitude: data.longitude || null
        };

        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const resData = await res.json();
            if (resData.success) {
                // Success from server
            }
        } catch (e) {
            console.warn("Server unreachable, saving locally only.");
        }

        // Always save locally as fallback/sync
        const localData = this.getData();
        if (!localData.users.find(u => u.username === username)) {
            localData.users.push(newUser);
            this.saveData(localData);
        }
        return { success: true, user: newUser };
    },

    loginUser: async function (username, password, location = null) {
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, location })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('rupiksha_user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            }
        } catch (e) { }

        // Local fallback for testing
        const data = this.getData();
        let user = data.users.find(u => (u.username === username || u.mobile === username) && u.password === password);

        // Mock Headers if not found
        if (!user && password === 'password123') {
            if (username === 'nat_head') {
                user = {
                    id: 'EMP-001', username: 'nat_head', password: 'password123', name: 'Ravi Sharma', role: 'NATIONAL_HEADER', territory: 'India',
                    mobile: '9876543210', email: 'ravi@rupiksha.com', address: 'Delhi, India', status: 'Approved',
                    latitude: 28.6139, longitude: 77.2090, lastLogin: new Date().toISOString()
                };
            } else if (username === 'state_mh') {
                user = {
                    id: 'EMP-002', username: 'state_mh', password: 'password123', name: 'Ajit Patil', role: 'STATE_HEADER', territory: 'Maharashtra',
                    mobile: '9876543211', email: 'ajit@rupiksha.com', address: 'Mumbai, MH', status: 'Approved',
                    latitude: 19.0760, longitude: 72.8777, lastLogin: new Date().toISOString()
                };
            }
        }

        if (user) {
            localStorage.setItem('rupiksha_user', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: "Invalid credentials or Server down" };
    },

    getCurrentUser: function () {
        const saved = localStorage.getItem('rupiksha_user');
        return saved ? JSON.parse(saved) : null;
    },

    logoutUser: function () {
        localStorage.removeItem('rupiksha_user');
        window.location.href = '/';
    },

    // --- WALLET & TRANSACTIONS ---
    getWalletBalance: async function (userId) {
        try {
            const res = await fetch(`${BACKEND_URL}/get-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            return data.success ? data.balance : "0.00";
        } catch (e) { return "0.00"; }
    },

    logTransaction: async function (userId, service, amount, operator, number, status) {
        try {
            const res = await fetch(`${BACKEND_URL}/log-txn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, service, amount, operator, number, status })
            });
            const data = await res.json();

            if (data.success && status === 'SUCCESS') {
                const user = this.getCurrentUser();
                const curBal = parseFloat(user.balance || 0);
                const newBal = (curBal - parseFloat(amount)).toFixed(2);
                localStorage.setItem('rupiksha_user', JSON.stringify({ ...user, balance: newBal }));
            }
            return data.success;
        } catch (e) { return false; }
    },

    getUserTransactions: async function (userId) {
        try {
            const res = await fetch(`${BACKEND_URL}/transactions?userId=${userId}`);
            const data = await res.json();
            return data.success ? data.transactions : [];
        } catch (e) { return []; }
    },

    // --- KYC ---
    uploadKyc: async function (kycData) {
        try {
            const res = await fetch(`${BACKEND_URL}/upload-kyc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kycData)
            });
            return await res.json();
        } catch (e) { return { success: false, message: "KYC Upload Failed" }; }
    },

    getKycStatus: async function (userId) {
        try {
            const res = await fetch(`${BACKEND_URL}/kyc-status?userId=${userId}`);
            const data = await res.json();
            return data.success ? data.documents : [];
        } catch (e) { return []; }
    },

    // --- SUPPORT ---
    raiseTicket: async function (ticketData) {
        try {
            const res = await fetch(`${BACKEND_URL}/raise-ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
            return await res.json();
        } catch (e) { return { success: false, message: "Failed to raise ticket" }; }
    },

    getMyTickets: async function (userId) {
        try {
            const res = await fetch(`${BACKEND_URL}/my-tickets?userId=${userId}`);
            const data = await res.json();
            return data.success ? data.tickets : [];
        } catch (e) { return []; }
    },

    // --- PORTAL CONFIG ---
    getPortalConfig: async function () {
        try {
            const res = await fetch(`${BACKEND_URL}/portal-config`);
            const data = await res.json();
            return data.success ? data.config : null;
        } catch (e) { return null; }
    },

    getCommissions: async function () {
        try {
            const res = await fetch(`${BACKEND_URL}/commissions`);
            const data = await res.json();
            return data.success ? data.commissions : [];
        } catch (e) { return []; }
    },

    // --- HELPERS ---
    verifyLocation: function () {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation not supported');
            } else {
                navigator.geolocation.getCurrentPosition(
                    (p) => resolve({ lat: p.coords.latitude.toFixed(6), long: p.coords.longitude.toFixed(6) }),
                    (e) => reject('Location access denied')
                );
            }
        });
    },

    generateOTP: function () {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    sendEmployeeVerificationOTP: async function (email, name) {
        const otp = this.generateOTP();
        const res = await sendOTPEmail(email, otp, name);
        if (res.success) {
            return { success: true, otp };
        }
        return res;
    },

    sendEmployeeLoginOTP: async function (email, name) {
        const otp = this.generateOTP();
        const res = await sendOTPEmail(email, otp, name);
        if (res.success) {
            return { success: true, otp };
        }
        return res;
    },

    sendEmployeeCredentials: async function (email, name, loginId, password, addedBy, role) {
        return await sendCredentialsEmail({
            to: email,
            name: name,
            loginId: loginId,
            password: password,
            addedBy: addedBy,
            portalType: role
        });
    },

    // --- ADMIN OVERSIGHT ---
    getAllUsers: async function () {
        let users = [];
        try {
            const res = await fetch(`${BACKEND_URL}/all-users`);
            const data = await res.json();
            if (data.success) users = data.users;
        } catch (e) { }

        // Merge with local storage
        const local = this.getData();
        local.users.forEach(u => {
            if (!users.find(bu => bu.username === u.username)) {
                users.push(u);
            }
        });
        return users;
    },

    getAllTransactions: async function () {
        try {
            const res = await fetch(`${BACKEND_URL}/all-transactions`);
            const data = await res.json();
            return data.success ? data.transactions : [];
        } catch (e) { return []; }
    },

    getTrashUsers: async function () {
        try {
            const res = await fetch(`${BACKEND_URL}/trash-users`);
            const data = await res.json();
            return data.success ? data.users : [];
        } catch (e) { return []; }
    },

    deleteUser: async function (username) {
        try {
            const res = await fetch(`${BACKEND_URL}/delete-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            return await res.json();
        } catch (e) { return { success: false }; }
    },

    restoreUser: async function (username) {
        try {
            const res = await fetch(`${BACKEND_URL}/restore-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            return await res.json();
        } catch (e) { return { success: false }; }
    },

    resendCredentials: async function (user) {
        try {
            const res = await fetch(`${BACKEND_URL}/send-credentials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    name: user.name,
                    login_id: user.username || user.mobile,
                    password: user.password,
                    added_by: 'Administrator',
                    portal_type: user.role
                })
            });
            return await res.json();
        } catch (e) { return { success: false }; }
    },

    getData: function () {
        const d = localStorage.getItem('rupiksha_data');
        let data = d ? JSON.parse(d) : null;

        if (!data) {
            data = {
                users: [],
                transactions: [],
                news: "Welcome to Rupiksha Fintech Admin Panel!",
                chartTitle: "Weekly Volume Activity",
                chartData: [
                    { name: 'Mon', value: 400 }, { name: 'Tue', value: 300 },
                    { name: 'Wed', value: 600 }, { name: 'Thu', value: 800 },
                    { name: 'Fri', value: 500 }, { name: 'Sat', value: 900 },
                    { name: 'Sun', value: 700 }
                ],
                quickActions: [
                    { title: "Wallet Topup", subTitle: "Add funds to wallet", icon: "Wallet" },
                    { title: "Manage Store", subTitle: "Edit store profile", icon: "Building2" }
                ],
                stats: {
                    todayActive: "1,240",
                    weeklyActive: "8,500",
                    monthlyActive: "32,000",
                    debitSale: "₹ 45.8 Cr",
                    labels: {
                        today: { title: "TODAY ACTIVE" },
                        weekly: { title: "WEEKLY ACTIVE" },
                        monthly: { title: "MONTHLY ACTIVE" },
                        debit: { title: "TOTAL DEBIT" }
                    }
                },
                wallet: { balance: "24,500.00", retailerName: "Premium Retailer" },
                services: [
                    {
                        category: 'Banking & Finance',
                        items: [
                            { label: 'AEPS Withdrawal', icon: 'zap', active: true },
                            { label: 'Money Transfer', icon: 'send', active: true }
                        ]
                    }
                ]
            };
        }

        // Ensure sub-properties exist to prevent crashes
        if (!data.stats) data.stats = { todayActive: "0", weeklyActive: "0", monthlyActive: "0", debitSale: "₹ 0", labels: { today: { title: "TODAY ACTIVE" }, weekly: { title: "WEEKLY ACTIVE" }, monthly: { title: "MONTHLY ACTIVE" }, debit: { title: "TOTAL DEBIT" } } };
        if (!data.users) data.users = [];
        if (!data.wallet) data.wallet = { balance: "0.00", retailerName: "Retailer" };

        const user = localStorage.getItem('rupiksha_user');
        if (user) data.currentUser = JSON.parse(user);
        return data;
    },

    saveData: function (data) {
        if (data && data.currentUser) {
            localStorage.setItem('rupiksha_user', JSON.stringify(data.currentUser));
        }
        localStorage.setItem('rupiksha_data', JSON.stringify(data));
        window.dispatchEvent(new Event('dataUpdated'));
    },

    getUserByUsername: function (username) {
        const data = this.getData();
        return data.users.find(u => u.username === username || u.mobile === username);
    },

    approveUser: async function (username, password, partyCode, parentId = null) {
        try {
            await fetch(`${BACKEND_URL}/approve-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, status: 'Approved', partyCode, parent_id: parentId })
            });
        } catch (e) { console.error("DB Update failed", e); }

        const data = this.getData();
        const userIdx = data.users.findIndex(u => u.username === username);
        if (userIdx !== -1) {
            data.users[userIdx].status = 'Approved';
            data.users[userIdx].password = password;
            data.users[userIdx].partyCode = partyCode;
            if (parentId) data.users[userIdx].ownerId = parentId;
            this.saveData(data);
        }
    },

    updateUserRole: async function (username, newRole) {
        try {
            const res = await fetch(`${BACKEND_URL}/update-user-role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, newRole })
            });
            const resData = await res.json();
            if (resData.success) {
                const data = this.getData();
                const userIdx = data.users.findIndex(u => u.username === username);
                if (userIdx !== -1) {
                    data.users[userIdx].role = newRole;
                    this.saveData(data);
                }
                return { success: true };
            }
            return resData;
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    rejectUser: async function (username) {
        try {
            await fetch(`${BACKEND_URL}/approve-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, status: 'Rejected' })
            });
        } catch (e) { }

        const data = this.getData();
        data.users = data.users.filter(u => u.username !== username);
        this.saveData(data);
    },

    resetData: function () {
        localStorage.removeItem('rupiksha_data');
        window.dispatchEvent(new Event('dataUpdated'));
    }
};

export default dataService;
