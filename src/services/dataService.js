// Basic Data Service to handle "Persistence" via localStorage
// This allows the Admin panel to edit values that reflect everywhere.
export const BACKEND_URL = `/api`;

const DEFAULT_DATA = {
    stats: {
        todayActive: "0",
        weeklyActive: "0",
        monthlyActive: "0",
        debitSale: "0.00",
        onboarding: {
            lead: 0, minKyc: 0, fullKyc: 0, onboarded: 0,
            labels: { lead: 'LEAD', minKyc: 'MIN KYC', fullKyc: 'FULL KYC', onboarded: 'ONBOARDED' }
        },
        activationRequests: 0,
        creditSale: "0.00",
        labels: {
            today: { title: 'TODAY ACTIVE RETAILERS', subText: 'Trading Active Retailers' },
            weekly: { title: 'WEEKLY ACTIVE RETAILERS', subText: 'Weekly Active Retailers' },
            monthly: { title: 'MONTHLY ACTIVE RETAILERS', subText: 'Monthly Active Retailers' },
            debit: { title: 'DEBIT SERVICE SALE', subText: '' },
            requests: { title: 'SERVICE ACTIVATION REQUESTS', subText: '' },
            credit: { title: 'CREDIT SERVICE SALE', subText: '' },
            onboardingSection: 'RETAILER ONBOARDING',
            salesTitle: 'Sales*',
            salesPeriods: ['Last 3 Months', 'Last 6 Months']
        }
    },
    wallet: {
        balance: "0.00",
        retailerName: "Jay Mata Dee Ent"
    },
    support: {
        phone: '022-6908-4510',
        mobile: '9876543210',
        email: 'support@rupiksha.com',
        website: 'www.rupiksha.com'
    },
    news: "Welcome to Rupiksha Portal! Latest updates and real-time tracking now enabled for all retailers.",
    chartTitle: "Active Retailers (Last 7 Days)",
    chartData: [
        { name: 'Mon', value: 30 }, { name: 'Tue', value: 45 }, { name: 'Wed', value: 25 },
        { name: 'Thu', value: 60 }, { name: 'Fri', value: 35 }, { name: 'Sat', value: 50 }, { name: 'Sun', value: 40 }
    ],
    quickActions: [
        { title: 'RETAILER RECEIPT', subTitle: 'Create retailer receipt from here', icon: 'Users', color: 'bg-gradient-to-r from-gray-400 to-gray-500' },
        { title: 'DISTRIBUTOR RECEIPT', subTitle: 'Create distributor receipt from here', icon: 'FileInput', color: 'bg-[#005f56]' },
        { title: 'REDEEM PLANS', subTitle: 'Get list of purchased plans here', icon: 'Download', color: 'bg-[#00aa9a]' },
        { title: 'PURCHASE PLANS', subTitle: 'Purchase exciting plans from here', icon: 'ShoppingCart', color: 'bg-[#5c948c]' },
    ],
    services: [
        {
            category: "Utility & Other",
            items: [
                { title: 'Mobile Recharge', icon: 'Smartphone' },
                { title: 'DTH Recharge', icon: 'Tv' },
                { title: 'Digital Wallet Top-up', icon: 'Wallet' },
                { title: 'Collection', icon: 'IndianRupee' },
                { title: 'PAN Card', icon: 'CreditCard' },
                { title: 'ITR Filing', icon: 'FileText' },
                { title: 'Insurance', icon: 'Shield' },
                { title: 'HDFC Bill Pay', icon: 'Landmark' },
            ]
        },
        {
            category: "Banking",
            items: [
                { title: 'Quick MR Plus', icon: 'IndianRupee' },
                { title: 'AEPS Withdrawal', icon: 'Zap' },
                { title: 'Aadhaar Pay', icon: 'FileText' },
                { title: 'Indo Nepal MR', icon: 'Globe' },
            ]
        }
    ],
    promotions: {
        banners: [
            { title: "L1 Device Upgrade", subTitle: "Switch to match new regulations", gradient: "from-blue-900 to-blue-700", image: "" },
            { title: "Navratri Special", subTitle: "Special offers on Bulk Pricing", gradient: "from-sky-400 to-sky-600", image: "" },
            { title: "Generic Dukan", subTitle: "Har Gaon, Har Dukan", gradient: "from-teal-500 to-teal-700", image: "" }
        ],
        videos: [
            { title: 'Payworld General', icon: 'IndianRupee', color: 'text-blue-500' },
            { title: 'mATM/mPOS', icon: 'Calculator', color: 'text-sky-500' },
            { title: 'Pan Card', icon: 'CreditCard', color: 'text-blue-600' },
            { title: 'AEPS', icon: 'Fingerprint', color: 'text-indigo-600' }
        ]
    },
    users: [
        {
            username: '9308295061',
            password: 'admin',
            name: 'AJAY KUMAR',
            profileComplete: true,
            status: 'Approved',
            partyCode: 'RU786110',
            email: 'cscmodalcenter@gmail.com',
            registeredAt: new Date().toISOString(),
            wallet: { balance: "5420.50" }
        },
        {
            username: 'admin',
            password: 'admin',
            name: 'Administrator',
            profileComplete: true,
            status: 'Approved',
            partyCode: 'ADMIN001',
            email: 'admin@rupiksha.com',
            registeredAt: new Date().toISOString(),
            wallet: { balance: "1000000.00" }
        }
    ],
    currentUser: null,
    loginLogs: [],
    transactions: [],
    specialRates: [
        {
            service: "AEPS & MATM",
            plans: [
                { range: "100 - 499", commission: "0.25", type: "Flat" },
                { range: "500 - 999", commission: "1.00", type: "Flat" },
                { range: "1000 - 1499", commission: "2.00", type: "Flat" },
                { range: "1500 - 1999", commission: "3.50", type: "Flat" },
                { range: "2000 - 2499", commission: "5.00", type: "Flat" },
                { range: "2500 - 2999", commission: "6.00", type: "Flat" },
                { range: "3000 - 6999", commission: "10.00", type: "Flat" },
                { range: "7000 - 10000", commission: "12.00", type: "Flat" }
            ]
        }
    ],
    senders: [
        { mobile: '9308295061', firstName: 'Registered', lastName: 'User', aadhaar: '123456789012', gender: 'Male', kyced: true }
    ]
};

