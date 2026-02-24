/**
 * sharedDataService.js
 * Single source of truth for all Distributors.
 * Retailers are managed by dataService.js (rupiksha_data_v21).
 * Admin reads BOTH stores.
 */

const DIST_KEY = 'rupiksha_distributor_accounts';
const SA_KEY = 'rupiksha_superadmin_accounts';

const DEFAULT_SUPERADMINS = [
    {
        id: 'SA-2024-0001',
        username: 'superadmin',
        mobile: '8888888888',
        password: 'admin',
        name: 'RUPIKSHA SUPER ADMIN',
        email: 'admin@rupiksha.com',
        status: 'Approved',
        wallet: { balance: '99,99,99,999.00' },
        createdAt: new Date('2024-01-01').toISOString(),
    }
];

const DEFAULT_DISTRIBUTORS = [
    {
        id: 'DIST-2024-0001',
        username: 'dist001',
        mobile: '9876543210',
        password: 'dist123',
        name: 'JAY MATA DEE ENT.',
        businessName: 'Jay Mata Dee Enterprises',
        email: 'jaymataadee@example.com',
        state: 'Uttar Pradesh',
        city: 'Lucknow',
        pincode: '226001',
        status: 'Approved',
        wallet: { balance: '3,48,200.00' },
        assignedRetailers: [],
        totalTxns: 0,
        commissionEarned: '0.00',
        createdAt: new Date('2024-01-15').toISOString(),
        approvedAt: new Date('2024-01-16').toISOString(),
    }
];

