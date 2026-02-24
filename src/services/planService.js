/**
 * planService.js
 * Admin-controlled plan management for Retailers, Distributors & SuperDistributors.
 * All data lives in localStorage so it's shared across portals instantly.
 */

const PLAN_STORE_KEY = 'rupiksha_plan_templates';
const USER_PLAN_KEY = 'rupiksha_user_plans';      // { userId: planId }
const PLAN_HISTORY_KEY = 'rupiksha_plan_history';    // array of log events

/* ── Default plan templates ─────────────────────────────────── */
const DEFAULT_PLANS = {
    retailer: [
        {
            id: 'ret_basic',
            type: 'retailer',
            label: 'Basic',
            price: 0,
            color: '#3b82f6',
            gradient: 'from-blue-500 to-blue-700',
            maxTxnsPerDay: 50,
            maxTxnAmount: 10000,
            commissionRate: 0.25,
            features: ['AEPS', 'Money Transfer', 'Basic Reports', 'Email Support'],
            active: true,
        },
        {
            id: 'ret_silver',
            type: 'retailer',
            label: 'Silver',
            price: 1999,
            color: '#64748b',
            gradient: 'from-slate-500 to-slate-700',
            maxTxnsPerDay: 200,
            maxTxnAmount: 50000,
            commissionRate: 0.50,
            features: ['All Basic Features', 'BBPS/Recharge', 'DMT Enhanced', 'Phone Support'],
            active: true,
        },
        {
            id: 'ret_gold',
            type: 'retailer',
            label: 'Gold',
            price: 4999,
            color: '#f59e0b',
            gradient: 'from-amber-400 to-amber-600',
            maxTxnsPerDay: 1000,
            maxTxnAmount: 200000,
            commissionRate: 0.75,
            features: ['All Silver Features', 'PAN Card Service', 'Payout Hub', 'Priority Support', 'Advanced Reports'],
            active: true,
        },
        {
            id: 'ret_platinum',
            type: 'retailer',
            label: 'Platinum',
            price: 9999,
            color: '#8b5cf6',
            gradient: 'from-violet-500 to-purple-700',
            maxTxnsPerDay: 999999,
            maxTxnAmount: 999999,
            commissionRate: 1.00,
            features: ['Unlimited Transactions', 'API Access', 'White-label Branding', '24/7 Dedicated Support', 'Max Commission'],
            active: true,
        },
    ],
    distributor: [
        {
            id: 'dist_free',
            type: 'distributor',
            label: 'Free',
            price: 0,
            color: '#3b82f6',
            gradient: 'from-blue-500 to-blue-700',
            maxRetailers: 5,
            maxSubDist: 0,
            commissionRate: 0.20,
            features: ['5 Retailer IDs', 'Basic Dashboard', 'Email Support', 'Commission Tracking'],
            active: true,
        },
        {
            id: 'dist_standard',
            type: 'distributor',
            label: 'Standard',
            price: 5000,
            color: '#f59e0b',
            gradient: 'from-amber-500 to-orange-600',
            maxRetailers: 50,
            maxSubDist: 25,
            commissionRate: 0.40,
            features: ['50 Retailer IDs', '25 Sub-Distributors', 'Advanced Reports', 'Priority Support', 'Commission Slabs'],
            active: true,
        },
        {
            id: 'dist_premium',
            type: 'distributor',
            label: 'Premium',
            price: 10000,
            color: '#8b5cf6',
            gradient: 'from-indigo-600 to-purple-800',
            maxRetailers: 999999,
            maxSubDist: 999999,
            commissionRate: 0.60,
            features: ['Unlimited Retailers', 'Unlimited Sub-Distributors', 'API Access', '24/7 Support', 'White-label Branding'],
            active: true,
        },
    ],
    superdistributor: [
        {
            id: 'sd_basic',
            type: 'superdistributor',
            label: 'Basic',
            price: 0,
            color: '#64748b',
            gradient: 'from-slate-500 to-slate-700',
            maxDistributors: 5,
            maxRetailers: 100,
            commissionRate: 0.25,
            features: ['All Payment Services', 'Email Support', 'Basic Dashboard', 'Standard Commission'],
            active: true,
        },
        {
            id: 'sd_premium',
            type: 'superdistributor',
            label: 'Premium',
            price: 1999,
            color: '#f59e0b',
            gradient: 'from-amber-400 to-amber-600',
            maxDistributors: 25,
            maxRetailers: 500,
            commissionRate: 0.50,
            features: ['Priority Payouts', 'WhatsApp Support', 'Real-time Reports', 'Higher Commission (+0.2%)'],
            active: true,
        },
        {
            id: 'sd_elite',
            type: 'superdistributor',
            label: 'Elite',
            price: 4999,
            color: '#6366f1',
            gradient: 'from-indigo-500 to-indigo-700',
            maxDistributors: 999999,
            maxRetailers: 999999,
            commissionRate: 0.75,
            features: ['Dedicated Account Mgr', 'Instant Payouts', 'Custom Branding', 'Max Commission Tier'],
            active: true,
        },
    ],
};

