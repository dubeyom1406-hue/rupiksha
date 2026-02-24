import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Download, Calendar,

    FileText, ArrowUpRight, ArrowDownRight,
    RefreshCw, ChevronRight, LayoutGrid, Smartphone,
    Clock, CheckCircle, AlertCircle, IndianRupee, Fingerprint
} from 'lucide-react';
import { dataService } from '../../services/dataService';

const Icon3D = ({ icon: Icon, color, size = 48, shadow }) => (
    <div className="flex items-center justify-center rounded-2xl" style={{
        width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        boxShadow: shadow || `0 8px 16px ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
        position: 'relative', overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', right: '40%', bottom: '40%', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', filter: 'blur(3px)' }} />
        <Icon size={size * 0.5} color="white" strokeWidth={2.5} />
    </div>
);

const Reports = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTxns = () => {
            setLoading(true);
            const user = dataService.getCurrentUser();
            if (user) {
                const txns = dataService.getUserTransactions(user.username);
                setTransactions(txns);
            }
            setTimeout(() => setLoading(false), 500);
        };
        fetchTxns();
    }, []);


    const tabs = [
        { id: 'all', label: 'All Transactions', icon: LayoutGrid },
        { id: 'banking', label: 'Banking Hub', icon: IndianRupee },
        { id: 'utility', label: 'Utility & Bills', icon: RefreshCw },
        { id: 'travel', label: 'Travel', icon: Calendar },
    ];

    const filteredTxns = transactions.filter(t => {
        const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.service.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'banking' && t.service.toLowerCase().includes('aeps')) ||
            (activeTab === 'utility' && (t.service.toLowerCase().includes('recharge') || t.service.toLowerCase().includes('bill')));
        return matchesSearch && matchesTab;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            'Success': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
            'Failed': 'bg-rose-50 text-rose-600 border-rose-100'
        };
        const icons = {
            'Success': <CheckCircle size={12} />,
            'Pending': <Clock size={12} />,
            'Failed': <AlertCircle size={12} />
        };
        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${styles[status] || styles['Pending']}`}>
                {icons[status]}
                {status}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 font-['Inter',sans-serif]">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <Icon3D icon={FileText} color="#4a148c" size={48} />
                    <div>
                        <p className="text-[10px] font-black text-[#4a148c] uppercase tracking-[4px] mb-1">Business Intelligence</p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Transaction Reports</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time tracking of portal activities</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
                        <Download size={16} />
                        Export Data
                    </button>
                    <button onClick={() => window.location.reload()}
                        className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all active:rotate-180">
                        <RefreshCw size={20} className="text-[#4a148c]" />
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sales', val: transactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: IndianRupee, col: '#4a148c' },
                    { label: 'Success Rate', val: '98.4%', icon: CheckCircle, col: '#10b981' },
                    { label: 'Total Volume', val: transactions.length, icon: FileText, col: '#0ea5e9' },
                    { label: 'Pending Tix', val: '0', icon: Clock, col: '#f59e0b' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${s.col}15` }}>
                                <s.icon size={20} style={{ color: s.col }} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">+12.5%</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <p className="text-xl font-black text-slate-800 mt-0.5 tracking-tight">{s.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Tabs & Filters ── */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-[#4a148c] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-white'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Txn ID or Service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:border-[#4a148c] focus:ring-4 focus:ring-[#4a148c08] outline-none transition-all placeholder:text-slate-400 placeholder:font-bold"
                            />
                        </div>
                        <button className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:bg-white hover:border-[#4a148c] transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Table Container ── */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Date & Time</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Service Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Amount</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Status</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="animate-spin text-[#4a148c]" size={32} />
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Reports...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTxns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <Search size={32} className="text-slate-300" />
                                                </div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTxns.map((t, idx) => (
                                        <motion.tr
                                            key={t.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="hover:bg-[#4a148c03] transition-colors group cursor-default"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight group-hover:text-[#4a148c] transition-colors">#{t.id}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ref: {t.details?.utr || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-slate-600 tracking-tight">{new Date(t.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">

                                                        {t.service.toLowerCase().includes('recharge') ? <Smartphone size={14} className="text-blue-500" /> :
                                                            t.service.toLowerCase().includes('bill') ? <RefreshCw size={14} className="text-orange-500" /> :
                                                                <Fingerprint size={14} className="text-emerald-500" />}
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{t.service}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1 text-[13px] font-black text-slate-800 tracking-tight">
                                                    <span className="text-slate-400">₹</span>
                                                    {t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[#4a148c] hover:bg-white hover:border-[#4a148c] hover:shadow-lg hover:shadow-[#4a148c1a] transition-all active:scale-90">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {!loading && filteredTxns.length > 0 && (
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-800">{filteredTxns.length}</span> of {transactions.length} records
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-not-allowed">Prev</button>
                            <button className="px-4 py-2 bg-[#4a148c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
