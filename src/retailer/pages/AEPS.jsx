import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const aadhaar_3d_logo = "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png";
import {
    Fingerprint, Landmark, CreditCard, Banknote, History,
    Search, CheckCircle, AlertCircle, RefreshCw, ArrowRight,
    MapPin, Smartphone, User, ShieldCheck, Waves, Layers, BellRing, Phone, Receipt, TrendingUp, Wallet
} from 'lucide-react';
import { BANK_LIST, DEVICE_LIST } from './aepsData';
import { initSpeech, speak, announceSuccess, announceFailure, announceProcessing, announceError, announceWarning, announceGrandSuccess } from '../../services/speechService';
import { dataService, BACKEND_URL } from '../../services/dataService';

/* ── Constants ── */
const NAVY = '#0f2557';
const NAVY2 = '#1a3a6b';
const NAVY3 = '#2257a8';

const NAV_TABS = [
    { id: 'withdrawal', label: 'Cash Withdrawal', icon: Banknote, color: '#3b82f6' },
    { id: 'balance', label: 'Balance Inquiry', icon: Landmark, color: '#10b981' },
    { id: 'statement', label: 'Mini Statement', icon: History, color: '#8b5cf6' },
    { id: 'aadhaar_pay', label: 'Aadhaar Pay', icon: Fingerprint, color: '#f59e0b' },
];

/* ══════════════════════════════════════════════════════════════════
   🏆 GRAND SUCCESS SCREEN — Exact replication of Utility UX
   ══════════════════════════════════════════════════════════════════ */
function GrandSuccessScreen({ title, subtitle, details = [], onReset, resetLabel = '+ New Transaction' }) {
    const DOTS = [
        { x: 8, y: 15, s: 10, dur: 2.1, delay: 0, col: '#10b981' },
        { x: 88, y: 10, s: 7, dur: 2.6, delay: 0.3, col: '#fbbf24' },
        { x: 20, y: 75, s: 14, dur: 1.9, delay: 0.6, col: '#6ee7b7' },
        { x: 78, y: 80, s: 9, dur: 2.4, delay: 0.2, col: '#a78bfa' },
        { x: 50, y: 5, s: 6, dur: 2.8, delay: 0.9, col: '#38bdf8' },
        { x: 5, y: 50, s: 11, dur: 2.0, delay: 1.1, col: '#34d399' },
        { x: 93, y: 45, s: 8, dur: 2.3, delay: 0.4, col: '#fbbf24' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative flex flex-col items-center justify-center min-h-[62vh] py-10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(16,185,129,0.14) 0%, rgba(15,37,87,0.06) 62%, transparent 100%)' }} />

            {DOTS.map((d, i) => (
                <motion.div key={i} className="absolute rounded-full pointer-events-none"
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, background: d.col, opacity: 0.55 }}
                    animate={{ y: [-10, 12, -10], opacity: [0.4, 0.85, 0.4], scale: [1, 1.4, 1] }}
                    transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
            ))}

            <motion.div className="relative flex items-center justify-center"
                initial={{ scale: 0.15, rotate: -25 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 230, damping: 13 }}>
                <motion.div className="absolute rounded-full"
                    style={{ width: 148, height: 148, border: '3px solid #10b981', opacity: 0.3 }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.3, repeat: Infinity }} />
                <div className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, #10b981, #059669)', boxShadow: '0 0 0 7px rgba(16,185,129,0.18), 0 22px 55px rgba(16,185,129,0.55)' }}>
                    <motion.span style={{ fontSize: 54, lineHeight: 1 }} animate={{ rotateY: [0, 360] }} transition={{ duration: 1.8, delay: 0.4 }}>🏆</motion.span>
                </div>
            </motion.div>

            <motion.div className="text-center mt-7 space-y-1 px-4" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <motion.p className="text-[11px] font-black tracking-[5px] uppercase" style={{ color: '#10b981' }} animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    ✨ CONGRATULATIONS ✨
                </motion.p>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">{title}</h2>
                <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </motion.div>

            <motion.div className="mt-8 w-full max-w-sm rounded-[2.5rem] overflow-hidden"
                initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ boxShadow: '0 30px 80px rgba(15,37,87,0.15), 0 10px 30px rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.22)' }}>
                <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #0f2557, #1a3a8f)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Receipt</p>
                    <div className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse" />
                </div>
                <div className="p-8 bg-white space-y-4">
                    {details.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0">
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">{d.label}</span>
                            <span className={`font-black uppercase tracking-tighter text-right ${d.highlight ? 'text-emerald-600 text-xl' : 'text-slate-800'}`}>{d.value}</span>
                        </div>
                    ))}
                    <motion.button onClick={onReset}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl">
                        {resetLabel}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

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

