import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Plus, X, Save, CheckCircle2, UserCircle, MapPin, Activity, History, ChevronRight, RefreshCcw } from 'lucide-react';
import L from 'leaflet';
import { dataService } from '../../services/dataService'; // Assuming relative path
import { useAuth } from '../../context/AuthContext';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on roles
const createIcon = (color) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const icons = {
    NATIONAL_HEADER: createIcon('gold'),
    STATE_HEADER: createIcon('blue'),
    REGIONAL_HEADER: createIcon('green'),
    ADMIN: createIcon('red')
};

const PERMISSIONS_MATRIX = [
    {
        category: "DASHBOARD PRIVILEGE",
        items: ["View Live Dashboard", "View Revenue Metrics", "Network Map Access"]
    },
    {
        category: "APPROVALS PRIVILEGE",
        items: ["Approve Retailers", "Approve Distributors"]
    },
    {
        category: "USER MANAGEMENT PRIVILEGE",
        items: ["Manage Retailers", "Manage Distributors", "Manage Super/Master Distributors", "View Security Logs", "Access Trash / Restore"]
    },
    {
        category: "EMPLOYEE MANAGEMENT PRIVILEGE",
        items: ["View Header Employees", "Provision Header Employees", "Promote/Demote Roles"]
    },
    {
        category: "SETTINGS & SERVICES PRIVILEGE",
        items: ["Manage System Services (On/Off)", "Configure Commissions"]
    },
    {
        category: "APP CONTENT PRIVILEGE",
        items: ["Manage Landing Pages", "Manage Plans & Pricing", "Manage Branding & Carousel"]
    }
];