export const sharedDataService = {

    // ── Distributor CRUD ────────────────────────────────────────────────────

    getAllDistributors: () => {
        try {
            const raw = localStorage.getItem(DIST_KEY);
            if (!raw || JSON.parse(raw).length === 0) {
                // seed defaults on first load or if empty
                localStorage.setItem(DIST_KEY, JSON.stringify(DEFAULT_DISTRIBUTORS));
                return DEFAULT_DISTRIBUTORS;
            }
            return JSON.parse(raw);
        } catch { return DEFAULT_DISTRIBUTORS; }
    },

    saveAllDistributors: (distributors) => {
        localStorage.setItem(DIST_KEY, JSON.stringify(distributors));
        window.dispatchEvent(new Event('distributorDataUpdated'));
    },

    getDistributorById: (id) => {
        return sharedDataService.getAllDistributors().find(d => d.id === id);
    },

    getDistributorByCredential: (usernameOrMobile, password) => {
        const all = sharedDataService.getAllDistributors();
        return all.find(
            d => (d.username === usernameOrMobile || d.mobile === usernameOrMobile)
                && d.password === password
        );
    },

    registerDistributor: (formData, ownerId = null) => {
        const all = sharedDataService.getAllDistributors();
        const newId = `DIST-${new Date().getFullYear()}-${String(all.length + 1).padStart(4, '0')}`;
        const newDist = {
            id: newId,
            username: formData.mobile,
            mobile: formData.mobile,
            password: formData.password || 'dist123',
            name: formData.name,
            businessName: formData.businessName,
            email: formData.email,
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            status: 'Approved', // Direct addition bypasses pending
            wallet: { balance: '0.00' },
            assignedRetailers: [],
            ownerId: ownerId, // SuperAdmin ID
            createdAt: new Date().toISOString(),
        };
        const updated = [newDist, ...all];
        sharedDataService.saveAllDistributors(updated);
        return newDist;
    },

    approveDistributor: (id, password, distribId) => {
        const all = sharedDataService.getAllDistributors();
        const updated = all.map(d => d.id === id
            ? { ...d, status: 'Approved', password, distribId, approvedAt: new Date().toISOString() }
            : d
        );
        sharedDataService.saveAllDistributors(updated);
        return true;
    },

    rejectDistributor: (id) => {
        const all = sharedDataService.getAllDistributors().filter(d => d.id !== id);
        sharedDataService.saveAllDistributors(all);
        return true;
    },

    updateDistributorWallet: (id, newBalance) => {
        const all = sharedDataService.getAllDistributors();
        const updated = all.map(d => d.id === id
            ? { ...d, wallet: { ...d.wallet, balance: newBalance } }
            : d
        );
        sharedDataService.saveAllDistributors(updated);
    },

    // ── Retailer ↔ Distributor Assignment ──────────────────────────────────

    assignRetailerToDistributor: (distId, retailerUsername) => {
        const all = sharedDataService.getAllDistributors();
        const updated = all.map(d => {
            if (d.id !== distId) return d;
            const current = d.assignedRetailers || [];
            if (current.includes(retailerUsername)) return d;
            return { ...d, assignedRetailers: [...current, retailerUsername] };
        });
        sharedDataService.saveAllDistributors(updated);
        return true;
    },

    unassignRetailerFromDistributor: (distId, retailerUsername) => {
        const all = sharedDataService.getAllDistributors();
        const updated = all.map(d => d.id !== distId ? d : {
            ...d,
            assignedRetailers: (d.assignedRetailers || []).filter(u => u !== retailerUsername)
        });
        sharedDataService.saveAllDistributors(updated);
        return true;
    },

    getRetailersForDistributor: (distId) => {
        const dist = sharedDataService.getDistributorById(distId);
        return dist ? (dist.assignedRetailers || []) : [];
    },

    getDistributorForRetailer: (retailerUsername) => {
        const all = sharedDataService.getAllDistributors();
        return all.find(d => (d.assignedRetailers || []).includes(retailerUsername)) || null;
    },

    updateDistributorStatus: (id, status) => {
        const all = sharedDataService.getAllDistributors();
        const updated = all.map(d => {
            if (d.id === id) {
                // If approving, make sure there's a password
                const password = d.password || 'dist123';
                return { ...d, status, password };
            }
            return d;
        });
        sharedDataService.saveAllDistributors(updated);
        window.dispatchEvent(new CustomEvent('distributorDataUpdated'));
    },

    // ── Session helpers ────────────────────────────────────────────────────

    setCurrentDistributor: (dist) => {
        sessionStorage.setItem('distributor_user', JSON.stringify(dist));
    },

    getCurrentDistributor: () => {
        try {
            const raw = sessionStorage.getItem('distributor_user');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    logoutDistributor: () => {
        sessionStorage.removeItem('distributor_user');
    },

    // ── SuperAdmin CRUD & Session ──────────────────────────────────────────

    getAllSuperAdmins: () => {
        try {
            const raw = localStorage.getItem(SA_KEY);
            if (!raw || JSON.parse(raw).length === 0) {
                localStorage.setItem(SA_KEY, JSON.stringify(DEFAULT_SUPERADMINS));
                return DEFAULT_SUPERADMINS;
            }
            return JSON.parse(raw);
        } catch { return DEFAULT_SUPERADMINS; }
    },

    saveAllSuperAdmins: (admins) => {
        localStorage.setItem(SA_KEY, JSON.stringify(admins));
        window.dispatchEvent(new Event('superadminDataUpdated'));
    },

    getSuperAdminById: (id) => {
        return sharedDataService.getAllSuperAdmins().find(s => s.id === id);
    },

    getSuperAdminByCredential: (usernameOrMobile, password) => {
        const all = sharedDataService.getAllSuperAdmins();
        return all.find(
            s => (s.username === usernameOrMobile || s.mobile === usernameOrMobile)
                && s.password === password
        );
    },

    registerSuperAdmin: (formData) => {
        const all = sharedDataService.getAllSuperAdmins();
        const newId = `SUP${Math.floor(100000 + Math.random() * 900000)}`;
        const newSA = {
            id: newId,
            username: formData.mobile,
            mobile: formData.mobile,
            password: formData.password || '',
            name: formData.name,
            businessName: formData.businessName,
            email: formData.email,
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            status: 'Pending',
            wallet: { balance: '0.00' },
            createdAt: new Date().toISOString(),
        };
        const updated = [newSA, ...all];
        sharedDataService.saveAllSuperAdmins(updated);
        return newSA;
    },

    approveSuperAdmin: (id, password) => {
        const all = sharedDataService.getAllSuperAdmins();
        const updated = all.map(s => s.id === id
            ? { ...s, status: 'Approved', password, approvedAt: new Date().toISOString() }
            : s
        );
        sharedDataService.saveAllSuperAdmins(updated);
        return true;
    },

    rejectSuperAdmin: (id) => {
        const all = sharedDataService.getAllSuperAdmins().filter(s => s.id !== id);
        sharedDataService.saveAllSuperAdmins(all);
        return true;
    },

    setCurrentSuperAdmin: (sa) => {
        sessionStorage.setItem('superadmin_user', JSON.stringify(sa));
    },

    getCurrentSuperAdmin: () => {
        try {
            const raw = sessionStorage.getItem('superadmin_user');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    logoutSuperAdmin: () => {
        sessionStorage.removeItem('superadmin_user');
    },

    // ── Reset / Data Management ────────────────────────────────────────────

    resetToDefaults: () => {
        localStorage.removeItem(DIST_KEY);
        localStorage.removeItem(SA_KEY);
        sessionStorage.removeItem('distributor_user');
        sessionStorage.removeItem('superadmin_user');
        localStorage.setItem(DIST_KEY, JSON.stringify(DEFAULT_DISTRIBUTORS));
        localStorage.setItem(SA_KEY, JSON.stringify(DEFAULT_SUPERADMINS));
        window.dispatchEvent(new Event('distributorDataUpdated'));
        window.dispatchEvent(new Event('superadminDataUpdated'));
        return DEFAULT_DISTRIBUTORS;
    },

    updateSuperAdmin: (id, patch) => {
        const all = sharedDataService.getAllSuperAdmins();
        const updated = all.map(s => s.id === id ? { ...s, ...patch } : s);
        sharedDataService.saveAllSuperAdmins(updated);
        // also refresh session
        const current = sharedDataService.getCurrentSuperAdmin();
        if (current && current.id === id) {
            sharedDataService.setCurrentSuperAdmin({ ...current, ...patch });
        }
        return true;
    },

    clearCurrentSession: () => {
        sessionStorage.removeItem('distributor_user');
        sessionStorage.removeItem('superadmin_user');
    },
};
