import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Download, UserPlus,
    CheckCircle2, AlertCircle, Clock, X,
    Eye, Wallet, Smartphone, Mail, MapPin
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { sharedDataService } from '../../services/sharedDataService';

const Retailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', businessName: '', mobile: '', email: '',
        password: 'retailer123', state: 'Bihar', city: ''
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessView, setShowSuccessView] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const allUsers = await dataService.getAllUsers();
            // Filter retailers (you might want to show all for Super Admin, or differentiate)
            setRetailers(allUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        window.addEventListener('dataUpdated', handleUpdate);
        window.addEventListener('SuperAdminDataUpdated', handleUpdate);
        return () => {
            window.removeEventListener('dataUpdated', handleUpdate);
            window.removeEventListener('SuperAdminDataUpdated', handleUpdate);
        };
    }, []);

    const [showOTPView, setShowOTPView] = useState(false);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);

        const emailModule = await import('../../services/emailService');
        const res = await emailModule.sendOTPEmail(formData.email, code, formData.name);

        setLoading(false);
        if (res.success) {
            setShowOTPView(true);
        } else {
            alert("Failed to send OTP. Please check email address.");
        }
    };

    const handleVerifyAndAdd = async () => {
        if (otp !== generatedOtp) {
            alert("Invalid OTP! Access Denied.");
            return;
        }

        setVerifying(true);
        try {
            const sa = sharedDataService.getCurrentSuperAdmin();
            const newUser = dataService.registerUser(formData, sa ? sa.id : 'SUPERADMIN');

            const creds = {
                to: formData.email,
                name: formData.name,
                loginId: formData.mobile, // Using mobile as Login ID
                password: formData.password,
                addedBy: sa ? `Super Admin: ${sa.name}` : 'Super Admin',
                portalType: 'Retailer'
            };

            // Send Credentials Email
            const emailModule = await import('../../services/emailService');
            await emailModule.sendCredentialsEmail(creds);

            setCreatedCredentials(creds);
            setShowSuccessView(true);
            setShowAddModal(false);
            setShowOTPView(false);
            setFormData({ name: '', businessName: '', mobile: '', email: '', password: 'retailer123', state: 'Bihar', city: '' });
        } catch (err) {
            alert("Error adding retailer");
        } finally {
            setVerifying(false);
        }
    };

    const filtered = retailers.filter(r => {
        const matchesSearch = (r.name || r.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.mobile || '').includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const active = retailers.filter(r => r.status === 'Approved');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 font-['Montserrat',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-amber-500/50">Global Retailer Ledger</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full administrative control over all retail endpoints</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export Global Data
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-amber-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={14} /> Provision Retailer
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search global network..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white text-sm transition-all font-black"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                ${statusFilter === status
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden border-separate">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hub</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-xs font-black shadow-inner">
                                                {(r.name || r.username || 'R').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{r.name || r.username}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {r.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-600 flex items-center gap-1.5"><Smartphone size={12} className="text-amber-500" /> {r.mobile}</p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Mail size={12} className="shrink-0 text-slate-300" /> {r.email || '—'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.city || '—'}, {r.state}</p>
                                        {r.latitude && r.longitude && (
                                            <p className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">LOC: {r.latitude}, {r.longitude}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-800 font-mono tracking-tight">₹ {parseFloat(r.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                            ${r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                r.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-red-50 text-red-600 border-red-100'}`}>
                                            {r.status === 'Approved' ? <CheckCircle2 size={10} /> :
                                                r.status === 'Pending' ? <Clock size={10} /> : <AlertCircle size={10} />}
                                            {r.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedRetailer(r)}
                                            className="p-2.5 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm border border-slate-100"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <Users size={64} strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em]">No Retailers Found In Database</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Global Network', val: retailers.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Verified Partners', val: active.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Onboarding', val: retailers.filter(r => r.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{stat.val}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                            <stat.icon size={32} strokeWidth={1.5} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Retailer Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
                                        {showOTPView ? 'Confirm Pin' : 'Provision Endpoint'}
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {showOTPView ? `Identity verification for ${formData.email}` : 'SuperAdmin direct allocation of retail accounts'}
                                    </p>
                                </div>
                                <button onClick={() => { setShowAddModal(false); setShowOTPView(false); }} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {!showOTPView ? (
                                <form onSubmit={handleInvite} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Endpoint Name" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop Name</label>
                                            <input required type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Business ID" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile No</label>
                                            <input required type="tel" maxLength="10" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="10 Digit UID" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="system@email.com" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zone</label>
                                            <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none font-black italic uppercase">
                                                {['Bihar', 'UP', 'MP', 'Delhi', 'West Bengal', 'Mumbai'].map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                            <input required type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" placeholder="Hub Name" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Password</label>
                                        <input required type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none" />
                                    </div>

                                    <div className="pt-6 sticky bottom-0 bg-white">
                                        <button disabled={loading} type="submit" className="w-full bg-[#0d1b2e] text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                            {loading ? 'DISPATCHING OTP...' : 'INITIATE PROVISIONING'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-10 space-y-10 text-center">
                                    <div className="flex justify-center gap-3">
                                        {[...Array(6)].map((_, i) => (
                                            <input
                                                key={i}
                                                id={`otp-${i}`}
                                                type="text"
                                                maxLength="1"
                                                value={otp[i] || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (!/^\d*$/.test(val)) return;

                                                    const newOtp = otp.split('');
                                                    newOtp[i] = val.slice(-1);
                                                    setOtp(newOtp.join(''));

                                                    if (val && i < 5) {
                                                        const nextInput = document.getElementById(`otp-${i + 1}`);
                                                        if (nextInput) nextInput.focus();
                                                    }
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Backspace') {
                                                        if (!otp[i] && i > 0) {
                                                            const prevInput = document.getElementById(`otp-${i - 1}`);
                                                            if (prevInput) {
                                                                prevInput.focus();
                                                                const newOtp = otp.split('');
                                                                newOtp[i - 1] = '';
                                                                setOtp(newOtp.join(''));
                                                            }
                                                        } else {
                                                            const newOtp = otp.split('');
                                                            newOtp[i] = '';
                                                            setOtp(newOtp.join(''));
                                                        }
                                                    }
                                                }}
                                                className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 transition-all outline-none"
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleVerifyAndAdd}
                                            disabled={verifying || otp.length < 6}
                                            className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {verifying ? 'VERIFYING...' : 'FINALIZE PROVISIONING'}
                                        </button>
                                        <button
                                            onClick={() => setShowOTPView(false)}
                                            className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                                        >
                                            CANCEL & BACK
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedRetailer && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-black shadow-xl italic">
                                        {(selectedRetailer.name || selectedRetailer.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-amber-500/30">{selectedRetailer.name || selectedRetailer.username}</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {selectedRetailer.status}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedRetailer(null)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-2xl transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-amber-500 pl-3">Retailer Profile</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Mobile SID</p>
                                                <p className="text-sm font-black text-slate-700">{selectedRetailer.mobile}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Business ID</p>
                                                <p className="text-sm font-black text-slate-700 capitalize">{selectedRetailer.businessName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Registered Agent</p>
                                                <p className="text-xs font-black text-slate-400">{selectedRetailer.registeredAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#0d1b2e] rounded-[2rem] p-8 text-white space-y-6 shadow-2xl shadow-indigo-900/40">
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Global Balance</p>
                                        <div>
                                            <p className="text-3xl font-black italic tracking-tighter">₹ {selectedRetailer.wallet?.balance || '0.00'}</p>
                                            <p className="text-[8px] font-black text-white/30 uppercase mt-1 tracking-widest">Active Credit Line</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex justify-between gap-4">
                                            <button className="flex-1 bg-white text-[#0d1b2e] text-[10px] font-black py-3 rounded-xl uppercase tracking-tighter hover:bg-amber-500 hover:text-white transition-all">DEBIT</button>
                                            <button className="flex-1 bg-amber-500 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-tighter hover:bg-white hover:text-black transition-all">CREDIT</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200">SUSPEND ACCESS</button>
                                    <button className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-2xl transition-all">MASQUERADE AS USER</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <h2 className="text-3xl font-black text-slate-800 italic mb-2 tracking-tight">Retailer Provisioned!</h2>
                            <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">
                                Request processed successfully via RUPIKSHA Fintech Gateway
                            </p>

                            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 text-left space-y-3">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                    <span className="text-slate-400">Login ID:</span>
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

export default Retailers;