export default function EmployeeManager() {
    const { user: currentUser } = useAuth();
    const isAdmin = sessionStorage.getItem('admin_auth') === 'true' || currentUser?.role === 'ADMIN';
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'map'
    const [status, setStatus] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        mobile: '',
        email: '',
        address: '',
        role: 'NATIONAL_HEADER',
        territory: '',
        profilePhoto: ''
    });

    const [perms, setPerms] = useState({});

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const allUsers = await dataService.getAllUsers();
        const headers = allUsers.filter(u =>
            ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'].includes(u.role)
        );
        // add dummy if empty for demo
        if (headers.length === 0) {
            headers.push({
                username: 'nat_head', password: 'password123', name: 'Ravi Sharma', role: 'NATIONAL_HEADER', territory: 'India',
                mobile: '9876543210', email: 'ravi@rupiksha.com', address: 'Delhi, India', status: 'Approved',
                latitude: 28.6139, longitude: 77.2090, lastLogin: new Date().toISOString()
            });
            headers.push({
                username: 'state_mh', password: 'password123', name: 'Ajit Patil', role: 'STATE_HEADER', territory: 'Maharashtra',
                mobile: '9876543211', email: 'ajit@rupiksha.com', address: 'Mumbai, MH', status: 'Approved',
                latitude: 19.0760, longitude: 72.8777, lastLogin: new Date().toISOString()
            });
        }
        setEmployees(headers);
    };

    const handlePermChange = (cat, item, checked) => {
        setPerms(prev => ({
            ...prev,
            [`${cat}|${item}`]: checked
        }));
    };

    const handleCheckAll = (cat, checked) => {
        const categoryData = PERMISSIONS_MATRIX.find(c => c.category === cat);
        const newPerms = { ...perms };
        categoryData.items.forEach(item => {
            newPerms[`${cat}|${item}`] = checked;
        });
        setPerms(newPerms);
    };

    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEditing = employees.some(emp => emp.username === formData.username);

        if (!isEditing || formData.password !== '') {
            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match");
                return;
            }
            if (formData.password.length < 6) {
                alert("Password must be at least 6 characters");
                return;
            }
        }

        // If editing, skip OTP for now or skip if admin is doing it without strict requirement
        // But the user requested email verify with OTP during ID creation
        if (!isEditing) {
            setIsVerifying(true);
            const res = await dataService.sendEmployeeVerificationOTP(formData.email, formData.name);
            setIsVerifying(false);

            if (res.success) {
                setGeneratedOTP(res.otp);
                setShowOTPModal(true);
            } else {
                alert("Failed to send verification email: " + res.message);
            }
        } else {
            // Direct update for editing
            processProvisioning();
        }
    };

    const handleVerifyAndProvision = async () => {
        if (otpValue !== generatedOTP) {
            alert("Invalid OTP! Access Denied.");
            return;
        }
        processProvisioning();
    };

    const processProvisioning = async () => {
        const allowedPerms = [];
        Object.entries(perms).forEach(([key, val]) => {
            if (val) {
                const [module, action] = key.split('|');
                allowedPerms.push({ module, action, allowed: true });
            }
        });

        const newEmployee = {
            ...formData,
            permissions: allowedPerms,
            latitude: 20.5937, // default center
            longitude: 78.9629,
            status: 'Approved',
        };

        const res = await dataService.registerUser(newEmployee, !isAdmin ? currentUser?.username : null);

        if (res.success) {
            // Send final credentials email after verification
            await dataService.sendEmployeeCredentials(
                newEmployee.email,
                newEmployee.name,
                newEmployee.username,
                newEmployee.password,
                isAdmin ? 'ADMIN' : currentUser?.name || 'System Administrator',
                roleLabels[newEmployee.role]
            );

            setStatus({ type: 'success', message: 'Employee successfully created, verified & credentials sent' });
            setShowForm(false);
            setShowOTPModal(false);
            loadEmployees();
            setFormData({
                username: '', password: '', confirmPassword: '', name: '', mobile: '', email: '',
                address: '', role: 'NATIONAL_HEADER', territory: '', profilePhoto: ''
            });
            setPerms({});
            setOtpValue('');
            setTimeout(() => setStatus(null), 3000);
        } else {
            alert(res.message || 'Failed to create employee');
        }
    };

    const handleEdit = (emp) => {
        setFormData({
            ...emp,
            password: '',
            confirmPassword: '',
        });

        // Populate permissions
        const newPerms = {};
        if (emp.permissions) {
            emp.permissions.forEach(p => {
                newPerms[`${p.module}|${p.action}`] = true;
            });
        }
        setPerms(newPerms);
        setShowForm(true);
        setActiveTab('list');
    };

    const toggleStatus = async (emp) => {
        const newStatus = emp.status === 'Approved' ? 'Inactive' : 'Approved';
        const updated = employees.map(e => e.username === emp.username ? { ...e, status: newStatus } : e);
        setEmployees(updated);
        setStatus({ type: 'success', message: `${emp.name} is now ${newStatus}` });
        setTimeout(() => setStatus(null), 3000);
    };

    const getRoleColor = (role) => {
        if (role === 'NATIONAL_HEADER') return 'from-yellow-400 to-yellow-600 shadow-yellow-500/30';
        if (role === 'STATE_HEADER') return 'from-blue-400 to-blue-600 shadow-blue-500/30';
        if (role === 'REGIONAL_HEADER') return 'from-emerald-400 to-emerald-600 shadow-emerald-500/30';
        return 'from-slate-400 to-slate-600';
    };

    const roleLabels = {
        NATIONAL_HEADER: 'National Header',
        STATE_HEADER: 'State Header',
        REGIONAL_HEADER: 'Regional Header'
    };

    const getAvailableRoles = () => {
        if (isAdmin) return ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'];
        if (currentUser?.role === 'NATIONAL_HEADER') return ['STATE_HEADER'];
        if (currentUser?.role === 'STATE_HEADER') return ['REGIONAL_HEADER'];
        return [];
    };
    const availableRoles = getAvailableRoles();

    if (availableRoles.length === 0 && !isAdmin) {
        return <div className="p-8 text-center text-slate-500">You do not have permission to manage employees.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {showOTPModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-10 text-center">
                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight mb-2">Verify Email</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                            Enter the 6-digit OTP sent to {formData.email}
                        </p>

                        <input
                            type="text"
                            maxLength="6"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            className="w-full text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 focus:border-indigo-500 transition-all outline-none mb-8 tracking-[0.5em]"
                            placeholder="000000"
                        />

                        <div className="space-y-4">
                            <button
                                onClick={handleVerifyAndProvision}
                                className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-[0.25em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Verify & Create ID
                            </button>
                            <button
                                onClick={() => setShowOTPModal(false)}
                                className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status && (
                <div className="p-4 rounded-xl flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-100 mb-6">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold uppercase tracking-wide">{status.message}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Directory
                    </button>
                    <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Live Map
                    </button>
                </div>

                {!showForm ? (
                    <button onClick={() => {
                        setFormData({
                            username: '', password: '', confirmPassword: '', name: '', mobile: '', email: '',
                            address: '', role: 'NATIONAL_HEADER', territory: '', profilePhoto: ''
                        });
                        setPerms({});
                        setShowForm(true);
                    }} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:scale-105 shadow-lg shadow-slate-900/20">
                        <Plus size={16} /> Add Header User
                    </button>
                ) : (
                    <button onClick={() => setShowForm(false)} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-200">
                        <X size={16} /> Cancel
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-8">
                    <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
                        <Shield className="text-indigo-400" />
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-widest">Create Header Control Account</h2>
                            <p className="text-xs text-slate-400">Configure credentials, territory, and strict permissions.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Credentials</h3>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username / Login ID *</label>
                                    <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={employees.some(emp => emp.username === formData.username)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password {employees.some(emp => emp.username === formData.username) ? '' : '*'}</label>
                                        <input required={!employees.some(emp => emp.username === formData.username)} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={employees.some(emp => emp.username === formData.username) ? "Leave blank to ignore" : ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirm Password {employees.some(emp => emp.username === formData.username) ? '' : '*'}</label>
                                        <input required={!employees.some(emp => emp.username === formData.username) && formData.password !== ''} type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder={employees.some(emp => emp.username === formData.username) ? "Leave blank to ignore" : ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Personal Identity</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                                        <input required type="tel" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Address</label>
                                        <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> Hierarchy & Assignment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Role *</label>
                                    <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800">
                                        {availableRoles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Territory *</label>
                                    <input required type="text" value={formData.territory} onChange={e => setFormData({ ...formData, territory: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Extremely critical: Bounds user data visibility.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Shield size={18} className="text-rose-500" /> Permissions Configuration Matrix</h3>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 md:p-6 mb-8 max-h-[500px] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
                                {PERMISSIONS_MATRIX.map((cat, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                                            <h4 className="text-[11px] font-black tracking-widest text-slate-700 uppercase">{cat.category}</h4>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" onChange={(e) => handleCheckAll(cat.category, e.target.checked)} checked={cat.items.every(i => perms[`${cat.category}|${i}`])} />
                                                <span className="text-[10px] font-bold uppercase text-indigo-600">Check All</span>
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                            {cat.items.map((item, idxi) => (
                                                <label key={idxi} className="flex items-start gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4" checked={!!perms[`${cat.category}|${item}`]} onChange={(e) => handlePermChange(cat.category, item, e.target.checked)} />
                                                    <span className="text-xs font-medium text-slate-600">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button disabled={isVerifying} type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50">
                                {isVerifying ? (
                                    <>
                                        <RefreshCcw size={18} className="animate-spin" /> Sending Verification...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Provision Account
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && activeTab === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {employees.map((emp, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 flex gap-5">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRoleColor(emp.role)} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                                    <span className="text-2xl font-black">{emp.name?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-black text-slate-800">{emp.name}</h3>
                                        <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-full ${emp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {emp.status === 'Approved' ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                        {roleLabels[emp.role]} • <span className="text-indigo-600">{emp.territory}</span>
                                    </div>
                                    <div className="space-y-1 mb-2">
                                        <div className="text-xs text-slate-600 truncate">{emp.email} • {emp.mobile}</div>
                                        <div className="text-xs text-slate-400">{emp.address}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 bg-slate-50 border-y border-slate-100 divide-x divide-slate-200">
                                <div className="p-3 text-center">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Users</div>
                                    <div className="text-sm font-black text-slate-800">1,240</div>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vol / Month</div>
                                    <div className="text-sm font-black text-slate-800">₹4.2 Cr</div>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Modules</div>
                                    <div className="text-sm font-black text-indigo-600">{emp.permissions?.length || 0} Allowed</div>
                                </div>
                            </div>

                            <div className="p-4 bg-white flex justify-between items-center text-xs mt-auto">
                                <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                                    <div className={`w-2 h-2 rounded-full ${emp.status === 'Approved' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    Live Ping: {emp.status === 'Approved' ? 'Just now' : 'Offline'}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <button onClick={() => toggleStatus(emp)} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border hover:bg-slate-100">
                                            {emp.status === 'Approved' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                    <button onClick={() => { if (isAdmin) handleEdit(emp); }} className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50">{isAdmin ? 'View / Edit' : 'View Details'}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!showForm && activeTab === 'map' && (
                <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 h-[600px] relative shadow-xl">
                    <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50 w-64">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-3 flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" /> Header Pulse Map
                        </h3>
                        <div className="space-y-2 text-[10px] font-bold">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> National Headers</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> State Headers</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Regional Headers</div>
                        </div>
                    </div>

                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%", zIndex: 10 }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
                        {employees.map((emp, i) => (
                            emp.latitude && emp.longitude && (
                                <Marker key={i} position={[emp.latitude, emp.longitude]} icon={icons[emp.role] || icons['ADMIN']}>
                                    <Popup className="rounded-xl overflow-hidden pointer-events-none">
                                        <div className="text-center pb-2 cursor-pointer pointer-events-auto">
                                            <div className="font-black text-sm text-slate-800 leading-tight">{emp.name}</div>
                                            <div className="text-[9px] font-bold uppercase text-slate-500">{roleLabels[emp.role]}</div>
                                            <div className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-lg">{emp.territory}</div>
                                            <div className="text-[9px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            )}
        </div>
    );
}
