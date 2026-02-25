import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   3D Icon Component – renders a floating emoji with glow shadow
───────────────────────────────────────────────────────────────*/
const Icon3D = ({ emoji, bg, shadow }) => (
    <div style={{
        width: 64, height: 64,
        background: bg,
        borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
        boxShadow: shadow || '0 8px 24px rgba(0,0,0,0.12)',
        transform: 'perspective(120px) rotateX(6deg)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        flexShrink: 0,
    }}
        className="icon-3d"
    >
        {emoji}
    </div>
);

/* ─────────────────────────────────────────────────────────────
   Toggle switch
───────────────────────────────────────────────────────────────*/
const Toggle = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(e => !e)}
        className={`w-11 h-6 rounded-full transition-all ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
        <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

/* ─────────────────────────────────────────────────────────────
   Service Card
───────────────────────────────────────────────────────────────*/
const ServiceCard = ({ title, icon3d, active, showTransact, actionLabel, actionColor, isLarge, onClick }) => (
    <div
        onClick={onClick}
        className="group relative bg-white border border-slate-100 rounded-3xl p-5 flex flex-col items-center gap-3 cursor-pointer
                   hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 select-none"
        style={{ minHeight: isLarge ? 180 : 150 }}
    >
        {/* 3D icon */}
        <div className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
            {icon3d}
        </div>

        {/* Title */}
        <p className="text-[11px] font-black text-slate-700 text-center uppercase tracking-wide leading-tight">
            {title}
        </p>

        {/* Badge */}
        {active && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300" />
        )}

        {/* Action buttons */}
        {showTransact && (
            <button className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-widest transition-all">
                Transact
            </button>
        )}
        {actionLabel && (
            <button className={`mt-auto w-full ${actionColor || 'bg-blue-600'} hover:opacity-90 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-widest transition-all`}>
                {actionLabel}
            </button>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────────────
   Section header
───────────────────────────────────────────────────────────────*/
const SectionHeader = ({ label, color }) => (
    <div className="flex items-center mb-6">
        <div className="w-1 h-6 rounded-full mr-3" style={{ background: color }} />
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{label}</h2>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   SERVICE DATA  (all icons are 3D emoji style – no imports needed)
═══════════════════════════════════════════════════════════════*/
const bankingServices = [
    {
        id: 'quick_mr', title: 'Quick MR Plus', showTransact: true, isLarge: true,
        icon3d: <Icon3D emoji="💸" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.25)" />
    },
    {
        id: 'pw_money_ekyc', title: 'PW Money eKYC', showTransact: true, isLarge: true,
        icon3d: <Icon3D emoji="🪪" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.25)" />
    },
    {
        id: 'aeps_services', title: 'AEPS Services', showTransact: true, isLarge: true,
        icon3d: <Icon3D emoji="🏧" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.25)" />
    },
    {
        id: 'matm', title: '2-in-1 mPOS (New)', actionLabel: 'Purchase', actionColor: 'bg-blue-600',
        icon3d: <Icon3D emoji="💳" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" />
    },
    {
        id: 'fino_suvidha', title: 'Fino Suvidha', actionLabel: 'Purchase', actionColor: 'bg-blue-600',
        icon3d: <Icon3D emoji="🏦" bg="linear-gradient(135deg,#ecfdf5,#d1fae5)" shadow="0 8px 24px rgba(16,185,129,0.2)" />
    },
    {
        id: 'smart_pos', title: 'Smart POS', actionLabel: 'Purchase', actionColor: 'bg-blue-600',
        icon3d: <Icon3D emoji="🖥️" bg="linear-gradient(135deg,#dbeafe,#e0f2fe)" shadow="0 8px 24px rgba(14,165,233,0.2)" />
    },
    {
        id: 'matm_cash', title: 'm-ATM Cash',
        icon3d: <Icon3D emoji="💰" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.2)" />
    },
    {
        id: 'matm_mp63', title: 'mATM – MP63',
        icon3d: <Icon3D emoji="📱" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.15)" />
    },
    {
        id: 'qpos_mini', title: '2-IN-1 QPOS Mini', actionLabel: 'Purchase', actionColor: 'bg-blue-600',
        icon3d: <Icon3D emoji="🔌" bg="linear-gradient(135deg,#ecfdf5,#d1fae5)" shadow="0 8px 24px rgba(16,185,129,0.2)" />
    },
    {
        id: 'ybl_mr', title: 'Indo Nepal MR', actionLabel: 'Purchase', actionColor: 'bg-blue-600',
        icon3d: <Icon3D emoji="🌏" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" />
    },
    {
        id: 'cms', title: 'CMS Banking',
        icon3d: <Icon3D emoji="🏛️" bg="linear-gradient(135deg,#fdf4ff,#f3e8ff)" shadow="0 8px 24px rgba(168,85,247,0.2)" />
    },
];

const travelServices = [
    {
        title: 'Hotel Booking',
        icon3d: <Icon3D emoji="🏨" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" />
    },
    {
        title: 'Rail E-Ticketing',
        icon3d: <Icon3D emoji="🚂" bg="linear-gradient(135deg,#fef3c7,#fde68a)" shadow="0 8px 24px rgba(245,158,11,0.2)" />
    },
    {
        title: 'Train',
        icon3d: <Icon3D emoji="🚆" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" />
    },
    {
        title: 'Bus Ticketing',
        icon3d: <Icon3D emoji="🚌" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" />
    },
    {
        title: 'Air Ticketing',
        icon3d: <Icon3D emoji="✈️" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.25)" />
    },
    {
        title: 'New Air Ticketing',
        icon3d: <Icon3D emoji="🛫" bg="linear-gradient(135deg,#f0f9ff,#e0f2fe)" shadow="0 8px 24px rgba(14,165,233,0.2)" />
    },
];

const bharatConnectServices = [
    { title: 'Bill Pay', icon3d: <Icon3D emoji="🧾" bg="linear-gradient(135deg,#fdf4ff,#ede9fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Loan Payments', icon3d: <Icon3D emoji="🏦" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Electricity Bill', icon3d: <Icon3D emoji="⚡" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.25)" /> },
    { title: 'Gas Cylinder', icon3d: <Icon3D emoji="🔥" bg="linear-gradient(135deg,#fee2e2,#fecaca)" shadow="0 8px 24px rgba(239,68,68,0.2)" /> },
    { title: 'Piped Gas Bill', icon3d: <Icon3D emoji="🌡️" bg="linear-gradient(135deg,#fff7ed,#fed7aa)" shadow="0 8px 24px rgba(249,115,22,0.2)" /> },
    { title: 'Water Bill', icon3d: <Icon3D emoji="💧" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.25)" /> },
    { title: 'FASTag Payments', icon3d: <Icon3D emoji="🚗" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'DTH', icon3d: <Icon3D emoji="📡" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Broadband', icon3d: <Icon3D emoji="🌐" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Landline Postpaid', icon3d: <Icon3D emoji="☎️" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Mobile Postpaid', icon3d: <Icon3D emoji="📲" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'LIC Premium', icon3d: <Icon3D emoji="🛡️" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.25)" /> },
    { title: 'Insurance', icon3d: <Icon3D emoji="🔒" bg="linear-gradient(135deg,#ecfdf5,#d1fae5)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Credit Card Bill', icon3d: <Icon3D emoji="💳" bg="linear-gradient(135deg,#fdf4ff,#f3e8ff)" shadow="0 8px 24px rgba(168,85,247,0.2)" /> },
    { title: 'Visa/Master CC Bill', icon3d: <Icon3D emoji="🏧" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Municipal Taxes', icon3d: <Icon3D emoji="🏛️" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Housing Societies', icon3d: <Icon3D emoji="🏘️" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Digital Cable TV', icon3d: <Icon3D emoji="📺" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Subscription', icon3d: <Icon3D emoji="🔔" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.2)" /> },
    { title: 'Hospital Bill', icon3d: <Icon3D emoji="🏥" bg="linear-gradient(135deg,#fee2e2,#fecaca)" shadow="0 8px 24px rgba(239,68,68,0.15)" /> },
    { title: 'Clubs & Associations', icon3d: <Icon3D emoji="🤝" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Education Bill', icon3d: <Icon3D emoji="🎓" bg="linear-gradient(135deg,#fdf4ff,#ede9fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
];

const utilityServices = [
    { title: 'Mobile Recharge', icon3d: <Icon3D emoji="📱" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'DTH Recharge', icon3d: <Icon3D emoji="📡" bg="linear-gradient(135deg,#ede9fe,#ddd6fe)" shadow="0 8px 24px rgba(124,58,237,0.2)" /> },
    { title: 'Collection', icon3d: <Icon3D emoji="🪙" bg="linear-gradient(135deg,#fef9c3,#fef08a)" shadow="0 8px 24px rgba(202,138,4,0.25)" /> },
    { title: 'Instant PAN Card', icon3d: <Icon3D emoji="🪪" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'Ayushpay Subscription', icon3d: <Icon3D emoji="🩺" bg="linear-gradient(135deg,#fee2e2,#fecaca)" shadow="0 8px 24px rgba(239,68,68,0.15)" /> },
    { title: 'Digital Wallet Top-up', icon3d: <Icon3D emoji="👛" bg="linear-gradient(135deg,#eff6ff,#dbeafe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
    { title: 'Vouchers', icon3d: <Icon3D emoji="🎟️" bg="linear-gradient(135deg,#fff7ed,#fed7aa)" shadow="0 8px 24px rgba(249,115,22,0.2)" /> },
    { title: 'HDFC BF', icon3d: <Icon3D emoji="🏦" bg="linear-gradient(135deg,#e0f2fe,#bae6fd)" shadow="0 8px 24px rgba(14,165,233,0.2)" /> },
    { title: 'Recharge OTT', icon3d: <Icon3D emoji="🎬" bg="linear-gradient(135deg,#fdf4ff,#f3e8ff)" shadow="0 8px 24px rgba(168,85,247,0.2)" /> },
    { title: 'Digi Gold', icon3d: <Icon3D emoji="🥇" bg="linear-gradient(135deg,#fef9c3,#fde68a)" shadow="0 8px 24px rgba(202,138,4,0.3)" /> },
    { title: 'PAN Card', icon3d: <Icon3D emoji="📋" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)" shadow="0 8px 24px rgba(16,185,129,0.2)" /> },
    { title: 'ITR Filing', icon3d: <Icon3D emoji="📑" bg="linear-gradient(135deg,#dbeafe,#bfdbfe)" shadow="0 8px 24px rgba(37,99,235,0.2)" /> },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════*/
const AllServices = () => {
    const navigate = useNavigate();
    const [activeOnly, setActiveOnly] = useState(false);

    const routeMap = {
        aeps_services: '/aeps',
        cms: '/cms',
        travel: '/travel',
        utility: '/utility',
        quick_mr: '/dmt',
        matm: '/matm',
        matm_cash: '/matm',
        matm_mp63: '/matm',
    };

    const go = (id) => navigate(routeMap[id] || '/dashboard');

    return (
        <>
            <style>{`
                .icon-3d:hover { transform: perspective(120px) rotateX(0deg) scale(1.1) !important; }
                .group:hover .icon-3d { transform: perspective(120px) rotateX(0deg) translateY(-4px) scale(1.1); }
            `}</style>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24 font-['Inter',sans-serif]">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[4px] mb-1">Service Marketplace</p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Hub</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">One-stop shop for all your business needs</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                            <p className="text-[8px] font-black text-indigo-400 uppercase">Active Services</p>
                            <p className="text-xl font-black text-indigo-700">62+</p>
                        </div>
                    </div>
                </div>

                {/* ── Banking ── */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <SectionHeader label="Banking Services" color="#4f46e5" />
                        <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Only Active</span>
                            <Toggle enabled={activeOnly} setEnabled={setActiveOnly} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {bankingServices.map((s, i) => (
                            <ServiceCard key={i}
                                title={s.title} icon3d={s.icon3d} active
                                showTransact={s.showTransact} actionLabel={s.actionLabel}
                                actionColor={s.actionColor} isLarge={s.isLarge}
                                onClick={() => s.id && go(s.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* ── Travel ── */}
                <section>
                    <SectionHeader label="Travel Services" color="#10b981" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {travelServices.map((s, i) => (
                            <ServiceCard key={i} title={s.title} icon3d={s.icon3d} active onClick={() => go('travel')} />
                        ))}
                    </div>
                </section>

                {/* ── Bharat Connect ── */}
                <section>
                    <SectionHeader label="Bharat Connect (BBPS)" color="#8b5cf6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {bharatConnectServices.map((s, i) => (
                            <ServiceCard key={i} title={s.title} icon3d={s.icon3d} active onClick={() => go('utility')} />
                        ))}
                    </div>
                </section>

                {/* ── Utility ── */}
                <section>
                    <SectionHeader label="Utility & Other Services" color="#f97316" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {utilityServices.map((s, i) => (
                            <ServiceCard key={i} title={s.title} icon3d={s.icon3d} active onClick={() => go('utility')} />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default AllServices;
