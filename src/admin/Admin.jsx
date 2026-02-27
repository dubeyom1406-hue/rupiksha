import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, RefreshCcw, Home, LayoutDashboard,
    Settings, Package, Video, CreditCard, Users,
    ArrowLeft, CheckCircle2, AlertTriangle, Plus, Trash2, Edit3, FileText,
    BarChart3, Megaphone, Zap, Upload, X, ImageIcon, Play,
    Camera, Eye, IndianRupee, ChevronRight, Wallet, TrendingUp, History, ArrowRight,
    Building2, UserPlus, UserMinus, ShieldCheck, Link2, Copy, Crown, ChevronDown, Mail, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { sharedDataService } from '../services/sharedDataService';
import { sendApprovalEmail } from '../services/emailService';
import mainLogo from '../assets/rupiksha_logo.png';
import AdminPlanManager from './AdminPlanManager';
import OurMap from '../superadmin/pages/OurMap';
import LiveDashboard from './components/LiveDashboard';
import EmployeeManager from './components/EmployeeManager';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const navigate = useNavigate();

    const { user: currentUser, loading } = useAuth();

    // ── Auth guard: redirect to AdminLogin if not authenticated ──
    useEffect(() => {
        if (loading) return; // Wait until AuthContext has finished initializing
        const isAuth = sessionStorage.getItem('admin_auth');
        const isHeader = currentUser && ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'].includes(currentUser.role);
        if (!isAuth && !isHeader) {
            navigate('/admin-login', { replace: true });
        }
    }, [navigate, currentUser, loading]);

    const [data, setData] = useState(dataService.getData());
    const [distributors, setDistributors] = useState([]);
    const [superadmins, setSuperadmins] = useState([]);
    const [trashUsers, setTrashUsers] = useState([]);

    // Default to Dashboard for Header users since they might not have Approvals access
    const initialSection = (currentUser && ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER'].includes(currentUser.role)) ? 'Dashboard' : 'Approvals';
    const [activeSection, setActiveSection] = useState(initialSection);
    const [expandedSA, setExpandedSA] = useState(null); // ID of expanded SuperAdmin row
    const [expandedNav, setExpandedNav] = useState(null); // which nav group is expanded
    const [status, setStatus] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // SuperAdmin Addition States
    const [showAddSAModal, setShowAddSAModal] = useState(false);
    const [showSAOTPView, setShowSAOTPView] = useState(false);
    const [saOtp, setSaOtp] = useState('');
    const [generatedSaOtp, setGeneratedSaOtp] = useState('');
    const [saAdding, setSaAdding] = useState(false);
    const [saVerifying, setSaVerifying] = useState(false);
    const [saForm, setSaForm] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '', city: '', state: 'Bihar'
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Distributor Addition States
    const [showAddDistModal, setShowAddDistModal] = useState(false);
    const [showDistOTPView, setShowDistOTPView] = useState(false);
    const [distOtp, setDistOtp] = useState('');
    const [generatedDistOtp, setGeneratedDistOtp] = useState('');
    const [distAdding, setDistAdding] = useState(false);
    const [distVerifying, setDistVerifying] = useState(false);
    const [distForm, setDistForm] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: '', city: '', state: 'Bihar', ownerId: ''
    });

    const [approvingIds, setApprovingIds] = useState(new Set()); // Usernames or IDs currently being approved (email sending)

    const [showSuccessView, setShowSuccessView] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [userForRoleChange, setUserForRoleChange] = useState(null);
    const [targetRole, setTargetRole] = useState('');

    const handleRoleChangeClick = (user) => {
        setUserForRoleChange(user);
        setTargetRole(user.role);
        setShowRoleModal(true);
    };

    const submitRoleChange = async () => {
        if (!targetRole) return;
        try {
            const res = await dataService.updateUserRole(userForRoleChange.username, targetRole);
            if (res.success) {
                setStatus({ type: 'success', message: `Role updated for ${userForRoleChange.username}` });
                refreshData();
                setShowRoleModal(false);
            } else {
                alert(res.message || 'Failed to update role');
            }
        } catch (e) {
            alert('Error updating role');
        }
    };

    const handleInviteSA = async (e) => {
        e.preventDefault();
        setSaAdding(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedSaOtp(code);

        const emailModule = await import('../services/emailService');
        const res = await emailModule.sendOTPEmail(saForm.email, code, saForm.name);

        setSaAdding(false);
        if (res.success) {
            setShowSAOTPView(true);
        } else {
            alert("Failed to send OTP. Please check email address.");
        }
    };

    const handleVerifyAndAddSA = async () => {
        if (saOtp !== generatedSaOtp) {
            alert("Invalid OTP! Access Denied.");
            return;
        }

        setSaVerifying(true);
        try {
            const newSA = await sharedDataService.registerSuperAdmin({
                ...saForm,
                status: 'Pending'
            });

            if (newSA) {
                setShowSuccessView(true);
                await refreshData();
                setShowAddSAModal(false);
                setShowSAOTPView(false);
                setSaForm({ name: '', businessName: '', mobile: '', email: '', password: '', city: '', state: 'Bihar' });
            }
        } catch (err) {
            alert("Error adding Super Admin");
        } finally {
            setSaVerifying(false);
        }
    };

    const handleInviteDist = async (e) => {
        e.preventDefault();
        setDistAdding(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedDistOtp(code);

        const emailModule = await import('../services/emailService');
        const res = await emailModule.sendOTPEmail(distForm.email, code, distForm.name);

        setDistAdding(false);
        if (res.success) {
            setShowDistOTPView(true);
        } else {
            alert("Failed to send OTP. Please check email address.");
        }
    };

    const handleVerifyAndAddDist = async () => {
        if (distOtp !== generatedDistOtp) {
            alert("Invalid OTP! Access Denied.");
            return;
        }

        setDistVerifying(true);
        try {
            const newDist = await sharedDataService.registerDistributor({
                ...distForm,
                status: 'Pending'
            }, distForm.ownerId || null);

            if (newDist) {
                setShowSuccessView(true);
                refreshData();
                setShowAddDistModal(false);
                setShowDistOTPView(false);
                setDistForm({ name: '', businessName: '', mobile: '', email: '', password: '', city: '', state: 'Bihar', ownerId: '' });
            }
        } catch (err) {
            alert("Error adding Distributor");
        } finally {
            setDistVerifying(false);
        }
    };

    const refreshDists = () => {
        const all = sharedDataService.getAllDistributors();
        if (all.length === 0) {
            // Force seed if somehow still empty
            const defaults = sharedDataService.resetToDefaults();
            setDistributors(defaults);
        } else {
            setDistributors(all);
        }
    };

    const refreshData = async () => {
        try {
            const allUsers = await dataService.getAllUsers();

            // Filter users by role and status (Pending/Approved)
            const retailers = allUsers.filter(u => u.role === 'RETAILER');
            const dists = allUsers.filter(u => u.role === 'DISTRIBUTOR');
            const sas = allUsers.filter(u => u.role === 'SUPER_DISTRIBUTOR');

            const currentData = dataService.getData();
            setData({ ...currentData, users: retailers });
            setDistributors(dists);
            setSuperadmins(sas);

            // Sync with sharedDataService for other components
            sharedDataService.saveDistributors(dists);
            sharedDataService.saveSuperAdmins(sas);

            const trash = await dataService.getTrashUsers();
            setTrashUsers(trash);
        } catch (e) {
            console.error("Failed to refresh live data", e);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleResendCredentials = async (user) => {
        if (!user.email) {
            alert(`Error: No email address found for user ${user.username}. Please update their profile with an email first.`);
            return;
        }
        const res = await dataService.resendCredentials(user);
        if (res.success) {
            alert(`Credentials resent successfully to ${user.email}`);
        } else {
            alert(`Failed to resend credentials: ${res.message}`);
        }
    };

    const handleRestoreUser = async (username) => {
        const res = await dataService.restoreUser(username);
        if (res.success) {
            setStatus({ type: 'success', message: 'User restored from trash' });
            refreshData();
        } else {
            alert('Failed to restore');
        }
    };

    // Listen for distributor and superadmin data changes
    useEffect(() => {
        refreshData();
        const handler = () => refreshData();
        window.addEventListener('distributorDataUpdated', handler);
        window.addEventListener('superadminDataUpdated', handler);
        return () => {
            window.removeEventListener('distributorDataUpdated', handler);
            window.removeEventListener('superadminDataUpdated', handler);
        };
    }, []);

    const handleSave = () => {
        dataService.saveData(data);
        setStatus({ type: 'success', message: 'All changes saved successfully!' });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Reset all data to defaults?')) {
            dataService.resetData();
            setData(dataService.getData());
            sharedDataService.resetToDefaults();
            refreshDists();
            setStatus({ type: 'success', message: 'All data reset to defaults!' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleLoginAsRetailer = (user) => {
        // Just set the user in storage and navigate - bypass API login
        localStorage.setItem('rupiksha_user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user)); // Compatibility for components using 'user' key
        navigate('/dashboard');
    };

    const handleLoginAsDistributor = (dist) => {
        localStorage.setItem('rupiksha_user', JSON.stringify(dist));
        localStorage.setItem('user', JSON.stringify(dist)); // Compatibility
        navigate('/distributor');
    };

    const handleLoginAdminSA = (sa) => {
        localStorage.setItem('rupiksha_user', JSON.stringify(sa));
        localStorage.setItem('user', JSON.stringify(sa)); // Compatibility
        navigate('/superadmin');
    };

    // Components to render different edit forms
    const ImageUpload = ({ value, onChange, label }) => {
        const handleFile = (file) => {
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => onChange(e.target.result);
            reader.readAsDataURL(file);
        };

        return (
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                    }}
                    className="relative group border-2 border-dashed border-slate-200 rounded-xl p-4 transition-all hover:border-emerald-400 bg-slate-50/50"
                >
                    {value ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="cursor-pointer bg-white text-slate-900 p-2 rounded-full hover:scale-110 transition-transform">
                                    <Upload size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                                </label>
                                <button
                                    onClick={() => onChange('')}
                                    className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                            <div className="p-3 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all mb-2">
                                <Upload size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-emerald-600">Click or Drag Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
                        </label>
                    )}
                </div>
            </div>
        );
    };

    const DashboardEditor = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Megaphone size={18} className="text-amber-500" /> News Bar Announcement</h3>
                <textarea
                    className="w-full p-4 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-200 outline-none"
                    rows="2"
                    value={data.news}
                    onChange={(e) => setData({ ...data, news: e.target.value })}
                />
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Weekly Activity Chart</h3>
                    <input type="text" className="w-64 p-2 bg-slate-50 border rounded-lg text-sm font-bold"
                        value={data.chartTitle}
                        onChange={(e) => setData({ ...data, chartTitle: e.target.value })} />
                </div>
                <div className="grid grid-cols-7 gap-4">
                    {(data.chartData || []).map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 text-center uppercase">{item.name}</span>
                            <input
                                type="number"
                                className="w-full p-2 bg-slate-50 border rounded-lg text-center text-sm font-bold"
                                value={item.value}
                                onChange={(e) => {
                                    const next = [...data.chartData];
                                    next[idx].value = parseInt(e.target.value) || 0;
                                    setData({ ...data, chartData: next });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6"><Zap size={18} className="text-emerald-500" /> Quick Action Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.quickActions || []).map((action, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex gap-3">
                                <label className="flex-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
                                    <input type="text" className="w-full mt-1 p-2 bg-white border rounded text-xs font-bold"
                                        value={action.title}
                                        onChange={(e) => {
                                            const next = [...data.quickActions];
                                            next[idx].title = e.target.value;
                                            setData({ ...data, quickActions: next });
                                        }} />
                                </label>
                                <label className="w-24">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Icon</span>
                                    <input type="text" className="w-full mt-1 p-2 bg-white border rounded text-xs"
                                        value={action.icon}
                                        onChange={(e) => {
                                            const next = [...data.quickActions];
                                            next[idx].icon = e.target.value;
                                            setData({ ...data, quickActions: next });
                                        }} />
                                </label>
                            </div>
                            <label className="block">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Description</span>
                                <input type="text" className="w-full mt-1 p-2 bg-white border rounded text-xs"
                                    value={action.subTitle}
                                    onChange={(e) => {
                                        const next = [...data.quickActions];
                                        next[idx].subTitle = e.target.value;
                                        setData({ ...data, quickActions: next });
                                    }} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const StatsEditor = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><BarChart3 size={18} className="text-[#00aa9a]" /> Main Activity</h3>
                <div className="space-y-4">
                    {['today', 'weekly', 'monthly', 'debit'].map(key => (
                        <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{key} Value</span>
                                <input type="text" className="w-24 p-1 bg-white border rounded text-xs text-right font-bold"
                                    value={key === 'debit' ? data.stats.debitSale : data.stats[`${key}Active`]}
                                    onChange={(e) => {
                                        if (key === 'debit') setData({ ...data, stats: { ...data.stats, debitSale: e.target.value } });
                                        else setData({ ...data, stats: { ...data.stats, [`${key}Active`]: e.target.value } });
                                    }} />
                            </div>
                            <input type="text" className="w-full p-1 bg-white border rounded text-[10px] uppercase font-bold text-slate-600"
                                value={data.stats.labels[key].title}
                                onChange={(e) => {
                                    const next = { ...data.stats };
                                    next.labels[key].title = e.target.value;
                                    setData({ ...data, stats: next });
                                }} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><CreditCard size={18} className="text-amber-500" /> Wallet & Profile</h3>
                <div className="space-y-3">
                    <label className="block">
                        <span className="text-xs font-bold text-slate-500 uppercase">Wallet Balance</span>
                        <input type="text" className="w-full mt-1 p-2 bg-slate-50 border rounded-lg text-sm font-bold text-[#005f56]"
                            value={data.wallet.balance}
                            onChange={(e) => setData({ ...data, wallet: { ...data.wallet, balance: e.target.value } })} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-slate-500 uppercase">Retailer Name</span>
                        <input type="text" className="w-full mt-1 p-2 bg-slate-50 border rounded-lg text-sm"
                            value={data.wallet.retailerName}
                            onChange={(e) => setData({ ...data, wallet: { ...data.wallet, retailerName: e.target.value } })} />
                    </label>
                </div>
            </div>
        </div>
    );

    const ServicesEditor = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {(data.services || []).map((cat, catIdx) => (
                <div key={catIdx} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <input
                            type="text"
                            className="text-lg font-bold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-emerald-500 outline-none px-1 uppercase tracking-tight"
                            value={cat.category}
                            onChange={(e) => {
                                const next = [...data.services];
                                next[catIdx].category = e.target.value;
                                setData({ ...data, services: next });
                            }}
                        />
                        <button
                            onClick={() => {
                                const next = data.services.filter((_, i) => i !== catIdx);
                                setData({ ...data, services: next });
                            }}
                            className="text-red-400 hover:text-red-600 p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {cat.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group relative">
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        className="text-[10px] font-black text-slate-700 bg-transparent outline-none uppercase tracking-wider"
                                        value={item.title}
                                        onChange={(e) => {
                                            const next = [...data.services];
                                            next[catIdx].items[itemIdx].title = e.target.value;
                                            setData({ ...data, services: next });
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400">ICON:</span>
                                        <input
                                            type="text"
                                            className="text-[9px] text-emerald-600 font-bold bg-transparent outline-none flex-1"
                                            value={item.icon}
                                            onChange={(e) => {
                                                const next = [...data.services];
                                                next[catIdx].items[itemIdx].icon = e.target.value;
                                                setData({ ...data, services: next });
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const next = [...data.services];
                                        next[catIdx].items = next[catIdx].items.filter((_, i) => i !== itemIdx);
                                        setData({ ...data, services: next });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const PromotionsEditor = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b pb-4">
                    <Video size={22} className="text-blue-500" /> Training Content
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(data.promotions?.banners || []).map((banner, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
                            <ImageUpload
                                label="Banner Image"
                                value={banner.image}
                                onChange={(val) => {
                                    const next = { ...data.promotions };
                                    next.banners[idx].image = val;
                                    setData({ ...data, promotions: next });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const LoginsTable = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><RefreshCcw size={18} className="text-blue-500" /> Login History</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">{data.loginLogs?.length || 0} RECENT</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-bold text-sm text-slate-600">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.loginLogs?.map((log, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4">{log.username}</td>
                                <td className="px-6 py-4">{log.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [approvalForm, setApprovalForm] = useState({ password: '', partyCode: '', distributorId: '' });

    const [showSAApprovalModal, setShowSAApprovalModal] = useState(false);
    const [selectedSA, setSelectedSA] = useState(null);
    const [saApprovalForm, setSAApprovalForm] = useState({ password: '' });

    const [showCredentialCard, setShowCredentialCard] = useState(false);
    const [credentialData, setCredentialData] = useState(null);

    const handleApproveClick = (user) => {
        setSelectedUser(user);
        const approvedDists = sharedDataService.getAllDistributors().filter(d => d.status === 'Approved');
        setApprovalForm({
            password: 'Ru@' + Math.floor(1000 + Math.random() * 9000),
            partyCode: 'RU' + Math.floor(100000 + Math.random() * 900000),
            distributorId: approvedDists[0]?.id || ''
        });
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        if (!approvalForm.password || !approvalForm.partyCode) {
            alert('Please provide both Password and Party Code.');
            return;
        }

        const targetUser = selectedUser;
        const targetUsername = targetUser.username;

        // 1. Mark as currently being processed
        setApprovingIds(prev => new Set(prev).add(targetUsername));
        setShowApprovalModal(false);

        const shareData = {
            name: targetUser.name || targetUser.mobile,
            mobile: targetUser.mobile,
            password: approvalForm.password,
            idLabel: 'Party Code',
            idValue: approvalForm.partyCode,
            portalType: 'Retailer',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        try {
            // 2. Call the real backend email service FIRST
            const result = await sendApprovalEmail({
                to: targetUser.email,
                name: shareData.name,
                loginId: shareData.mobile,
                password: shareData.password,
                idLabel: shareData.idLabel,
                idValue: shareData.idValue,
                portalType: shareData.portalType
            });

            if (result.success) {
                // 3. ONLY if email sent, update DB status to Approved
                await dataService.approveUser(targetUsername, approvalForm.password, approvalForm.partyCode, approvalForm.distributorId);

                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'sent'
                }));

                // Refresh UI to move from Pending to Active
                refreshData();
            } else {
                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'failed',
                    error: result.message || 'Email delivery failed'
                }));
            }
        } catch (err) {
            setCredentialData(prev => ({
                ...prev,
                emailStatus: 'failed',
                error: 'Network error during email dispatch'
            }));
        } finally {
            // 4. Finished processing
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(targetUsername);
                return next;
            });
        }
    };


    const handleReject = async (username) => {
        if (window.confirm(`Are you sure you want to move user ${username} to trash?`)) {
            await dataService.deleteUser(username);
            refreshData();
            setStatus({ type: 'error', message: `User ${username} moved to trash.` });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleSAApproveClick = (sa) => {
        setSelectedSA(sa);
        setSAApprovalForm({
            password: 'SA@' + Math.floor(1000 + Math.random() * 9000)
        });
        setShowSAApprovalModal(true);
    };

    const submitSAApproval = async () => {
        if (!saApprovalForm.password) {
            alert('Please set a password.');
            return;
        }

        const targetSA = selectedSA;
        const targetId = targetSA.id;

        // 1. Mark as processing
        setApprovingIds(prev => new Set(prev).add(targetId));
        setShowSAApprovalModal(false);

        const shareData = {
            name: targetSA.name,
            mobile: targetSA.mobile,
            password: saApprovalForm.password,
            idLabel: 'SuperAdmin ID',
            idValue: targetId,
            portalType: 'SuperAdmin',
            url: window.location.origin,
            emailStatus: 'sending'
        };
        setCredentialData(shareData);
        setShowCredentialCard(true);

        try {
            // 2. Email First
            const result = await sendApprovalEmail({
                to: targetSA.email,
                name: shareData.name,
                loginId: shareData.mobile,
                password: shareData.password,
                idLabel: shareData.idLabel,
                idValue: shareData.idValue,
                portalType: shareData.portalType
            });

            if (result.success) {
                // 3. Status Change
                sharedDataService.approveSuperAdmin(targetId, saApprovalForm.password);

                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'sent'
                }));
                refreshData();
            } else {
                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'failed',
                    error: result.message || 'Email delivery failed'
                }));
            }
        } catch (err) {
            setCredentialData(prev => ({
                ...prev,
                emailStatus: 'failed',
                error: 'Connection error'
            }));
        } finally {
            // 4. Cleanup
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
        }
    };

    const SAApprovalModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-indigo-500" /> Approve SuperAdmin
                    </h3>
                    <button onClick={() => setShowSAApprovalModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">User</label>
                        <p className="p-3 bg-slate-50 rounded-lg font-bold text-slate-700 text-sm">{selectedSA?.name || selectedSA?.mobile}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Set Password</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-mono" value={saApprovalForm.password} onChange={(e) => setSAApprovalForm({ ...saApprovalForm, password: e.target.value })} />
                    </div>
                    <button onClick={submitSAApproval} className="w-full bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs">Confirm & Send Login</button>
                </div>
            </motion.div>
        </div>
    );

    const ApprovalModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-500" /> Approve Retailer
                    </h3>
                    <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-5">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">📧 Auto-email to:</span>
                    <span className="text-xs font-black text-emerald-700 ml-auto">{selectedUser?.email || 'No email on record'}</span>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Retailer Name</label>
                            <p className="p-3 bg-slate-50 rounded-lg font-bold text-slate-700 text-sm">{selectedUser?.name || selectedUser?.mobile}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Login ID (Mobile)</label>
                            <p className="p-3 bg-slate-50 rounded-lg font-mono font-bold text-slate-700 text-sm">{selectedUser?.mobile}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Password <span className="text-emerald-500">(editable)</span></label>
                        <input type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                            value={approvalForm.password}
                            onChange={(e) => setApprovalForm({ ...approvalForm, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Party Code <span className="text-emerald-500">(editable)</span></label>
                        <input type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                            value={approvalForm.partyCode}
                            onChange={(e) => setApprovalForm({ ...approvalForm, partyCode: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assign Distributor</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={approvalForm.distributorId}
                            onChange={(e) => setApprovalForm({ ...approvalForm, distributorId: e.target.value })}
                        >
                            <option value="">No Distributor (Direct)</option>
                            {distributors.filter(d => d.status === 'Approved').map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={submitApproval}
                        className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} /> Approve — Email Sends Automatically
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const ApprovalsTable = () => {
        const pendingUsers = (data.users || []).filter(u => u?.status === 'Pending');
        const pendingDists = (distributors || []).filter(d => d?.status === 'Pending');
        const pendingSAs = (superadmins || []).filter(s => s?.status === 'Pending');

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Pending Retailers */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-emerald-50/50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 relative">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            Pending Retailers
                        </h3>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingUsers.length} Pending</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Retailer / Mobile</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingUsers.map((user, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            <div>{user.name || 'UNNAMED'}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{user.mobile}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                                        <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{user.state}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {approvingIds.has(user.username) ? (
                                                    <span className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase animate-pulse">
                                                        <RefreshCcw size={14} className="animate-spin" /> Processing
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleApproveClick(user)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                                        <button onClick={() => handleReject(user.username)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingUsers.length === 0 && (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-300 font-bold italic">No pending retailers.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Distributors */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-amber-50/50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Building2 size={18} className="text-amber-500" />
                            Pending Distributors
                        </h3>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingDists.length} Pending</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Distributor / Business</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingDists.map((d, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-sm">{d.name}</div>
                                            <div className="text-[10px] text-amber-600 font-black uppercase">{d.businessName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                            {d.mobile}<br />{d.email}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">
                                            {d.city}, {d.state}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {approvingIds.has(d.id) ? (
                                                    <span className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase animate-pulse">
                                                        <RefreshCcw size={14} className="animate-spin" /> Processing
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleDistApproveClick(d)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><ShieldCheck size={18} /></button>
                                                        <button onClick={() => { if (window.confirm('Reject?')) { sharedDataService.rejectDistributor(d.id); refreshDists(); } }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingDists.length === 0 && (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-300 font-bold italic">No pending distributors.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pending SuperAdmins */}
                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden mt-8">
                    <div className="p-6 border-b flex justify-between items-center bg-indigo-50/50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-indigo-500" />
                            Pending SuperAdmins
                        </h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingSAs.length} Pending</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Name / Business</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingSAs.map((sa, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            <div>{sa.name}</div>
                                            <div className="text-[10px] text-indigo-600 font-black uppercase">{sa.businessName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{sa.mobile}<br />{sa.email}</td>
                                        <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{sa.city}, {sa.state}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {approvingIds.has(sa.id) ? (
                                                    <span className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase animate-pulse">
                                                        <RefreshCcw size={14} className="animate-spin" /> Processing
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleSAApproveClick(sa)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                                        <button onClick={() => { if (window.confirm('Delete?')) { sharedDataService.rejectSuperAdmin(sa.id); refreshData(); } }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingSAs.length === 0 && (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-300 font-bold italic">No pending superadmins.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const RetailersTable = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={18} className="text-emerald-500" /> Registered Retailers</h3>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">{(data.users || []).length} TOTAL</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Retailer</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Distributor</th>
                            <th className="px-6 py-4">Wallet</th>
                            <th className="px-6 py-4">Party Code</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(data.users || []).map((user, idx) => (
                            user && <tr key={idx} className="hover:bg-slate-50 transition-colors text-xs">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                            {user.profilePhoto ? (
                                                <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    {user.mobile?.slice(-2)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">{user.name || user.mobile}</div>
                                            <div className="text-[10px] text-slate-500">{user.name ? `${user.mobile} | ${user.email}` : user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-400 uppercase">{user.state}</div>
                                    <div className="text-[9px] text-slate-300 uppercase">{user.lang}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${user.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {user.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {(() => {
                                        const dist = sharedDataService.getDistributorForRetailer(user.username);
                                        return dist ? (
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                                <Building2 size={12} />
                                                {dist.name}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Unassigned</span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-black text-blue-900 leading-none">₹ {user.wallet?.balance || '0.00'}</div>
                                    <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Balance</div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-blue-600">{user.partyCode || 'UNASSIGNED'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleResendCredentials(user)}
                                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                                            title="Resend Credentials"
                                        >
                                            <Mail size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleLoginAsRetailer(user)}
                                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 px-3"
                                            title="Login as Retailer"
                                        >
                                            <ArrowRight size={14} />
                                            <span className="text-[10px] font-black uppercase">Login</span>
                                        </button>
                                        <button
                                            onClick={() => handleRoleChangeClick(user)}
                                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                            title="Change User Role"
                                        >
                                            <TrendingUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/retailer/${user.username}`)}
                                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="View Usage Stats"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.username)}
                                            className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    );

    const ChangeRoleModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-slate-200"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" /> Change User Role
                    </h3>
                    <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target User</p>
                        <p className="text-sm font-black text-slate-800">{userForRoleChange?.name || userForRoleChange?.username}</p>
                        <p className="text-[10px] text-slate-500">Current Role: {userForRoleChange?.role}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select New Role</p>
                        <div className="grid grid-cols-1 gap-2">
                            {['RETAILER', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setTargetRole(role)}
                                    className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between
                                        ${targetRole === role
                                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                >
                                    <span className="text-xs font-black uppercase tracking-wider">{role.replace('_', ' ')}</span>
                                    {targetRole === role && <CheckCircle2 size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={submitRoleChange}
                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Confirm Rank Shift
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const TrashTable = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b flex justify-between items-center bg-red-50/30">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> Trash (Recyclable)</h3>
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black">{trashUsers.length} REMOVED</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Deleted At</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {trashUsers.map((user, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700">{user.name || user.username}</div>
                                    <div className="text-[10px] text-slate-400">{user.mobile}</div>
                                </td>
                                <td className="px-6 py-4"><span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded">{user.role}</span></td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{new Date(user.updated_at || user.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleRestoreUser(user.username)} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2">
                                            <RefreshCcw size={14} /> Restore
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {trashUsers.length === 0 && (
                            <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic">Trash is empty.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const AddSuperAdminModal = () => (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                            {showSAOTPView ? 'Confirm Identity' : 'Provision SuperAdmin'}
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {showSAOTPView ? `Enter OTP sent to ${saForm.email}` : 'Direct registration of high-level distributors'}
                        </p>
                    </div>
                    <button onClick={() => { setShowAddSAModal(false); setShowSAOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {!showSAOTPView ? (
                    <form onSubmit={handleInviteSA} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Name</label>
                                <input required type="text" value={saForm.name} onChange={e => setSaForm({ ...saForm, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Full Name" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Agency Name</label>
                                <input required type="text" value={saForm.businessName} onChange={e => setSaForm({ ...saForm, businessName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Business ID" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                <input required type="tel" maxLength="10" value={saForm.mobile} onChange={e => setSaForm({ ...saForm, mobile: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Primary Contact" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                <input required type="email" value={saForm.email} onChange={e => setSaForm({ ...saForm, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="verification@email.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zone</label>
                                <select value={saForm.state} onChange={e => setSaForm({ ...saForm, state: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none appearance-none">
                                    {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Mumbai'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                <input required type="text" value={saForm.city} onChange={e => setSaForm({ ...saForm, city: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none" placeholder="Master Hub" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Password</label>
                            <input required type="text" value={saForm.password} onChange={e => setSaForm({ ...saForm, password: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-[#4f46e5] focus:bg-white transition-all outline-none" />
                        </div>

                        <div className="pt-6 sticky bottom-0 bg-white">
                            <button disabled={saAdding} type="submit" className="w-full bg-[#4f46e5] text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                {saAdding ? 'SENDING OTP...' : 'INITIATE PROVISIONING'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-10 space-y-10 text-center">
                        <div className="flex justify-center gap-3">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={saOtp[i] || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val) {
                                            const newOtp = saOtp.split('');
                                            newOtp[i] = val;
                                            setSaOtp(newOtp.join(''));
                                            if (e.target.nextSibling) e.target.nextSibling.focus();
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Backspace' && !saOtp[i] && e.target.previousSibling) {
                                            e.target.previousSibling.focus();
                                        }
                                    }}
                                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#4f46e5] transition-all outline-none"
                                />
                            ))}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleVerifyAndAddSA}
                                disabled={saVerifying || saOtp.length < 6}
                                className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saVerifying ? 'VERIFYING...' : 'FINALIZE PROVISIONING'}
                            </button>
                            <button
                                onClick={() => setShowSAOTPView(false)}
                                className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                CANCEL & BACK
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );

    // ── Distributors Panel ────────────────────────────────────────────────
    const [showDistApprovalModal, setShowDistApprovalModal] = useState(false);
    const [selectedDist, setSelectedDist] = useState(null);
    const [distApprovalForm, setDistApprovalForm] = useState({ password: '', distribId: '' });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTargetDist, setAssignTargetDist] = useState(null);
    const [assignSearch, setAssignSearch] = useState('');

    const handleDistApproveClick = (dist) => {
        setSelectedDist(dist);
        // Auto-generate distributor ID and password for admin to review before approving
        setDistApprovalForm({
            password: 'Dist@' + Math.floor(1000 + Math.random() * 9000),
            distribId: dist.id   // already auto-generated on registration
        });
        setShowDistApprovalModal(true);
    };

    const submitDistApproval = async () => {
        if (!distApprovalForm.password) { alert('Please set a login password.'); return; }

        const targetDist = selectedDist;
        const targetId = targetDist.id;

        // 1. Mark as processing
        setApprovingIds(prev => new Set(prev).add(targetId));
        setShowDistApprovalModal(false);

        const shareData = {
            name: targetDist.name,
            mobile: targetDist.mobile,
            password: distApprovalForm.password,
            idLabel: 'Distributor ID',
            idValue: distApprovalForm.distribId,
            portalType: 'Distributor',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        try {
            // 2. Email First
            const result = await sendApprovalEmail({
                to: targetDist.email,
                name: shareData.name,
                loginId: shareData.mobile,
                password: shareData.password,
                idLabel: shareData.idLabel,
                idValue: shareData.idValue,
                portalType: shareData.portalType
            });

            if (result.success) {
                // 3. Update DB
                sharedDataService.approveDistributor(targetId, distApprovalForm.password, distApprovalForm.distribId);

                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'sent'
                }));
                // Need to refresh both distributors and the main data
                refreshDists();
                refreshData();
            } else {
                setCredentialData(prev => ({
                    ...prev,
                    emailStatus: 'failed',
                    error: result.message || 'Email delivery failed'
                }));
            }
        } catch (err) {
            setCredentialData(prev => ({
                ...prev,
                emailStatus: 'failed',
                error: 'Connection error'
            }));
        } finally {
            // 4. Cleanup
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
        }
    };

    const renderCredentialSharerModal = () => {
        if (!credentialData) return null;

        const shareText = `*RUPIKSHA FINTECH APPROVAL* 🚀\n\n` +
            `Hello *${credentialData.name}*,\n` +
            `Aapka *${credentialData.portalType}* account approve ho gaya hai.\n\n` +
            `*Login Details:*\n` +
            `• ID: ${credentialData.mobile}\n` +
            `• Password: ${credentialData.password}\n` +
            `• ${credentialData.idLabel}: ${credentialData.idValue}\n\n` +
            `Login here: ${credentialData.url}\n\n` +
            `_Team RUPIKSHA_`;

        const copyAll = () => {
            navigator.clipboard.writeText(shareText);
            alert('Credentials Copied! Ab aap paste kar sakte hain.');
        };

        const shareWA = () => {
            const url = `https://wa.me/91${credentialData.mobile}?text=${encodeURIComponent(shareText)}`;
            window.open(url, '_blank');
        };

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border border-slate-200 text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 relative">
                        {credentialData.emailStatus === 'sending' ? (
                            <RefreshCcw size={32} className="animate-spin text-amber-500" />
                        ) : credentialData.emailStatus === 'sent' ? (
                            <CheckCircle2 size={40} />
                        ) : (
                            <AlertTriangle size={40} className="text-red-500" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            {credentialData.emailStatus === 'sending' ? 'Sending Email...' :
                                credentialData.emailStatus === 'sent' ? 'Email Sent! ✅' : 'Email Failed ❌'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {credentialData.emailStatus === 'failed' ? credentialData.error : 'Sharing credentials with user'}
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 relative group">
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{credentialData.portalType} ID</span>
                            <span className="text-xs font-black text-slate-800">{credentialData.idValue}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-tight">Mobile :</span>
                            <span className="font-black text-slate-700">{credentialData.mobile}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-tight">Pass :</span>
                            <span className="font-black text-slate-700">{credentialData.password}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={shareWA} className="w-full bg-[#25D366] text-white font-black py-4 rounded-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
                            <Megaphone size={16} /> Share on WhatsApp
                        </button>
                        <button onClick={copyAll} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
                            <Copy size={16} /> Copy Details
                        </button>
                    </div>

                    <button onClick={() => setShowCredentialCard(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600">Close Window</button>
                </motion.div>
            </div>
        );
    };


    const renderDistApprovalModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building2 size={20} className="text-amber-500" /> Approve Distributor
                    </h3>
                    <button onClick={() => setShowDistApprovalModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                {/* Email preview chip */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-5">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">📧 Credentials will be emailed to:</span>
                    <span className="text-xs font-black text-amber-700 ml-auto">{selectedDist?.email || 'No email on record'}</span>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Business Name</label>
                            <p className="p-3 bg-slate-50 rounded-lg font-bold text-amber-800 text-sm">{selectedDist?.businessName}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Login ID (Mobile)</label>
                            <p className="p-3 bg-slate-50 rounded-lg font-mono font-bold text-slate-700 text-sm">{selectedDist?.mobile}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Distributor ID <span className="text-amber-500">(editable)</span></label>
                        <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
                            value={distApprovalForm.distribId}
                            onChange={e => setDistApprovalForm({ ...distApprovalForm, distribId: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Login Password <span className="text-amber-500">(auto-generated, editable)</span></label>
                        <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
                            value={distApprovalForm.password}
                            onChange={e => setDistApprovalForm({ ...distApprovalForm, password: e.target.value })}
                        />
                    </div>
                    <button onClick={submitDistApproval}
                        className="w-full bg-amber-500 text-white font-black py-4 rounded-xl shadow-lg hover:bg-amber-400 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={16} /> Approve — Email Sends Automatically
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const renderAssignRetailersModal = () => {
        const allRetailers = (dataService.getData().users || []).filter(u => u.status === 'Approved' && u.username !== 'admin');
        const assignedToDist = assignTargetDist?.assignedRetailers || [];
        const filtered = allRetailers.filter(r =>
            r.name?.toLowerCase().includes(assignSearch.toLowerCase()) ||
            r.mobile?.includes(assignSearch) ||
            r.username?.includes(assignSearch)
        );
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 max-h-[80vh] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Assign Retailers</h3>
                        <button onClick={() => { setShowAssignModal(false); setAssignSearch(''); }} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
                    </div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">{assignTargetDist?.name}</p>
                    <input type="text" placeholder="Search retailer by name / mobile..." value={assignSearch}
                        onChange={e => setAssignSearch(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-amber-400 mb-3"
                    />
                    <div className="overflow-y-auto flex-1 space-y-2">
                        {filtered.length === 0 && <p className="text-center text-slate-400 text-sm py-8 font-bold">No approved retailers found.</p>}
                        {filtered.map((r, i) => {
                            const isAssigned = assignedToDist.includes(r.username);
                            const otherDist = !isAssigned ? sharedDataService.getDistributorForRetailer(r.username) : null;
                            return (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all
                                    ${isAssigned ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{r.name || r.username}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{r.mobile} · {r.state}</p>
                                        {otherDist && <p className="text-[9px] text-orange-500 font-black mt-0.5">Already under: {otherDist.name}</p>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isAssigned) {
                                                sharedDataService.unassignRetailerFromDistributor(assignTargetDist.id, r.username);
                                            } else {
                                                // unassign from any other dist first
                                                if (otherDist) sharedDataService.unassignRetailerFromDistributor(otherDist.id, r.username);
                                                sharedDataService.assignRetailerToDistributor(assignTargetDist.id, r.username);
                                            }
                                            setAssignTargetDist(sharedDataService.getDistributorById(assignTargetDist.id));
                                            refreshDists();
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-tight transition-all
                                            ${isAssigned
                                                ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                                                : 'bg-amber-500 text-white hover:bg-amber-400 shadow-md'}`}
                                    >
                                        {isAssigned ? <><UserMinus size={12} /> Unassign</> : <><UserPlus size={12} /> Assign</>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderAddDistributorModal = () => (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                            {showDistOTPView ? 'Confirm Identity' : 'Provision Distributor'}
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {showDistOTPView ? `Enter OTP sent to ${distForm.email}` : 'Direct registration with hierarchy assignment'}
                        </p>
                    </div>
                    <button onClick={() => { setShowAddDistModal(false); setShowDistOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {!showDistOTPView ? (
                    <form onSubmit={handleInviteDist} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                                <input required type="text" value={distForm.name} onChange={e => setDistForm({ ...distForm, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Full Name" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Agency Name</label>
                                <input required type="text" value={distForm.businessName} onChange={e => setDistForm({ ...distForm, businessName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Business Name" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                <input required type="tel" maxLength="10" value={distForm.mobile} onChange={e => setDistForm({ ...distForm, mobile: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Primary Contact" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                <input required type="email" value={distForm.email} onChange={e => setDistForm({ ...distForm, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="verification@email.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zone</label>
                                <select value={distForm.state} onChange={e => setDistForm({ ...distForm, state: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none">
                                    {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Mumbai'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                <input required type="text" value={distForm.city} onChange={e => setDistForm({ ...distForm, city: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="City" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign SuperAdmin (Owner)</label>
                            <select value={distForm.ownerId} onChange={e => setDistForm({ ...distForm, ownerId: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none">
                                <option value="">Direct (Admin Controlled)</option>
                                {superadmins.map(sa => <option key={sa.id} value={sa.id}>{sa.name} ({sa.businessName})</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Password</label>
                            <input required type="text" value={distForm.password} onChange={e => setDistForm({ ...distForm, password: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                        </div>

                        <div className="pt-6 sticky bottom-0 bg-white">
                            <button disabled={distAdding} type="submit" className="w-full bg-amber-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                {distAdding ? 'SENDING OTP...' : 'INITIATE PROVISIONING'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-10 space-y-10 text-center">
                        <div className="flex justify-center gap-3">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={distOtp[i] || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val) {
                                            const newOtp = distOtp.split('');
                                            newOtp[i] = val;
                                            setDistOtp(newOtp.join(''));
                                            if (e.target.nextSibling) e.target.nextSibling.focus();
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Backspace' && !distOtp[i] && e.target.previousSibling) {
                                            e.target.previousSibling.focus();
                                        }
                                    }}
                                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 transition-all outline-none"
                                />
                            ))}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleVerifyAndAddDist}
                                disabled={distVerifying || distOtp.length < 6}
                                className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                            >
                                {distVerifying ? 'VERIFYING...' : 'FINALIZE PROVISIONING'}
                            </button>
                            <button
                                onClick={() => setShowDistOTPView(false)}
                                className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                CANCEL & BACK
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );

    const DistributorsTable = () => {
        const pending = (distributors || []).filter(d => d?.status === 'Pending');
        const approved = (distributors || []).filter(d => d?.status === 'Approved');
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Pending Distributors */}
                {pending.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-amber-50/50">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Building2 size={18} className="text-amber-500" /> Pending Distributors</h3>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">{pending.length} PENDING</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Distributor</th>
                                        <th className="px-6 py-4">Business</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Applied On</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pending.map((d, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black">{d.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                                                        <p className="text-[10px] text-slate-400">{d.mobile} · {d.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{d.businessName}</td>
                                            <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{d.city}, {d.state}</td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    {approvingIds.has(d.id) ? (
                                                        <span className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase animate-pulse">
                                                            <RefreshCcw size={14} className="animate-spin" /> Processing
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleDistApproveClick(d)}
                                                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                                                title="Approve Distributor"
                                                            ><ShieldCheck size={16} /></button>
                                                            <button onClick={() => { if (window.confirm('Reject?')) { sharedDataService.rejectDistributor(d.id); refreshDists(); } }}
                                                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                                title="Reject"
                                                            ><X size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Approved Distributors */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Building2 size={18} className="text-emerald-500" /> Active Distributors</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddDistModal(true)}
                                className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:bg-amber-600 transition-all"
                            >
                                <Plus size={14} /> New Distributor
                            </button>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">{approved.length} ACTIVE</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Distributor</th>
                                    <th className="px-6 py-4">Dist ID</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Retailers</th>
                                    <th className="px-6 py-4">Wallet</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {approved.map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black">{d.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                                                    <p className="text-[10px] text-slate-400">{d.mobile} · {d.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-amber-600 text-xs">{d.id}</td>
                                        <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{d.city}, {d.state}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-full border border-blue-100">
                                                <Users size={11} />
                                                {(d.assignedRetailers || []).length} Retailers
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-blue-900 text-sm">₹ {d.wallet?.balance || '0.00'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleResendCredentials(d)}
                                                    className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                                                    title="Resend Credentials"
                                                >
                                                    <Mail size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setAssignTargetDist(d); setShowAssignModal(true); }}
                                                    className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1 px-2.5"
                                                    title="Assign Retailers"
                                                >
                                                    <Link2 size={14} />
                                                    <span className="text-[9px] font-black uppercase">Assign</span>
                                                </button>
                                                <button
                                                    onClick={() => handleLoginAsDistributor(d)}
                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 px-2.5"
                                                    title="Login as Distributor"
                                                >
                                                    <ArrowRight size={14} />
                                                    <span className="text-[9px] font-black uppercase">Login</span>
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChangeClick(d)}
                                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1 px-2"
                                                    title="Change User Role"
                                                >
                                                    <TrendingUp size={14} />
                                                    <span className="text-[9px] font-black uppercase">Role</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/distributor/${d.id}`)}
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="View Distributor Profile"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(d.username)}
                                                    className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100"
                                                ><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {approved.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <Building2 size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active distributors found</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">Check the <span className="text-emerald-500 font-black italic underline cursor-pointer" onClick={() => setActiveSection('Approvals')}>Approvals</span> tab for new registration requests.</p>
                                                </div>
                                                <button
                                                    onClick={() => { sharedDataService.resetToDefaults(); refreshDists(); }}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Restore Default Accounts
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const [adminViewingDoc, setAdminViewingDoc] = useState(null);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex relative overflow-hidden">
            {showApprovalModal && <ApprovalModal />}
            {showDistApprovalModal && renderDistApprovalModal()}
            {showSAApprovalModal && <SAApprovalModal />}
            {showRoleModal && <ChangeRoleModal />}
            {showAddSAModal && <AddSuperAdminModal />}
            {showAssignModal && assignTargetDist && renderAssignRetailersModal()}
            {showCredentialCard && renderCredentialSharerModal()}

            {/* Backdrop for Mobile */}
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileSidebar(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <div className={`fixed lg:relative w-64 bg-slate-900 text-white flex flex-col p-6 space-y-8 h-full z-50 transition-transform duration-300 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col items-center">
                    <img src={mainLogo} alt="RUPIKSHA" className="h-12 object-contain brightness-0 invert mb-2" />
                    <h1 className="text-xl font-black tracking-tighter italic text-emerald-400">RUPIKSHA ADMIN</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Global CMS Control</p>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                    {/* ── Simple nav items ── */}
                    {[
                        { id: 'Approvals', icon: CheckCircle2 },
                        { id: 'Dashboard', icon: LayoutDashboard },
                        { id: 'EmployeeManager', icon: ShieldCheck, label: 'Employment' },
                        { id: 'Landing Content', icon: FileText },
                        { id: 'Trash', icon: Trash2 },
                        { id: 'Services', icon: Package },
                        { id: 'Promotions', icon: Video },
                        { id: 'Stats', icon: BarChart3 },
                        { id: 'Logins', icon: RefreshCcw, label: 'Logins' },
                        { id: 'OurMap', icon: MapPin, label: 'Our Map' },
                        { id: 'Settings', icon: Settings, label: 'Settings' },
                    ].map(item => (
                        <button key={item.id}
                            onClick={() => { setActiveSection(item.id); setExpandedNav(null); setShowMobileSidebar(false); }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3
                                ${activeSection === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                            <item.icon size={17} />
                            <span className="text-sm font-bold uppercase tracking-wider">{item.label || item.id}</span>
                        </button>
                    ))}

                    {/* ── Expandable groups ── */}
                    {[
                        {
                            group: 'Super Distributor Control', icon: ShieldCheck, color: 'indigo',
                            children: [
                                { id: 'SuperDistributors', label: 'Super Dist Control' },
                                { id: 'Plans-superdistributor', label: 'SA Plans' },
                            ]
                        },
                        {
                            group: 'Distributors', icon: Building2, color: 'amber',
                            children: [
                                { id: 'Distributors', label: 'Dist Control' },
                                { id: 'Plans-distributor', label: 'Dist Plans' },
                            ]
                        },
                        {
                            group: 'Retailers', icon: Users, color: 'blue',
                            children: [
                                { id: 'Retailers', label: 'Retailer Control' },
                                { id: 'Plans-retailer', label: 'Retailer Plans' },
                            ]
                        },
                    ].map(({ group, icon: Icon, color, children }) => {
                        const isOpen = expandedNav === group;
                        const isActive = children.some(c => c.id === activeSection);
                        return (
                            <div key={group}>
                                <button
                                    onClick={() => setExpandedNav(isOpen ? null : group)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3
                                        ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                                    <Icon size={17} />
                                    <span className="text-sm font-bold uppercase tracking-wider flex-1">{group}</span>
                                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden ml-4 mt-1 space-y-1">
                                            {children.map(child => (
                                                <button key={child.id}
                                                    onClick={() => { setActiveSection(child.id); setShowMobileSidebar(false); }}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all flex items-center gap-2
                                                        ${activeSection === child.id
                                                            ? 'bg-white/15 text-white font-black'
                                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">{child.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {/* ── Plans (all) ── */}
                    <button
                        onClick={() => { setActiveSection('Plans'); setExpandedNav(null); setShowMobileSidebar(false); }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3
                            ${activeSection === 'Plans' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Crown size={17} />
                        <span className="text-sm font-bold uppercase tracking-wider">All Plans</span>
                    </button>
                </nav>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Portal
                </button>
            </div>

            <div className={`flex-1 overflow-y-auto ${activeSection === 'Dashboard' ? 'bg-[#020817]' : 'bg-slate-50'}`}>
                {activeSection !== 'Dashboard' && (
                    <header className="bg-white border-b border-slate-100 p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600 transition-colors"
                            >
                                <LayoutDashboard size={24} />
                            </button>
                            <div>
                                <h2 className="text-lg md:text-2xl font-bold text-slate-800 uppercase tracking-tight">{activeSection} Control</h2>
                                <p className="hidden sm:block text-xs text-slate-400 font-medium">Manage all application data in real-time</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={handleReset}
                                className="p-2 md:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                title="Reset to Defaults"
                            >
                                <RefreshCcw size={20} />
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm shadow-xl shadow-slate-900/20 flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                <Save size={18} className="hidden sm:block" />
                                Save
                            </button>
                        </div>
                    </header>
                )}

                <main className={activeSection === 'Dashboard' ? 'w-full min-h-full' : 'p-4 md:p-8 max-w-6xl mx-auto space-y-8'}>
                    {status && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                            <span className="text-sm font-bold uppercase tracking-wide">{status.message}</span>
                        </div>
                    )}

                    {activeSection === 'Approvals' && <ApprovalsTable />}
                    {activeSection === 'Dashboard' && <LiveDashboard data={data} distributors={distributors} superadmins={superadmins} />}
                    {activeSection === 'EmployeeManager' && <EmployeeManager />}
                    {activeSection === 'Landing Content' && <DashboardEditor />}
                    {activeSection === 'Trash' && <TrashTable />}
                    {activeSection === 'Stats' && <StatsEditor />}
                    {activeSection === 'Services' && <ServicesEditor />}
                    {activeSection === 'Promotions' && <PromotionsEditor />}
                    {activeSection === 'Logins' && <LoginsTable />}
                    {activeSection === 'Retailers' && <RetailersTable />}
                    {activeSection === 'Distributors' && <DistributorsTable />}
                    {activeSection === 'OurMap' && <OurMap />}

                    {/* ── Plans sections ── */}
                    {activeSection === 'Plans' && <AdminPlanManager defaultType="retailer" />}
                    {activeSection === 'Plans-retailer' && <AdminPlanManager defaultType="retailer" restrictType={true} />}
                    {activeSection === 'Plans-distributor' && <AdminPlanManager defaultType="distributor" restrictType={true} />}
                    {activeSection === 'Plans-superdistributor' && <AdminPlanManager defaultType="superdistributor" restrictType={true} />}

                    {activeSection === 'SuperDistributors' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Network Reach', val: superadmins.length, sub: 'Active Super Dists', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                                    { label: 'Managed Partners', val: distributors.length, sub: 'Linked Distributors', color: 'text-amber-600', bg: 'bg-amber-50/50' },
                                    { label: 'Total Retailers', val: (data.users || []).length, sub: 'Global Endpoints', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                                    { label: 'System Float', val: `₹ ${[...superadmins, ...distributors, ...(data.users || [])].reduce((acc, curr) => acc + parseFloat((curr.wallet?.balance || '0').replace(/,/g, '')), 0).toLocaleString()}`, sub: 'Locked Capital', color: 'text-slate-900', bg: 'bg-slate-50' },
                                ].map((stat, i) => (
                                    <div key={i} className={`${stat.bg} p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col justify-between`}>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                        <div className="mt-3">
                                            <h2 className={`text-xl font-black ${stat.color} tracking-tighter leading-tight`}>{stat.val}</h2>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{stat.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-8 py-6 border-b flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-base font-black text-slate-800 uppercase italic tracking-tight">Super Distributor Universe</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Hierarchical control & balance management</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowAddSAModal(true)}
                                            className="px-4 py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                                        >
                                            <Plus size={14} /> Add SA
                                        </button>
                                        <button onClick={refreshData} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                                            <RefreshCcw size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Partner Details</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Hierarchy Size</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Hierarchy Balance</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(superadmins || []).filter(s => s?.status === 'Approved').map((sa, idx) => {
                                                const distsUnder = distributors.filter(d => d.ownerId === sa.id);
                                                const retailersDirect = (data.users || []).filter(u => u.ownerId === sa.id);
                                                const retailersViaDist = (data.users || []).filter(u => {
                                                    const dist = sharedDataService.getDistributorForRetailer(u.username);
                                                    return dist && distsUnder.some(d => d.id === dist.id);
                                                });
                                                const totalRetailers = [...new Set([...retailersDirect, ...retailersViaDist])];

                                                const safeParse = (val) => parseFloat((val || '0').toString().replace(/,/g, ''));
                                                const hierarchyBalance = safeParse(sa.wallet?.balance) +
                                                    distsUnder.reduce((acc, d) => acc + safeParse(d.wallet?.balance), 0) +
                                                    totalRetailers.reduce((acc, r) => acc + safeParse(r.wallet?.balance), 0);

                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 text-white flex items-center justify-center text-xl font-black italic shadow-lg shadow-indigo-600/20">
                                                                    {sa.name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{sa.name}</p>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sa.businessName}</p>
                                                                    <div className="flex items-center gap-2 mt-1.5">
                                                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">ID: {sa.id}</span>
                                                                        <a
                                                                            href={`https://www.google.com/maps/search/?api=1&query=${sa.city}+${sa.state}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-[9px] font-black text-indigo-600 hover:underline flex items-center gap-1 uppercase"
                                                                        >
                                                                            <Link2 size={10} /> {sa.city}, {sa.state}
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-center bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                                                                    <p className="text-[9px] font-black text-amber-500 uppercase">Dists</p>
                                                                    <p className="text-sm font-black text-amber-700">{distsUnder.length}</p>
                                                                </div>
                                                                <div className="text-center bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                                                    <p className="text-[9px] font-black text-emerald-500 uppercase">Retailers</p>
                                                                    <p className="text-sm font-black text-emerald-700">{totalRetailers.length}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total System Balance</p>
                                                                <p className="text-lg font-black text-slate-900 tracking-tighter italic">₹ {hierarchyBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                                <p className="text-[8px] font-bold text-indigo-500 uppercase mt-0.5 tracking-widest">S.Dist Own: ₹ {sa.wallet?.balance || '0.00'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <div className="flex justify-center gap-3">
                                                                <button
                                                                    onClick={() => handleResendCredentials(sa)}
                                                                    className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100"
                                                                    title="Resend Credentials"
                                                                >
                                                                    <Mail size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        sessionStorage.setItem('superadmin_user', JSON.stringify(sa));
                                                                        navigate('/superadmin');
                                                                    }}
                                                                    className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                                >
                                                                    <Eye size={14} /> Full Access
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRoleChangeClick(sa)}
                                                                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"
                                                                    title="Change Role"
                                                                >
                                                                    <TrendingUp size={16} />
                                                                </button>
                                                                <button onClick={() => handleReject(sa.username)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'SuperAdmins' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-indigo-50/50">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-500" /> Super Distribution Panel</h3>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black">{superadmins.length} TOTAL</span>
                            </div>
                            <div className="p-12 text-center space-y-4">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 mx-auto border-2 border-dashed border-indigo-200">
                                    <ShieldCheck size={40} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Enhanced Control Ready</h4>
                                    <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Access hierarchical data, network mapping, and balance tracking in the new <b>Super Dist Control</b> section.</p>
                                </div>
                                <button onClick={() => setActiveSection('SuperDistributors')} className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-600/20">Switch to Advanced View</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'Settings' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* Service Management */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Zap size={18} className="text-blue-500" /> Service Toggle & Global Switches</h3>
                                    <span className="text-[10px] font-black text-slate-400">CONTROL LIVE SERVICES</span>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { id: 'aeps_active', label: 'AEPS Service', status: true },
                                        { id: 'cms_active', label: 'CMS Collections', status: true },
                                        { id: 'dmt_active', label: 'Money Transfer', status: true },
                                        { id: 'recharge_active', label: 'Utility & Recharge', status: true },
                                        { id: 'payout_active', label: 'Payout Hub', status: false }
                                    ].map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{service.label}</span>
                                            <button className={`w-12 h-6 rounded-full relative transition-colors ${service.status ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${service.status ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Commission Configuration */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><IndianRupee size={18} className="text-emerald-500" /> Commission Settings</h3>
                                    <span className="text-[10px] font-black text-slate-400">BY SERVICE TYPE</span>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Banking Commission (%)</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-600">AEPS Withdrawal</span>
                                                    <input type="text" className="w-16 bg-white border rounded p-1 text-center text-xs font-black" defaultValue="0.25%" />
                                                </div>
                                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-600">CMS (EMI Pay)</span>
                                                    <input type="text" className="w-16 bg-white border rounded p-1 text-center text-xs font-black" defaultValue="0.10%" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">API Provider Settings</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-600">Primary AEPS API</span>
                                                    <select className="bg-white border rounded p-1 text-[10px] font-bold">
                                                        <option>ICICI Bank (Direct)</option>
                                                        <option>PaisaWorld API</option>
                                                        <option>Fino Payments</option>
                                                    </select>
                                                </div>
                                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-xs font-bold text-slate-600">CMS Aggregator</span>
                                                    <select className="bg-white border rounded p-1 text-[10px] font-bold">
                                                        <option>BillAvenue</option>
                                                        <option>Bharat Connect</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Global App Metadata */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-4"><Settings size={18} className="text-slate-500" /> Platform Metadata</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">App Title</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" defaultValue="RUPIKSHA FINTECH" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Support Email</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" defaultValue="support@rupiksha.com" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showAddSAModal && <AddSuperAdminModal />}
                    {showAddDistModal && renderAddDistributorModal()}
                </main>
            </div>

            {/* Success Success Modal */}
            <AnimatePresence>
                {showSuccessView && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl text-center p-10 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400"></div>

                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10">
                                            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">CONGRATULATIONS</p>
                            <h2 className="text-3xl font-black text-slate-800 italic mb-2 tracking-tight">Account Provisioned!</h2>
                            <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">
                                Request processed successfully via RUPIKSHA Fintech Gateway
                            </p>

                            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 text-left space-y-3">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Login ID (Mobile):</span>
                                    <span className="text-slate-800">{createdCredentials?.loginId}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Password:</span>
                                    <span className="text-amber-600 font-mono text-sm">{createdCredentials?.password}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider pt-2 border-t border-slate-200">
                                    <span className="text-slate-400">Portal:</span>
                                    <span className="text-blue-600">{createdCredentials?.portalType}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSuccessView(false)}
                                className="w-full bg-[#0d1b2e] text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                CONTINUE TO DASHBOARD
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Admin;
