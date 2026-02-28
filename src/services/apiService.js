// Base API URL - apna backend URL yahan set karo
// Base API URL - Use Vite proxy to talk to backend
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Token helper
const getToken = () => localStorage.getItem("rupiksha_token");

// Common fetch with JWT
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("rupiksha_token");
    localStorage.removeItem("rupiksha_user");
    window.location.href = "/login";
    return;
  }
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
};

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authService = {
  login: (username, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
};

// ─── DASHBOARD STATS (Live data) ──────────────────────────────────────────────
export const dashboardService = {
  // territory = "india" | "UP" | "Lucknow" etc.
  getStats: (territory = "india") =>
    apiFetch(`/api/dashboard/stats?territory=${territory}`),

  // Top bar data - charges, commission, wallet
  getTopBarData: () => apiFetch("/api/dashboard/topbar"),
};

// ─── EMPLOYEE / HEADER USER MANAGEMENT ────────────────────────────────────────
export const employeeService = {
  // Sab header users ki list
  getAll: () => apiFetch("/api/employees"),

  // Ek user ka detail
  getById: (id) => apiFetch(`/api/employees/${id}`),

  // Naya header user banao
  create: (userData) =>
    apiFetch("/api/employees/create", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // User update karo
  update: (id, userData) =>
    apiFetch(`/api/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  // Activate / Deactivate
  toggleStatus: (id) =>
    apiFetch(`/api/employees/${id}/toggle-status`, { method: "PUT" }),

  // Delete
  delete: (id) =>
    apiFetch(`/api/employees/${id}`, { method: "DELETE" }),
};

// ─── PERMISSIONS ──────────────────────────────────────────────────────────────
export const permissionService = {
  // Kisi user ki permissions lo
  getByUserId: (userId) => apiFetch(`/api/employees/${userId}/permissions`),

  // Kisi user ki permissions update karo
  update: (userId, permissions) =>
    apiFetch(`/api/employees/${userId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),
};

// ─── LIVE LOCATION ────────────────────────────────────────────────────────────
export const locationService = {
  // Apni location bhejo
  updateMyLocation: (lat, lng) =>
    apiFetch("/api/location/update", {
      method: "PUT",
      body: JSON.stringify({ latitude: lat, longitude: lng, timestamp: new Date().toISOString() }),
    }),

  // Sab users ki location lo (admin ke liye map)
  getAllLocations: () => apiFetch("/api/location/all"),

  // Ek user ki location
  getUserLocation: (userId) => apiFetch(`/api/location/${userId}`),
};

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
export const memberService = {
  getAll: (territory) => apiFetch(`/api/members?territory=${territory}`),
  getRequests: () => apiFetch("/api/members/requests"),
  getComplaints: () => apiFetch("/api/members/complaints"),
};

// ─── WALLET ───────────────────────────────────────────────────────────────────
export const walletService = {
  getAll: () => apiFetch("/api/wallet"),
  creditFund: (userId, amount) =>
    apiFetch("/api/wallet/credit", {
      method: "POST",
      body: JSON.stringify({ userId, amount }),
    }),
  debitFund: (userId, amount) =>
    apiFetch("/api/wallet/debit", {
      method: "POST",
      body: JSON.stringify({ userId, amount }),
    }),
  getPendingRequests: () => apiFetch("/api/wallet/pending"),
  lockAmount: (userId, amount) =>
    apiFetch("/api/wallet/lock", {
      method: "POST",
      body: JSON.stringify({ userId, amount }),
    }),
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const transactionService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/api/transactions?${params}`);
  },
  getAeps: (territory) => apiFetch(`/api/transactions/aeps?territory=${territory}`),
  getPayout: (territory) => apiFetch(`/api/transactions/payout?territory=${territory}`),
  getDmt: (territory) => apiFetch(`/api/transactions/dmt?territory=${territory}`),
  getBbps: (territory) => apiFetch(`/api/transactions/bbps?territory=${territory}`),
};
