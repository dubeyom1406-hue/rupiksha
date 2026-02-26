export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://localhost:5001/api`;

export const dataService = {
    // --- AUTH & LOGIN ---
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
            return { success: false, message: data.message };
        } catch (e) {
            return { success: false, message: "Server connection failed" };
        }
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

    // --- ADMIN OVERSIGHT ---
    getAllUsers: async function () {
        try {
            const res = await fetch(`${BACKEND_URL}/all-users`);
            const data = await res.json();
            return data.success ? data.users : [];
        } catch (e) { return []; }
    },

    getAllTransactions: async function () {
        try {
            const res = await fetch(`${BACKEND_URL}/all-transactions`);
            const data = await res.json();
            return data.success ? data.transactions : [];
        } catch (e) { return []; }
    },

    getData: function () {
        const d = localStorage.getItem('rupiksha_data');
        const data = d ? JSON.parse(d) : { users: [], transactions: [] };
        // Merge in currentUser for legacy support
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