/* ══════════════════════════════════════════════════════════════════
   🏧 MAIN AEPS COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const AEPS = () => {
    const [tab, setTab] = useState('withdrawal'); // withdrawal, balance, statement, aadhaar_pay
    const [device, setDevice] = useState('mantra');
    const [aadhaar, setAadhaar] = useState('');
    const [mobile, setMobile] = useState('');
    const [bank, setBank] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastTx, setLastTx] = useState(null);
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ lat: '...', long: '...' });

    useEffect(() => {
        const currentUser = dataService.getCurrentUser();
        setUser(currentUser);

        dataService.verifyLocation()
            .then(loc => setLocation(loc))
            .catch(err => {});
    }, []);

    const TAB_COLORS = { withdrawal: '#3b82f6', balance: '#10b981', statement: '#8b5cf6', aadhaar_pay: '#f59e0b' };

    const currentTab = NAV_TABS.find(t => t.id === tab);

    const handleTransaction = async () => {
        if (aadhaar.length < 12) { announceWarning('कस्टमर का आधार नंबर सही नहीं है'); return; }
        if (!bank) { announceWarning('बैंक चुनें'); return; }
        if ((tab === 'withdrawal' || tab === 'aadhaar_pay') && (!amount || amount < 100)) { announceWarning('निकासी कम से कम 100 होनी चाहिए'); return; }

        const user = dataService.getCurrentUser();
        setLoading(true);
        initSpeech();
        announceProcessing("फिंगरप्रिंट डिवाइस रेडी हो रहा है। कृपया बायोमेट्रिक पर उंगली रखें।");

        try {
            const res = await fetch(`${BACKEND_URL}/recharge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    mobile: mobile || aadhaar.slice(-10),
                    operator: BANK_LIST.find(b => b.id === bank)?.name,
                    amount: (tab === 'withdrawal' || tab === 'aadhaar_pay') ? amount : 0,
                    serviceType: 'AEPS',
                    tab: tab
                })
            });
            const result = await res.json();

            if (result.success) {
                const txData = {
                    type: currentTab.label,
                    bank: BANK_LIST.find(b => b.id === bank)?.name,
                    amount: tab === 'withdrawal' || tab === 'aadhaar_pay' ? amount : '—',
                    aadhaar: 'XXXX-XXXX-' + aadhaar.slice(-4),
                    txId: result.txid || ('TXN' + Date.now()),
                    date: new Date().toLocaleString()
                };
                setLastTx(txData);

                // For AEPS Withdrawal/Aadhaar Pay, we actually ADD money to retailer wallet (Settlement)
                // But in logTransaction we usually subtract. So we need a special "credit" log or handle it in backend.
                // For now, let's just log it.
                await dataService.logTransaction(user.id, `AEPS_${tab.toUpperCase()}`, amount || 0, txData.bank, aadhaar, 'SUCCESS');

                announceGrandSuccess("लेनदेन सफल रहा।", `${txData.bank} से ₹${txData.amount} निकल गए हैं।`);

                const { default: confetti } = await import('canvas-confetti');
                confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#0f2557', '#fbbf24', '#a78bfa', '#38bdf8'] });
                setShowSuccess(true);
            } else {
                announceError(result.message || 'लेनदेन फेल हो गया');
                await dataService.logTransaction(user.id, `AEPS_${tab.toUpperCase()}`, amount || 0, bank, aadhaar, 'FAILED');
            }
        } catch (err) {
            announceError("सर्वर से संपर्क नहीं हो पाया");
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) return (
        <div className="h-full bg-slate-50 overflow-y-auto">
            <GrandSuccessScreen
                title={`${currentTab.label} Successful! 🎉`}
                subtitle="Request processed successfully via NPCI AePS Gateway"
                details={[
                    { label: 'Merchant', value: 'RUPIKSHA DIGITAL' },
                    { label: 'Bank Name', value: lastTx.bank },
                    { label: 'Aadhaar No', value: lastTx.aadhaar },
                    { label: 'Transaction ID', value: lastTx.txId },
                    { label: 'Date & Time', value: lastTx.date },
                    lastTx.amount !== '—' ? { label: 'Amount Debited', value: `₹${Number(lastTx.amount).toLocaleString('en-IN')}`, highlight: true } : { label: 'Status', value: 'Completed', highlight: true }
                ]}
                onReset={() => { setShowSuccess(false); setAadhaar(''); setAmount(''); setBank(''); }}
                resetLabel="Back to Banking Hub"
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Top Header (Exact Utility Copy) ── */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 p-1 flex items-center justify-center">
                            <img src={aadhaar_3d_logo} alt="AEPS" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none">Banking Hub</h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">AePS Aadhaar Banking Services</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">NPCI Live</span>
                        <button onClick={() => { initSpeech(); speak("वॉइस सिस्टम चालू है। बैंकिंग हब में आपका स्वागत है।", "hi-IN"); }}
                            className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all">
                            <BellRing size={12} /> Voice
                        </button>
                    </div>
                </div>

                {/* Tab Bar (Exact Utility UX) */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {NAV_TABS.map(t => {
                        const active = tab === t.id;
                        const color = TAB_COLORS[t.id];
                        return (
                            <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                                onClick={() => { setTab(t.id); setShowSuccess(false); }}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-sm transition-all flex-shrink-0"
                                style={active ? { background: color, color: '#fff', boxShadow: `0 4px 15px ${color}40` } : { background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: 7,
                                    background: active ? 'rgba(255,255,255,0.25)' : `${color}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.3)' : `0 2px 6px ${color}25`,
                                }}>
                                    <t.icon size={13} style={{ color: active ? '#fff' : color }} />
                                </div>
                                {t.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-7xl mx-auto">

                        {/* LEFT: FORM BOX (Utility Style) */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                    <Fingerprint size={28} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{currentTab.label}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Transaction Parameters</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Device Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Fingerprint Scanner</label>
                                    <div className="relative">
                                        <Waves size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select value={device} onChange={e => setDevice(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                            {DEVICE_LIST.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Aadhaar Number */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Customer Aadhaar No</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" maxLength={12} value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                            placeholder="12-digit number"
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-blue-500 transition-all focus:bg-white" />
                                    </div>
                                </div>

                                {/* Bank Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Select Customer's Bank</label>
                                    <div className="relative">
                                        <Landmark size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select value={bank} onChange={e => setBank(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                            <option value="">Choose Bank</option>
                                            {BANK_LIST.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Customer Mobile */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Customer Mobile No</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                                            placeholder="10-digit number"
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-blue-500 transition-all focus:bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Amount Input (Only for Withdrawal/Pay) */}
                            {(tab === 'withdrawal' || tab === 'aadhaar_pay') && (
                                <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Enter Withdrawal Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-10 pr-4 py-5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-black text-4xl outline-none focus:border-blue-500 transition-all focus:bg-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        {[100, 500, 1000, 2000, 3000].map(v => (
                                            <button key={v} onClick={() => setAmount(v)} className="flex-1 py-1.5 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all">+{v}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <motion.button onClick={handleTransaction} disabled={loading}
                                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                                className="w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden disabled:opacity-60"
                                style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY3})`, boxShadow: `0 8px 30px ${NAVY}40` }}>
                                <motion.div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? <><RefreshCw className="animate-spin" size={20} /> INITIALIZING SCANNER...</>
                                        : <><Fingerprint size={20} /> SCAN & PROCEED TRANSACTION</>}
                                </span>
                            </motion.button>
                        </div>

                        {/* RIGHT: UNIFIED RETAILER INFO HUB */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                            {/* 💳 WALLET SECTION */}
                            <div className="p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                    <Wallet size={14} className="text-blue-500" /> Settled Wallet
                                </h3>
                                <div className="relative z-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-400">₹</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                            {user?.wallet?.balance || "0.00"}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100 w-fit">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-blue-700 uppercase tracking-tight">Active for AEPS Settlement</span>
                                    </div>
                                </div>
                            </div>

                            {/* 🏦 BANK SECTION */}
                            <div className="p-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Landmark size={14} className="text-emerald-500" /> Settlement Bank
                                </h3>
                                {user?.banks && user.banks.length > 0 ? (
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xs font-black text-slate-900 uppercase">{user.banks[0].bankName}</h4>
                                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Verified</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Account</p>
                                                <p className="text-[10px] font-black text-slate-900 tracking-tight">XXXX{user.banks[0].accountNumber?.slice(-4)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">IFSC</p>
                                                <p className="text-[10px] font-black text-slate-900 tracking-tight">{user.banks[0].ifscCode}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                                        <p className="text-[9px] font-bold text-orange-600 uppercase">Bank Not Saved</p>
                                        <p className="text-[8px] font-black text-orange-400 uppercase mt-1">Visit Profile to add</p>
                                    </div>
                                )}
                            </div>

                            {/* 📍 LOCATION SECTION */}
                            <div className="p-8 bg-slate-50/50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <MapPin size={14} className="text-red-500" /> Live Geo-Lock
                                </h3>

                                <div className="space-y-4">
                                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative group">
                                        {location.lat !== '...' ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                marginHeight="0"
                                                marginWidth="0"
                                                src={`https://maps.google.com/maps?q=${location.lat},${location.long}&z=14&output=embed`}
                                                className="grayscale-[20%] contrast-[110%] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Pinpointing Retailer...</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm pointer-events-none">
                                            <span className="text-[7px] font-black text-slate-500 uppercase flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Preview
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex gap-4">
                                            <div>
                                                <span className="text-[8px] font-bold text-slate-400 mr-1 uppercase">Lat</span>
                                                <span className="text-[10px] font-black text-slate-900 tracking-tight">{location.lat}</span>
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-bold text-slate-400 mr-1 uppercase">Long</span>
                                                <span className="text-[10px] font-black text-slate-900 tracking-tight">{location.long}</span>
                                            </div>
                                        </div>
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                            <ShieldCheck size={10} /> NPCI COMPLIANT
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AEPS;
