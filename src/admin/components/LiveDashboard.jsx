import React, { useState, useEffect } from 'react';

// ─── Simulated Live Data Generator ───────────────────────────────────────────
const randomDelta = (base, pct = 0.02) =>
    Math.round(base * (1 + (Math.random() - 0.5) * pct));

const initialData = {
    charges: 2878,
    commission: 7838.7,
    wallet: 241232.745,
    users: { total: 144, active: 144, inactive: 0 },
    kyc: { done: 149, notDone: 5, pending: 1 },
    aeps: { kycDone: 124, kycNotDone: 20, kycPending: 20 },
    walletStats: { total: 241232.745, fundRequest: 110, locked: 0 },
    aepsOps: { todayTxn: 71, todayAmt: 211000, monthlyTxn: 1915, monthlyAmt: 4642850, todayComm: 154.7, monthlyComm: 2544.45 },
    payout: { todayTxn: 7, todayAmt: 42940, monthlyTxn: 328, monthlyAmt: 4247621, todayComm: 56, monthlyComm: 2878 },
    cms: { todayTxn: 0, todayAmt: 0, monthlyTxn: 7, monthlyAmt: 156820, todayComm: 0, monthlyComm: 0 },
    dmt: { todayTxn: 0, todayAmt: 0, monthlyTxn: 1915, monthlyAmt: 4642850, todayComm: 0, monthlyComm: 0 },
    bharatConnect: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 353, todayComm: 0, monthlyComm: 0 },
    otherService: { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 },
};

function liveUpdate(data) {
    return {
        ...data,
        charges: randomDelta(data.charges),
        commission: parseFloat((data.commission * (1 + (Math.random() - 0.5) * 0.01)).toFixed(1)),
        wallet: parseFloat((data.wallet * (1 + (Math.random() - 0.5) * 0.005)).toFixed(3)),
        aepsOps: {
            ...data.aepsOps,
            todayTxn: randomDelta(data.aepsOps.todayTxn, 0.05),
            todayAmt: randomDelta(data.aepsOps.todayAmt, 0.02),
        },
        payout: {
            ...data.payout,
            todayTxn: randomDelta(data.payout.todayTxn, 0.1),
            todayAmt: randomDelta(data.payout.todayAmt, 0.02),
        },
    };
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString("en-IN");
const fmtD = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 });

// ─── Components ───────────────────────────────────────────────────────────────
function LiveDot() {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4ade80", fontWeight: 600, letterSpacing: 1 }}>
            <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#4ade80",
                boxShadow: "0 0 6px #4ade80",
                animation: "pulse 1.4s ease-in-out infinite"
            }} />
            LIVE
        </span>
    );
}

function StatRow({ label, value, accent }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: accent || "#334155", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        </div>
    );
}

