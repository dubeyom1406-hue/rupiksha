import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { motion } from 'framer-motion';
import {
    Search, MoreHorizontal, Wallet, Briefcase, Tag,
    Filter, Send, Settings
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';

/* ─── tiny helpers ───────────────────────────────────────────────── */
const Badge = ({ children, color = 'amber' }) => {
    const map = {
        amber: 'bg-amber-50 text-amber-500 border-amber-200',
        emerald: 'bg-emerald-50 text-emerald-500 border-emerald-200',
        rose: 'bg-rose-50 text-rose-500 border-rose-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[color]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${color === 'amber' ? 'bg-amber-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {children}
        </span>
    );
};

/* ─── Premium Live Tooltip (Light) ───────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12, padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
            }}>
                <p style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
                {payload.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                        <span style={{ color: '#1e293b', fontWeight: 800, fontSize: 12 }}>₹{p.value?.toLocaleString()}</span>
                        <span style={{ color: '#94a3b8', fontSize: 9 }}>{p.name === 'revenue' ? 'Revenue' : 'Expense'}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/* ─── Live Location Map Component ───────────────────────────────── */
const LiveLocationMap = () => {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const watchRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }
        // Get initial position quickly
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) });
                setLoading(false);
            },
            () => {
                setError('Permission denied. Please allow location access.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
        // Watch for live updates
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) });
            },
            () => { },
            { enableHighAccuracy: true }
        );
        return () => {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        };
    }, []);

    const mapSrc = coords
        ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
        : null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    {/* Pulsing live dot */}
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <h2 className="text-sm font-bold text-[#1a1a2e]">Live Location</h2>
                </div>
                {coords && (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        ±{coords.acc}m accuracy
                    </span>
                )}
            </div>

            {/* Map area */}
            <div className="relative w-full h-[220px]">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
                        <p className="text-xs font-semibold text-slate-400">Getting your location…</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 px-6 text-center">
                        <div className="text-3xl">📍</div>
                        <p className="text-xs font-semibold text-rose-500">{error}</p>
                        <p className="text-[10px] text-slate-400">Enable location in browser settings and refresh.</p>
                    </div>
                )}
                {mapSrc && !loading && (
                    <iframe
                        key={`${coords.lat},${coords.lng}`}
                        src={mapSrc}
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Live Location"
                    />
                )}
            </div>

            {/* Coordinates footer */}
            {coords && (
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-600">{coords.lat.toFixed(5)}</span>
                        <span className="mx-1 text-slate-300">|</span>
                        <span className="font-bold text-slate-600">{coords.lng.toFixed(5)}</span>
                    </div>
                    <a
                        href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
                    >
                        Open in Maps ↗
                    </a>
                </div>
            )}
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const RetailerDashboard = () => {
    const navigate = useNavigate();
    const [appData, setAppData] = useState(dataService.getData());
    const [activeTxTab, setActiveTxTab] = useState('History');
    const currentUser = appData.currentUser;

    useEffect(() => {
        if (!currentUser) navigate('/');
    }, [currentUser]);

    useEffect(() => {
        const fn = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', fn);
        return () => window.removeEventListener('dataUpdated', fn);
    }, []);

    /* ── live chart data ────────────────────── */
    const mkPoint = () => {
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        const ss = now.getSeconds().toString().padStart(2, '0');
        return {
            t: `${hh}:${mm}:${ss}`,
            revenue: Math.floor(18000 + Math.random() * 12000),
            expense: Math.floor(6000 + Math.random() * 9000),
        };
    };
    const initData = Array.from({ length: 12 }, mkPoint);
    const [liveData, setLiveData] = useState(initData);
    const [liveStats, setLiveStats] = useState({ rev: initData[initData.length - 1].revenue, exp: initData[initData.length - 1].expense });

    useEffect(() => {
        const id = setInterval(() => {
            const pt = mkPoint();
            setLiveData(prev => [...prev.slice(-11), pt]);
            setLiveStats({ rev: pt.revenue, exp: pt.expense });
        }, 2000);
        return () => clearInterval(id);
    }, []);

    /* ── donut ──────────────────────────────── */
    const scoreData = [{ v: 690 }, { v: 310 }];

    /* ── transactions ───────────────────────── */
    const txns = [
        { name: 'John Lux', sub: 'Online Transfer', date: '21st Jun, 2022', time: '04:02:38 PM', amt: '$180.00', st: 'Pending', stColor: 'amber', av: 'https://i.pravatar.cc/36?u=1' },
        { name: 'Spotify', sub: 'Subscription', date: '19th Jun, 2022', time: '02:29:10 PM', amt: '$18.00', st: 'Completed', stColor: 'emerald', av: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png' },
        { name: 'Amazon', sub: 'Purchase', date: '18th Jun, 2022', time: '11:15:00 AM', amt: '$245.50', st: 'Failed', stColor: 'rose', av: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png' },
        { name: 'Pinterest', sub: 'Subscription', date: '17th Jun, 2022', time: '09:45:22 AM', amt: '$5.00', st: 'Completed', stColor: 'emerald', av: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png' },
    ];

    const recentAvatars = [
        'https://i.pravatar.cc/40?u=ra',
        'https://i.pravatar.cc/40?u=rb',
        'https://i.pravatar.cc/40?u=rc',
        'https://i.pravatar.cc/40?u=rd',
        'https://i.pravatar.cc/40?u=re',
    ];

    return (
        <>
            {/* Google Font */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); .dash-root * { font-family:'Inter',sans-serif; }`}</style>

            <div className="dash-root min-h-screen bg-[#F5F7FA] p-3 md:p-4">

                {/* ── TOP BAR ── */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-[22px] font-bold text-[#1a1a2e]">Overview</h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Search"
                                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 shadow-sm"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:bg-slate-50">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>

                {/* ── 2-COL GRID ── */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                    {/* ════ LEFT ════ */}
                    <div className="space-y-6">

                        {/* ── ROW 1: 3 Premium Stat Cards ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* Card 1 — Available Balance (Blue) */}
                            <motion.div
                                whileHover={{ y: -4, scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="relative rounded-2xl overflow-hidden cursor-default"
                                style={{
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
                                    boxShadow: '0 12px 28px -8px rgba(37,99,235,0.45)'
                                }}
                            >
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                                <div className="relative p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10">
                                            <Wallet size={16} className="text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 bg-emerald-400/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                                            <span className="text-[9px] font-black text-emerald-300">↑ +12.4%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-blue-200 font-bold uppercase tracking-[0.18em] mb-0.5">Available Balance</p>
                                        <p className="text-[19px] font-black text-white tracking-tight leading-none">₹1,82,245<span className="text-sm text-blue-300 font-semibold">.95</span></p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2 — Total Spending (Violet) */}
                            <motion.div
                                whileHover={{ y: -4, scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="relative rounded-2xl overflow-hidden cursor-default"
                                style={{
                                    background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #8b5cf6 100%)',
                                    boxShadow: '0 12px 28px -8px rgba(124,58,237,0.45)'
                                }}
                            >
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                                <div className="relative p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10">
                                            <Briefcase size={16} className="text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 bg-rose-400/20 border border-rose-400/30 px-2 py-0.5 rounded-full">
                                            <span className="text-[9px] font-black text-rose-300">↓ -8.1%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-purple-200 font-bold uppercase tracking-[0.18em] mb-0.5">Total Spending</p>
                                        <p className="text-[19px] font-black text-white tracking-tight leading-none">₹36,631<span className="text-sm text-purple-300 font-semibold">.08</span></p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 3 — Subscriptions (Teal) */}
                            <motion.div
                                whileHover={{ y: -4, scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="relative rounded-2xl overflow-hidden cursor-default"
                                style={{
                                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)',
                                    boxShadow: '0 12px 28px -8px rgba(13,148,136,0.45)'
                                }}
                            >
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                                <div className="relative p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10">
                                            <Tag size={16} className="text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 bg-emerald-400/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                                            <span className="text-[9px] font-black text-emerald-300">↑ +3.2%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-teal-200 font-bold uppercase tracking-[0.18em] mb-0.5">Subscriptions</p>
                                        <p className="text-[19px] font-black text-white tracking-tight leading-none">₹6,620<span className="text-sm text-teal-300 font-semibold">.00</span></p>
                                    </div>
                                </div>
                            </motion.div>

                        </div>


                        {/* ── ROW 2: Live Analytics Chart (White) ── */}
                        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white">

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h2 className="text-sm font-black text-[#1a1a2e]">Analytics Report</h2>
                                            <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                                Live
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-[10px] font-semibold">Updates every 2 seconds</p>
                                    </div>
                                </div>
                                {/* Mini stat pills */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Revenue</p>
                                        <p className="text-sm font-black text-violet-600">₹{liveStats.rev.toLocaleString()}</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100" />
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Expense</p>
                                        <p className="text-sm font-black text-cyan-600">₹{liveStats.exp.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-[200px] px-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={liveData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.18} />
                                                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0891b2" stopOpacity={0.14} />
                                                <stop offset="100%" stopColor="#0891b2" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="t" axisLine={false} tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} dy={6}
                                            interval={2}
                                        />
                                        <YAxis axisLine={false} tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 9 }}
                                            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotoneX" dataKey="revenue"
                                            stroke="#7c3aed" strokeWidth={2.5}
                                            fill="url(#gradRev)"
                                            dot={false}
                                            activeDot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                                            isAnimationActive={false}
                                        />
                                        <Area
                                            type="monotoneX" dataKey="expense"
                                            stroke="#0891b2" strokeWidth={2.5}
                                            fill="url(#gradExp)"
                                            dot={false}
                                            activeDot={{ r: 5, fill: '#0891b2', stroke: '#fff', strokeWidth: 2 }}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Footer legend */}
                            <div className="flex items-center gap-5 px-5 py-3 border-t border-slate-50">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1 rounded-full bg-violet-500 inline-block" />
                                    <span className="text-[10px] text-slate-500 font-semibold">Revenue</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1 rounded-full bg-cyan-500 inline-block" />
                                    <span className="text-[10px] text-slate-500 font-semibold">Expense</span>
                                </div>
                                <div className="ml-auto text-[9px] text-slate-300 font-semibold">Last 12 ticks · 2s interval</div>
                            </div>
                        </div>

                        {/* ── ROW 3: All Transactions ── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Head */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                                <h2 className="text-base font-bold text-[#1a1a2e]">All Transactions</h2>
                                <div className="flex items-center gap-2">
                                    {['History', 'Completed', 'Pending', 'Failed'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTxTab(tab)}
                                            className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${activeTxTab === tab ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                    <button className="ml-1 text-slate-400 hover:text-slate-600"><Filter size={15} /></button>
                                </div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-slate-50">
                                {txns.map((t, i) => (
                                    <div key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                            <img src={t.av} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        {/* Name / type */}
                                        <div>
                                            <p className="text-[13px] font-semibold text-slate-800">{t.name}</p>
                                            <p className="text-[11px] text-slate-400">{t.sub}</p>
                                        </div>
                                        {/* Date */}
                                        <p className="text-[11px] text-slate-400 hidden sm:block">{t.date}</p>
                                        {/* Time */}
                                        <p className="text-[11px] text-slate-400 hidden md:block">{t.time}</p>
                                        {/* Amount */}
                                        <p className="text-[13px] font-bold text-slate-800">{t.amt}</p>
                                        {/* Status */}
                                        <Badge color={t.stColor}>{t.st}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ════ RIGHT ════ */}
                    <div className="space-y-6">

                        {/* ── Single Real VISA Card ── */}
                        <motion.div
                            whileHover={{ y: -6, scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            className="relative w-full aspect-[1.586/1] rounded-2xl shadow-xl overflow-hidden cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 35%, #a855f7 60%, #c026d3 100%)',
                                boxShadow: '0 16px 36px -8px rgba(109,40,217,0.5), 0 6px 12px -6px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute -bottom-10 -right-6 w-36 h-36 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

                            <div className="relative h-full flex flex-col justify-between p-4">

                                {/* Top row: Chip + VISA */}
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-6 rounded-md shadow-inner relative overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #f9d423 0%, #e8b200 50%, #c9950a 100%)' }}
                                    >
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-black/15" />
                                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black/15" />
                                        <div className="absolute inset-[3px] border border-black/10 rounded-sm" />
                                    </div>
                                    <span className="text-white font-black italic text-base tracking-tight"
                                        style={{ fontFamily: "'Times New Roman', serif", textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                        VISA
                                    </span>
                                </div>

                                {/* Middle: card number */}
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-3 text-white/70">
                                        <span className="tracking-[0.28em] text-sm leading-none">••••</span>
                                        <span className="tracking-[0.28em] text-sm leading-none">••••</span>
                                        <span className="tracking-[0.28em] text-sm leading-none">••••</span>
                                    </div>
                                    <div className="text-white font-bold text-base tracking-[0.28em]">2345</div>
                                </div>

                                {/* Bottom row */}
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[7px] text-white/40 uppercase tracking-[0.15em] font-bold mb-0.5">Card Holder</p>
                                        <p className="text-[11px] text-white font-bold tracking-wide leading-none">
                                            {currentUser?.name || 'raushan'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[7px] text-white/40 uppercase tracking-[0.15em] font-bold mb-0.5">Expiry</p>
                                        <p className="text-[11px] text-white font-bold tracking-wide leading-none">02/30</p>
                                    </div>
                                    <span className="text-white/25 font-black italic text-xl"
                                        style={{ fontFamily: "'Times New Roman', serif" }}>
                                        VISA
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                        {/* ── Live Location Map ── */}
                        <LiveLocationMap />

                        {/* ── Quick Transfer ── */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em]">Quick Transfer</h2>

                            <div className="flex gap-2">
                                <input
                                    placeholder="Account number"
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all">
                                    <Send size={18} />
                                </button>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Transfer</p>
                                <div className="flex items-center gap-2">
                                    {recentAvatars.map((av, i) => (
                                        <motion.button
                                            key={i} whileHover={{ scale: 1.15, y: -2 }}
                                            className="w-9 h-9 rounded-full border-2 border-white shadow overflow-hidden"
                                        >
                                            <img src={av} alt="" className="w-full h-full object-cover" />
                                        </motion.button>
                                    ))}
                                    <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors shadow">
                                        <Settings size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default RetailerDashboard;
