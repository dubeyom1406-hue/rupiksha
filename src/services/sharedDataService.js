import { BACKEND_URL } from './dataService';

export const sharedDataService = {

    // --- LEGACY STORAGE KEYS ---
    KEYS: {
        DISTRIBUTORS: 'rupiksha_distributors',
        SUPER_ADMINS: 'rupiksha_superadmins',
        ASSIGNMENTS: 'rupiksha_assignments'
    },

    // --- LIVE API METHODS ---
    getRetailersForDistributor: async (parentId) => {
        try {
            const res = await fetch(`${BACKEND_URL}/my-retailers?parentId=${parentId}`);
            const data = await res.json();
            return data.success ? data.retailers : [];
        } catch (e) { return []; }
    },

    // --- LEGACY / LOCAL METHODS (REQUIRED BY ADMIN PANEL) ---
    getAllDistributors: function () {
        const d = localStorage.getItem(this.KEYS.DISTRIBUTORS);
        return d ? JSON.parse(d) : [];
    },

    getAllSuperAdmins: function () {
        const s = localStorage.getItem(this.KEYS.SUPER_ADMINS);
        return s ? JSON.parse(s) : [];
    },

    saveDistributors: function (dists) {
        localStorage.setItem(this.KEYS.DISTRIBUTORS, JSON.stringify(dists));
        window.dispatchEvent(new Event('distributorDataUpdated'));
    },

    saveSuperAdmins: function (sas) {
        localStorage.setItem(this.KEYS.SUPER_ADMINS, JSON.stringify(sas));
        window.dispatchEvent(new Event('superadminDataUpdated'));
    },

    getDistributorById: function (id) {
        return this.getAllDistributors().find(d => d.id === id);
    },

    registerSuperAdmin: async function (data) {
        const password = data.password || '123456';
        const username = data.mobile || data.email;

        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    username: username,
                    password: password,
                    role: 'SUPER_DISTRIBUTOR',
                    status: 'Pending' // Requires Admin Approval
                })
            });
            const resData = await res.json();
            if (!resData.success) throw new Error(resData.message);

            const sas = this.getAllSuperAdmins();
            const newSA = {
                ...data,
                id: 'SD-' + Math.floor(1000 + Math.random() * 9000),
                role: 'SUPER_DISTRIBUTOR',
                balance: '0.00',
                wallet: { balance: '0.00' },
                assignedDistributors: [],
                status: 'Pending' // Sync local testing arrays
            };
            sas.push(newSA);
            this.saveSuperAdmins(sas);
            return resData;
        } catch (e) {
            console.error("DB Register Error:", e);
            throw e;
        }
    },

    registerDistributor: async function (data, ownerId = null) {
        const password = data.password || '123456';
        const username = data.mobile || data.email;

        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    username: username,
                    password: password,
                    role: 'DISTRIBUTOR',
                    parent_id: ownerId,
                    status: 'Pending' // Requires Admin Approval
                })
            });
            const resData = await res.json();
            if (!resData.success) throw new Error(resData.message);

            const dists = this.getAllDistributors();
            const newDist = {
                ...data,
                id: 'DT-' + Math.floor(1000 + Math.random() * 9000),
                role: 'DISTRIBUTOR',
                balance: '0.00',
                wallet: { balance: '0.00' },
                assignedRetailers: [],
                ownerId: ownerId,
                status: 'Pending' // Sync local testing arrays
            };
            dists.push(newDist);
            this.saveDistributors(dists);
            return resData; // Return backend result
        } catch (e) {
            console.error("DB Register Error:", e);
            throw e; // Re-throw to indicate failure
        }
    },

    approveDistributor: async function (id, password, distribId) {
        const dists = this.getAllDistributors();
        const idx = dists.findIndex(d => d.id === id);
        if (idx !== -1) {
            const dist = dists[idx];
            try {
                // Sync with DB
                await fetch(`${BACKEND_URL}/approve-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: dist.username || dist.mobile,
                        password: password,
                        status: 'Approved',
                        partyCode: distribId || dist.id
                    })
                });
            } catch (e) { }

            dists[idx].status = 'Approved';
            dists[idx].password = password;
            if (distribId) dists[idx].id = distribId;
            this.saveDistributors(dists);
        }
    },

    rejectDistributor: async function (id) {
        const dists = this.getAllDistributors();
        const dist = dists.find(d => d.id === id);
        if (dist) {
            try {
                await fetch(`${BACKEND_URL}/approve-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: dist.username || dist.mobile, status: 'Rejected' })
                });
            } catch (e) { }
        }
        this.saveDistributors(this.getAllDistributors().filter(d => d.id !== id));
    },

    approveSuperAdmin: async function (id, password) {
        const sas = this.getAllSuperAdmins();
        const idx = sas.findIndex(s => s.id === id);
        if (idx !== -1) {
            const sa = sas[idx];
            try {
                await fetch(`${BACKEND_URL}/approve-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: sa.username || sa.mobile,
                        password: password,
                        status: 'Approved'
                    })
                });
            } catch (e) { }

            sas[idx].status = 'Approved';
            sas[idx].password = password;
            this.saveSuperAdmins(sas);
        }
    },

    rejectSuperAdmin: async function (id) {
        const sas = this.getAllSuperAdmins();
        const sa = sas.find(s => s.id === id);
        if (sa) {
            try {
                await fetch(`${BACKEND_URL}/approve-user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: sa.username || sa.mobile, status: 'Rejected' })
                });
            } catch (e) { }
        }
        this.saveSuperAdmins(this.getAllSuperAdmins().filter(s => s.id !== id));
    },

    assignRetailerToDistributor: function (distId, retailerUsername) {
        const dists = this.getAllDistributors();
        const idx = dists.findIndex(d => d.id === distId);
        if (idx !== -1) {
            if (!dists[idx].assignedRetailers) dists[idx].assignedRetailers = [];
            if (!dists[idx].assignedRetailers.includes(retailerUsername)) {
                dists[idx].assignedRetailers.push(retailerUsername);
                this.saveDistributors(dists);
            }
        }
    },

    unassignRetailerFromDistributor: function (distId, retailerUsername) {
        const dists = this.getAllDistributors();
        const idx = dists.findIndex(d => d.id === distId);
        if (idx !== -1 && dists[idx].assignedRetailers) {
            dists[idx].assignedRetailers = dists[idx].assignedRetailers.filter(u => u !== retailerUsername);
            this.saveDistributors(dists);
        }
    },

    getDistributorForRetailer: function (retailerUsername) {
        const dists = this.getAllDistributors();
        return dists.find(d => d.assignedRetailers && d.assignedRetailers.includes(retailerUsername));
    },

    resetToDefaults: function () {
        localStorage.removeItem(this.KEYS.DISTRIBUTORS);
        localStorage.removeItem(this.KEYS.SUPER_ADMINS);
        window.dispatchEvent(new Event('distributorDataUpdated'));
        window.dispatchEvent(new Event('superadminDataUpdated'));
        return [];
    },

    // --- SESSION HELPERS ---
    getCurrentDistributor: () => {
        const saved = localStorage.getItem('rupiksha_user');
        if (!saved) return null;
        const user = JSON.parse(saved);
        return (user.role === 'DISTRIBUTOR') ? user : null;
    },

    setCurrentDistributor: (dist) => {
        localStorage.setItem('rupiksha_user', JSON.stringify(dist));
    },

    getCurrentSuperAdmin: () => {
        const saved = localStorage.getItem('rupiksha_user');
        if (!saved) return null;
        const user = JSON.parse(saved);
        return (user.role === 'SUPERADMIN' || user.role === 'SUPER_DISTRIBUTOR') ? user : null;
    },

    setCurrentSuperAdmin: (sa) => {
        localStorage.setItem('rupiksha_user', JSON.stringify(sa));
    },

    logout: () => {
        localStorage.removeItem('rupiksha_user');
        window.location.href = '/';
    }
};

export default sharedDataService;