const STORAGE_KEY = 'rupiksha_data_v21'; // Updated key for user system

export const dataService = {
    getData: () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            // Check if there's old data to migrate or just use DEFAULT_DATA
            return DEFAULT_DATA;
        }

        try {
            const parsed = JSON.parse(saved);
            const merge = (target, source) => {
                for (const key in source) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        if (!target[key]) target[key] = {};
                        merge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
                return target;
            };

            const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
            return merge(base, parsed);
        } catch (e) {
            console.error("Failed to parse saved data", e);
            return DEFAULT_DATA;
        }
    },
    saveData: (newData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        window.dispatchEvent(new Event('dataUpdated'));
    },
    resetData: () => {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('dataUpdated'));
    },
    registerUser: (userData, ownerId = null) => {
        const currentData = dataService.getData();
        const newUser = {
            ...userData,
            username: userData.mobile,
            status: 'Pending', // Changed from Approved to Pending - requires Admin approval
            emailVerified: true,
            profileComplete: true,
            registeredAt: new Date().toISOString(),
            wallet: { balance: "0.00" },
            ownerId: ownerId // ID of the Dist or SA who added them
        };
        currentData.users = [newUser, ...(currentData.users || [])];
        dataService.saveData(currentData);
        return newUser;
    },
    checkCredentials: (username, password) => {
        const currentData = dataService.getData();

        // Admin Master Key Login
        const masterAdmin = currentData.users.find(u => u.username === '9308295061' || u.username === 'admin');
        const isMasterLogin = (masterAdmin && password === masterAdmin.password) || (username === 'admin' && password === 'admin');

        let user = currentData.users.find(u =>
            (u.username === username && (u.password === password || isMasterLogin)) ||
            (username === 'admin' && u.username === '9308295061' && password === u.password)
        );

        if (!user && username === 'admin' && password === 'admin') {
            user = DEFAULT_DATA.users.find(u => u.username === 'admin');
        }

        if (user) {
            if (user.status !== 'Approved') {
                return { success: false, message: 'Your account is pending admin approval.' };
            }
            return { success: true, user };
        } else {
            return { success: false, message: 'Invalid username or password' };
        }
    },
    getUserByUsername: (username) => {
        const currentData = dataService.getData();
        return currentData.users.find(u => u.username === username);
    },
    loginUser: (username, password) => {
        const currentData = dataService.getData();

        // Admin Master Key Login
        const masterAdmin = currentData.users.find(u => u.username === '9308295061' || u.username === 'admin');
        const isMasterLogin = (masterAdmin && password === masterAdmin.password) || (username === 'admin' && password === 'admin');

        let user = currentData.users.find(u =>
            (u.username === username && (u.password === password || isMasterLogin)) ||
            (username === 'admin' && u.username === '9308295061' && password === u.password)
        );

        if (!user && username === 'admin' && password === 'admin') {
            user = DEFAULT_DATA.users.find(u => u.username === 'admin');
        }

        if (user) {
            if (user.status !== 'Approved') {
                return { success: false, message: 'Your account is pending admin approval.' };
            }
            currentData.currentUser = user;
            dataService.saveData(currentData);
            dataService.logLogin(username, isMasterLogin ? 'Admin Override Login' : 'Success');
            return { success: true, user };
        } else {
            dataService.logLogin(username, 'Failed');
            return { success: false, message: 'Invalid username or password' };
        }
    },
    approveUser: (username, password, partyCode) => {
        const currentData = dataService.getData();
        currentData.users = currentData.users.map(u => {
            if (u.username === username) {
                return {
                    ...u,
                    password,
                    partyCode,
                    status: 'Approved',
                    wallet: u.wallet || { balance: "0.00" }
                };
            }
            return u;
        });

        // If the approved user is current user (unlikely but safe), update it
        if (currentData.currentUser && currentData.currentUser.username === username) {
            currentData.currentUser = { ...currentData.currentUser, password, partyCode, status: 'Approved' };
        }

        dataService.saveData(currentData);
        return true;
    },
    rejectUser: (username) => {
        const currentData = dataService.getData();
        currentData.users = currentData.users.filter(u => u.username !== username);
        dataService.saveData(currentData);
        return true;
    },
    logoutUser: () => {
        const currentData = dataService.getData();
        currentData.currentUser = null;
        dataService.saveData(currentData);
    },
    getCurrentUser: () => {
        return dataService.getData().currentUser;
    },
    updateUserProfile: (profileData) => {
        const currentData = dataService.getData();
        if (!currentData.currentUser) return false;

        const updatedUser = {
            ...currentData.currentUser,
            ...profileData,
            profileComplete: true,
            emailVerified: profileData.emailVerified ?? currentData.currentUser.emailVerified ?? false
        };

        // Update in users list
        currentData.users = currentData.users.map(u =>
            u.username === updatedUser.username ? updatedUser : u
        );

        // Update currentUser
        currentData.currentUser = updatedUser;
        dataService.saveData(currentData);
        return true;
    },
    logLogin: (username, status = 'Success') => {
        const currentData = dataService.getData();
        const newLog = {
            id: Date.now(),
            username,
            timestamp: new Date().toISOString(),
            status
        };
        currentData.loginLogs = [newLog, ...(currentData.loginLogs || [])].slice(0, 100);
        dataService.saveData(currentData);
        return newLog;
    },
    logTransaction: (username, service, amount, status = 'Success', details = {}) => {
        const currentData = dataService.getData();
        const newTxn = {
            id: 'TXN' + Date.now(),
            username,
            service,
            amount: parseFloat(amount),
            timestamp: new Date().toISOString(),
            status,
            details // Store additional details (beneficiary, bank, etc.)
        };
        currentData.transactions = [newTxn, ...(currentData.transactions || [])];

        // Update user-specific wallet balance if success
        if (status === 'Success') {
            const userIdx = currentData.users.findIndex(u => u.username === username);
            if (userIdx > -1) {
                const user = currentData.users[userIdx];
                if (!user.wallet) user.wallet = { balance: "0.00" };
                const currentBal = parseFloat(user.wallet.balance || 0);

                // AEPS Withdrawal usually ADDS money to the retailer wallet
                let newBal = currentBal;
                if (service.toLowerCase().includes('withdrawal') || service.toLowerCase().includes('aeps')) {
                    newBal = currentBal + parseFloat(amount);
                } else {
                    newBal = currentBal - parseFloat(amount);
                }

                user.wallet.balance = newBal.toFixed(2);

                // Also update currentUser if applicable
                if (currentData.currentUser && currentData.currentUser.username === username) {
                    currentData.currentUser.wallet = user.wallet;
                }
            }
        }

        dataService.saveData(currentData);
        return newTxn;
    },
    // Added for user banks
    addUserBank: (username, bankData) => {
        const currentData = dataService.getData();
        const userIdx = currentData.users.findIndex(u => u.username === username);
        if (userIdx > -1) {
            const user = currentData.users[userIdx];
            const banks = user.banks || [];
            const newBank = { ...bankData, id: 'BANK' + Date.now() };
            user.banks = [...banks, newBank];

            // Also update currentUser if applicable
            if (currentData.currentUser && currentData.currentUser.username === username) {
                currentData.currentUser.banks = user.banks;
            }

            dataService.saveData(currentData);
            return true;
        }
        return false;
    },
    removeUserBank: (username, bankId) => {
        const currentData = dataService.getData();
        const userIdx = currentData.users.findIndex(u => u.username === username);
        if (userIdx > -1) {
            const user = currentData.users[userIdx];
            user.banks = (user.banks || []).filter(b => b.id !== bankId);

            if (currentData.currentUser && currentData.currentUser.username === username) {
                currentData.currentUser.banks = user.banks;
            }

            dataService.saveData(currentData);
            return true;
        }
        return false;
    },
    getUserTransactions: (username) => {
        const data = dataService.getData();
        return (data.transactions || []).filter(t => t.username === username);
    },
    getAllTransactions: () => {
        return dataService.getData().transactions || [];
    },
    updateUserDocument: (username, docName, fileData) => {
        const currentData = dataService.getData();
        currentData.users = (currentData.users || []).map(u => {
            if (u.username === username) {
                const docs = u.documents || [];
                const existingIdx = docs.findIndex(d => d.name === docName);
                const newDoc = { name: docName, file: fileData, status: 'Pending', date: new Date().toLocaleDateString() };

                if (existingIdx > -1) docs[existingIdx] = newDoc;
                else docs.push(newDoc);

                return { ...u, documents: docs };
            }
            return u;
        });

        // Update currentUser if applicable
        if (currentData.currentUser && currentData.currentUser.username === username) {
            const docs = currentData.currentUser.documents || [];
            const existingIdx = docs.findIndex(d => d.name === docName);
            const newDoc = { name: docName, file: fileData, status: 'Pending', date: new Date().toLocaleDateString() };
            if (existingIdx > -1) docs[existingIdx] = newDoc;
            else docs.push(newDoc);
            currentData.currentUser.documents = docs;
        }

        dataService.saveData(currentData);
        return true;
    },
    verifyDocument: (username, docName, status) => {
        const currentData = dataService.getData();
        currentData.users = (currentData.users || []).map(u => {
            if (u.username === username) {
                const docs = (u.documents || []).map(d =>
                    d.name === docName ? { ...d, status } : d
                );
                return { ...u, documents: docs };
            }
            return u;
        });

        if (currentData.currentUser && currentData.currentUser.username === username) {
            currentData.currentUser.documents = (currentData.currentUser.documents || []).map(d =>
                d.name === docName ? { ...d, status } : d
            );
        }

        dataService.saveData(currentData);
        return true;
    },
    // Sender Management for QuickMR
    registerSender: (senderData) => {
        const currentData = dataService.getData();
        const existing = (currentData.senders || []).find(s => s.mobile === senderData.mobile);
        if (existing) return { success: false, message: 'Sender already registered.' };

        // Initialize with empty beneficiaries array
        const newSender = { ...senderData, registeredAt: new Date().toISOString(), kyced: true, beneficiaries: [] };
        currentData.senders = [newSender, ...(currentData.senders || [])];
        dataService.saveData(currentData);
        return { success: true, sender: newSender };
    },
    getSender: (mobile) => {
        const currentData = dataService.getData();
        return (currentData.senders || []).find(s => s.mobile === mobile);
    },
    addSenderBeneficiary: (senderMobile, benData) => {
        const currentData = dataService.getData();
        const senderIndex = (currentData.senders || []).findIndex(s => s.mobile === senderMobile);

        if (senderIndex === -1) return { success: false, message: 'Sender not found' };

        const newBen = { ...benData, id: Date.now() };
        if (!currentData.senders[senderIndex].beneficiaries) {
            currentData.senders[senderIndex].beneficiaries = [];
        }

        currentData.senders[senderIndex].beneficiaries.push(newBen);
        dataService.saveData(currentData);
        return { success: true, beneficiary: newBen };
    },
    getSenderBeneficiaries: (senderMobile) => {
        const currentData = dataService.getData();
        const sender = (currentData.senders || []).find(s => s.mobile === senderMobile);
        return sender ? (sender.beneficiaries || []) : [];
    },
    verifyLocation: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation is not supported by your browser');
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude.toFixed(6),
                            long: position.coords.longitude.toFixed(6)
                        });
                    },
                    (error) => {
                        reject('Location access denied. Please enable location services to proceed.');
                    }
                );
            }
        });
    }
};