/* ── Helpers ─────────────────────────────────────────────────── */
const dispatch = (event) => window.dispatchEvent(new Event(event));

export const planService = {

    // ── Plan Templates ────────────────────────────────────────────

    getAllPlans: () => {
        try {
            const raw = localStorage.getItem(PLAN_STORE_KEY);
            if (!raw) {
                localStorage.setItem(PLAN_STORE_KEY, JSON.stringify(DEFAULT_PLANS));
                return DEFAULT_PLANS;
            }
            return JSON.parse(raw);
        } catch { return DEFAULT_PLANS; }
    },

    savePlans: (plans) => {
        localStorage.setItem(PLAN_STORE_KEY, JSON.stringify(plans));
        dispatch('planDataUpdated');
    },

    getPlansForType: (type) => {
        return planService.getAllPlans()[type] || [];
    },

    getPlanById: (planId) => {
        const all = planService.getAllPlans();
        for (const type of Object.keys(all)) {
            const found = all[type].find(p => p.id === planId);
            if (found) return found;
        }
        return null;
    },

    updatePlan: (type, planId, patch) => {
        const all = planService.getAllPlans();
        all[type] = (all[type] || []).map(p => p.id === planId ? { ...p, ...patch } : p);
        planService.savePlans(all);
        return true;
    },

    addPlan: (type, plan) => {
        const all = planService.getAllPlans();
        const newPlan = {
            ...plan,
            id: `${type.slice(0, 3)}_${Date.now()}`,
            type,
            active: true,
        };
        all[type] = [...(all[type] || []), newPlan];
        planService.savePlans(all);
        return newPlan;
    },

    deletePlan: (type, planId) => {
        const all = planService.getAllPlans();
        all[type] = (all[type] || []).filter(p => p.id !== planId);
        planService.savePlans(all);
        return true;
    },

    togglePlanActive: (type, planId) => {
        const all = planService.getAllPlans();
        all[type] = (all[type] || []).map(p =>
            p.id === planId ? { ...p, active: !p.active } : p
        );
        planService.savePlans(all);
    },

    // ── User Plan Assignments ─────────────────────────────────────

    getAllUserPlans: () => {
        try {
            const raw = localStorage.getItem(USER_PLAN_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    getUserPlan: (userId) => {
        return planService.getAllUserPlans()[userId] || null;
    },

    assignPlan: (userId, userName, planId, adminNote = '') => {
        const assignments = planService.getAllUserPlans();
        const oldPlanId = assignments[userId];
        assignments[userId] = planId;
        localStorage.setItem(USER_PLAN_KEY, JSON.stringify(assignments));

        // Log history
        const history = planService.getPlanHistory();
        history.unshift({
            id: `log_${Date.now()}`,
            userId, userName, oldPlanId, newPlanId: planId,
            adminNote,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
        dispatch('planDataUpdated');
        return true;
    },

    // ── Plan History ──────────────────────────────────────────────

    getPlanHistory: () => {
        try {
            const raw = localStorage.getItem(PLAN_HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    },

    resetToDefaults: () => {
        localStorage.setItem(PLAN_STORE_KEY, JSON.stringify(DEFAULT_PLANS));
        dispatch('planDataUpdated');
    },
};