function Card({ title, icon, badge, priority, children, accent = "#6366f1" }) {
    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid rgba(255, 255, 255, 0.5)`,
            borderRadius: 14,
            padding: "18px 20px",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 32px rgba(31, 38, 135, 0.07)`,
            transition: "all 0.3s",
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 40px rgba(31, 38, 135, 0.12)`; e.currentTarget.style.transform = "translateY(-2px)" }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(31, 38, 135, 0.07)`; e.currentTarget.style.transform = "translateY(0)" }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, background: `${accent}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, border: `1px solid ${accent}33`
                    }}>{icon}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", letterSpacing: 0.3 }}>{title}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {priority && (
                        <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                            background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", letterSpacing: 0.5
                        }}>⚡ HIGH PRIORITY</span>
                    )}
                    {badge && (
                        <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                            background: `${accent}15`, color: accent, border: `1px solid ${accent}33`
                        }}>{badge}</span>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function TxnGrid({ todayTxn, todayAmt, monthlyTxn, monthlyAmt, todayComm, monthlyComm, accent }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: 4, textAlign: "center" }}>
            {[
                ["Today Txn", todayTxn], ["Today Amt", fmt(todayAmt)],
                ["Monthly Txn", fmt(monthlyTxn)], ["Monthly Amt", fmt(monthlyAmt)],
                ["Today Comm", fmtD(todayComm)], ["Monthly Comm", fmtD(monthlyComm)]
            ].map(([label, val]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 4px", border: "1px solid rgba(0,0,0,0.03)", boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: accent || "#334155", fontVariantNumeric: "tabular-nums" }}>{val}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const LiveDashboard = ({ data: initialRealData, distributors, superadmins }) => {
    const [data, setData] = useState(initialData);
    const [tick, setTick] = useState(0);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // If real data is available, we could sync it, but the user wants the "live simulation" look 
        // consistently as provided in their code block.
        const interval = setInterval(() => {
            setData(prev => liveUpdate(prev));
            setTick(t => t + 1);
            setTime(new Date());
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    // Use Real Data for overarching stats
    const retailers = initialRealData?.users || [];
    const dists = distributors || [];
    const sas = superadmins || [];
    const allUsers = [...retailers, ...dists, ...sas];

    const realActiveUsers = allUsers.filter(u => u?.status === 'Approved').length;
    const realPendingUsers = allUsers.filter(u => u?.status === 'Pending').length;

    const realTotalWallet = allUsers.reduce((sum, u) => {
        const bal = parseFloat((u?.wallet?.balance || '0').toString().replace(/,/g, ''));
        return sum + (isNaN(bal) ? 0 : bal);
    }, 0);

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f0fdf4 0%, #fefce8 50%, #ffffff 100%)",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            color: "#334155",
            padding: "28px"
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

            {/* ── Main Content Area ── */}
            <div>
                {/* ── Topbar ── */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: 24,
                    position: "sticky", top: 0,
                    background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                    zIndex: 50, borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Rupiksha Admin</span>
                        <span style={{ color: "#cbd5e1" }}>/</span>
                        <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 800 }}>Live View</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <LiveDot />
                        <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>{timeStr} · {dateStr}</span>

                        {[
                            { label: "Charges", value: fmt(data.charges), color: "#ea580c" },
                            { label: "Commission", value: fmtD(data.commission), color: "#059669" },
                            { label: "Wallet Float", value: fmtD(data.wallet), color: "#4f46e5" },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{
                                background: `${color}10`, border: `1px solid ${color}30`,
                                borderRadius: 8, padding: "5px 12px", display: "flex", gap: 6, alignItems: "center"
                            }}>
                                <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{label}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                            </div>
                        ))}

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>ADMIN</div>
                                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>Super System</div>
                            </div>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 4px 10px rgba(16,185,129,0.3)"
                            }}>👤</div>
                        </div>
                    </div>
                </div>

                {/* ── Row 1: KPI Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16, animation: "fadeIn 0.5s ease" }}>

                    <Card title="User Details" icon="👥" accent="#0ea5e9">
                        <StatRow label="Total Users" value={allUsers.length || data.users.total} accent="#0ea5e9" />
                        <StatRow label="Active Users" value={realActiveUsers || data.users.active} accent="#10b981" />
                        <StatRow label="Pending Users" value={realPendingUsers || data.users.inactive} accent="#ef4444" />
                    </Card>

                    <Card title="Profile KYC" icon="🪪" accent="#8b5cf6">
                        <StatRow label="KYC Done" value={realActiveUsers || data.kyc.done} accent="#10b981" />
                        <StatRow label="KYC Not Done" value={data.kyc.notDone} accent="#ef4444" />
                        <StatRow label="KYC Pending" value={realPendingUsers || data.kyc.pending} accent="#f59e0b" />
                    </Card>

                    <Card title="AEPS KYC" icon="🛡️" accent="#10b981">
                        <StatRow label="Aeps KYC Done" value={data.aeps.kycDone} accent="#10b981" />
                        <StatRow label="Aeps KYC Not Done" value={data.aeps.kycNotDone} accent="#ef4444" />
                        <StatRow label="Aeps KYC Pending" value={data.aeps.kycPending} accent="#f59e0b" />
                    </Card>

                    <Card title="Wallet" icon="💰" accent="#f59e0b">
                        <StatRow label="Total User Wallet" value={fmtD(realTotalWallet || data.walletStats.total)} accent="#f59e0b" />
                        <StatRow label="Fund Request" value={data.walletStats.fundRequest} accent="#0ea5e9" />
                        <StatRow label="Locked Amount" value={data.walletStats.locked} accent="#64748b" />
                    </Card>
                </div>

                {/* ── Row 2: AEPS + Payout ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card title="AEPS" icon="🏦" priority accent="#4f46e5">
                        <TxnGrid {...data.aepsOps} accent="#4f46e5" />
                    </Card>

                    <Card title="Payout" icon="💸" accent="#059669">
                        <TxnGrid {...data.payout} accent="#059669" />
                    </Card>
                </div>

                {/* ── Row 3: CMS + DMT ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card title="CMS" icon="⚡" accent="#d97706">
                        <TxnGrid {...data.cms} accent="#d97706" />
                    </Card>

                    <Card title="DMT" icon="📲" priority accent="#dc2626">
                        <TxnGrid {...data.dmt} accent="#dc2626" />
                    </Card>
                </div>

                {/* ── Row 4: Bharat Connect + Other Service ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card title="Bharat Connect" icon="🔗" accent="#0284c7">
                        <TxnGrid {...data.bharatConnect} accent="#0284c7" />
                    </Card>

                    <Card title="Other Service" icon="🛠️" badge="Utility Service" accent="#7c3aed">
                        <TxnGrid {...data.otherService} accent="#7c3aed" />
                    </Card>
                </div>

                {/* ── Activity Feed ── */}
                <Card title="Live Activity Feed" icon="📡" accent="#4f46e5">
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                        {[
                            { event: "AEPS Transaction", user: "User #1042", amt: "₹5,000", status: "✅ Success", color: "#16a34a" },
                            { event: "Payout Initiated", user: "User #0887", amt: "₹12,400", status: "⏳ Pending", color: "#d97706" },
                            { event: "KYC Approved", user: "User #1143", amt: "—", status: "✅ Done", color: "#16a34a" },
                            { event: "Fund Request", user: "User #0553", amt: "₹50,000", status: "🔄 Processing", color: "#0284c7" },
                            { event: "DMT Transfer", user: "User #1098", amt: "₹8,200", status: "✅ Success", color: "#16a34a" },
                        ].map((item, i) => (
                            <div key={i} style={{
                                minWidth: 180, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.05)",
                                borderRadius: 10, padding: "12px 14px", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>{item.event}</div>
                                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{item.user}</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 6, fontFamily: "'JetBrains Mono'" }}>{item.amt}</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: item.color }}>{item.status}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: 28, color: "#334155", fontSize: 12 }}>
                    Rupiksha Admin Dashboard · Auto-refreshing every 2.5s · Tick #{tick}
                </div>
            </div>
        </div>
    );
};

export default LiveDashboard;
