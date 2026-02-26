import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, RefreshCcw, ArrowRight, ShieldCheck,
    Lock, User, Mail, KeyRound, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import logo from '../assets/rupiksha_logo.png';

/* ── Config ────────────────────────────────── */
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const OTP_EMAIL = 'dubeyom1406@gmail.com';
const BACKEND_URL = '';

const TABS = ['Password', 'OTP Login'];
const OTP_LENGTH = 6;
const OTP_EXPIRY = 120; // seconds

/* ══════════════════════════════════════════════════════════════ */
const AdminLogin = () => {
    const navigate = useNavigate();

    const [tab, setTab] = useState(0);

    /* password tab */
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    /* otp tab */
    const [otpEmail, setOtpEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(0);
    const [otpError, setOtpError] = useState('');
    const [otpInfo, setOtpInfo] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const otpRefs = useRef([]);
    const timerRef = useRef(null);

    /* captcha */
    const genCaptcha = () => {
        const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let r = '';
        for (let i = 0; i < 4; i++) { r += c[Math.floor(Math.random() * c.length)]; if (i === 1) r += ' '; }
        setCaptcha(r);
    };
    useEffect(() => { genCaptcha(); }, []);

    /* countdown */
    useEffect(() => {
        clearInterval(timerRef.current);
        if (timer <= 0) return;
        timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
        return () => clearInterval(timerRef.current);
    }, [timer]);

    /* ── Password login ── */
    const handlePasswordLogin = (e) => {
        e.preventDefault(); setPwError('');
        const raw = captcha.replace(/\s/g, '');
        if (captchaInput.replace(/\s/g, '').toLowerCase() !== raw.toLowerCase()) {
            setPwError('Incorrect captcha. Please try again.'); genCaptcha(); setCaptchaInput(''); return;
        }
        setPwLoading(true);
        setTimeout(() => {
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                sessionStorage.setItem('admin_auth', 'true');
                navigate('/admin');
            } else {
                setPwError('Invalid credentials. Please check your username and password.');
                setPwLoading(false); genCaptcha(); setCaptchaInput('');
            }
        }, 700);
    };

    /* ── Send OTP (calls Java backend) ── */
    const handleSendOTP = async (e) => {
        e.preventDefault(); setOtpError(''); setOtpInfo('');
        if (otpEmail.trim().toLowerCase() !== OTP_EMAIL) {
            setOtpError('This email is not registered for OTP login.'); return;
        }
        setSendLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/send-admin-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail.trim().toLowerCase() }),
            });
            const data = await res.json();
            if (!res.ok) { setOtpError(data.error || 'Failed to send OTP.'); setSendLoading(false); return; }
            setOtpInfo(`OTP sent to ${OTP_EMAIL}. Check your inbox.`);
            setOtpSent(true);
            setOtpValues(Array(OTP_LENGTH).fill(''));
            setTimer(OTP_EXPIRY);
            setTimeout(() => otpRefs.current[0]?.focus(), 120);
        } catch (err) {
            setOtpError('Cannot reach server. Make sure the backend is running on port 5001.');
        }
        setSendLoading(false);
    };

    /* ── OTP box handlers ── */
    const handleOtpKey = (val, idx) => {
        if (!/^\d?$/.test(val)) return;
        const nxt = [...otpValues]; nxt[idx] = val; setOtpValues(nxt);
        if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    };
    const handleOtpBack = (e, idx) => {
        if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
    };

    /* ── Verify OTP (calls Java backend) ── */
    const handleVerifyOTP = async (e) => {
        e.preventDefault(); setOtpError('');
        if (timer <= 0) { setOtpError('OTP expired. Please resend.'); return; }
        const entered = otpValues.join('');
        if (entered.length < OTP_LENGTH) { setOtpError('Please enter the complete 6-digit OTP.'); return; }
        setVerifyLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/verify-admin-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: OTP_EMAIL, otp: entered }),
            });
            const data = await res.json();
            if (!res.ok) { setOtpError(data.error || 'Verification failed.'); setVerifyLoading(false); return; }
            sessionStorage.setItem('admin_auth', 'true');
            navigate('/admin');
        } catch (err) {
            setOtpError('Cannot reach server. Make sure the backend is running on port 5001.');
            setVerifyLoading(false);
        }
    };

    const resendOTP = () => { setOtpSent(false); setOtpError(''); setOtpInfo(''); setOtpValues(Array(OTP_LENGTH).fill('')); setTimer(0); };
    const timerFmt = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    /* ════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-['Montserrat',sans-serif] relative overflow-hidden py-16 px-4"
            style={{ background: '#020617' }}>
            {/* BG Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full max-w-[440px] flex flex-col items-center z-10">

                {/* Brand */}
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="flex flex-col items-center mb-10 text-center">
                    <img src={logo} alt="Rupiksha" className="h-28 md:h-36 object-contain brightness-0 invert mb-6" />
                    <h1 className="text-white text-xl md:text-2xl font-black uppercase tracking-[0.15em]">
                        ADMIN <span className="text-blue-500">PORTAL</span>
                    </h1>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] mt-3">Making Life Simple &amp; Digital</p>
                </motion.div>

                {/* Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl">

                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                            <ShieldCheck size={20} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Restricted Access</p>
                            <h2 className="text-white font-black text-sm uppercase tracking-tight">Administrator Login</h2>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
                        {TABS.map((t, i) => (
                            <button key={t} onClick={() => { setTab(i); setPwError(''); setOtpError(''); setOtpInfo(''); }}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === i ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/50'}`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ═══ PASSWORD TAB ═══ */}
                        {tab === 0 && (
                            <motion.div key="pw" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                <AnimatePresence>
                                    {pwError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold px-4 py-3 rounded-2xl mb-4 flex items-center gap-2">
                                            <AlertCircle size={13} />{pwError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <form onSubmit={handlePasswordLogin} className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><User size={16} /></div>
                                        <input type="text" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} required
                                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/25 focus:border-blue-500/50 focus:bg-white/10 outline-none text-sm font-medium transition-all" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Lock size={16} /></div>
                                        <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/25 focus:border-blue-500/50 focus:bg-white/10 outline-none text-sm font-medium transition-all" />
                                        <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center justify-between bg-white/5 border border-white/10 px-3 py-2.5 rounded-2xl">
                                            <span className="text-lg tracking-widest text-white/50 select-none flex-1 text-center line-through decoration-white/30 font-mono italic">{captcha}</span>
                                            <button type="button" onClick={genCaptcha} className="text-white/30 hover:text-amber-400 hover:rotate-180 transition-all duration-500 ml-2"><RefreshCcw size={14} /></button>
                                        </div>
                                        <input type="text" placeholder="Enter captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required
                                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/25 focus:border-blue-500/50 outline-none text-sm font-medium transition-all" />
                                    </div>
                                    <motion.button type="submit" disabled={pwLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        className="w-full mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                        {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Authenticating...</> : <><ShieldCheck size={15} /> Login as Admin <ArrowRight size={14} /></>}
                                    </motion.button>
                                    <p className="text-center text-[9px] font-bold text-white/15 uppercase tracking-widest pt-1">admin / admin123</p>
                                </form>
                            </motion.div>
                        )}

                        {/* ═══ OTP TAB ═══ */}
                        {tab === 1 && (
                            <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                                <AnimatePresence>
                                    {otpError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
                                            <AlertCircle size={13} />{otpError}
                                        </motion.div>
                                    )}
                                    {otpInfo && !otpError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
                                            <CheckCircle2 size={13} />{otpInfo}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!otpSent ? (
                                    /* Step 1 — Enter email */
                                    <form onSubmit={handleSendOTP} className="space-y-4">
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enter registered admin email</p>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Mail size={16} /></div>
                                            <input type="email" placeholder="Admin Email Address" value={otpEmail} onChange={e => setOtpEmail(e.target.value)} required
                                                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/25 focus:border-blue-500/50 focus:bg-white/10 outline-none text-sm font-medium transition-all" />
                                        </div>
                                        <motion.button type="submit" disabled={sendLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                            {sendLoading ? <><Loader2 size={14} className="animate-spin" /> Sending OTP...</> : <><Mail size={14} /> Send OTP to Email <ArrowRight size={14} /></>}
                                        </motion.button>
                                    </form>
                                ) : (
                                    /* Step 2 — Enter OTP */
                                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enter 6-digit OTP</p>
                                                <span className={`text-[11px] font-black tabular-nums ${timer > 30 ? 'text-emerald-400' : 'text-red-400'}`}>⏱ {timerFmt}</span>
                                            </div>
                                            {/* OTP boxes */}
                                            <div className="flex gap-2 justify-center">
                                                {Array(OTP_LENGTH).fill(0).map((_, i) => (
                                                    <input key={i} ref={el => otpRefs.current[i] = el}
                                                        type="text" inputMode="numeric" maxLength={1} value={otpValues[i]}
                                                        onChange={e => handleOtpKey(e.target.value, i)}
                                                        onKeyDown={e => handleOtpBack(e, i)}
                                                        className={`w-11 h-12 text-center text-white font-black text-lg bg-white/5 border rounded-xl outline-none transition-all
                                                            ${otpValues[i] ? 'border-blue-500/60 bg-blue-500/10' : 'border-white/10 focus:border-blue-500/50 focus:bg-white/10'}`} />
                                                ))}
                                            </div>
                                            <p className="text-white/20 text-[9px] font-bold text-center mt-3 uppercase tracking-widest">Sent to {OTP_EMAIL}</p>
                                        </div>

                                        <motion.button type="submit" disabled={verifyLoading || timer === 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                                            {verifyLoading ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : <><KeyRound size={14} /> Verify &amp; Login <ArrowRight size={14} /></>}
                                        </motion.button>

                                        <button type="button" onClick={resendOTP}
                                            className={`w-full text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-colors ${timer === 0 ? 'text-amber-400 hover:text-amber-300' : 'text-white/20 hover:text-white/40'}`}>
                                            <RefreshCcw size={12} /> {timer === 0 ? 'OTP Expired — Resend' : 'Resend OTP'}
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Back */}
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    onClick={() => navigate('/login')}
                    className="mt-6 text-white/20 hover:text-white/50 text-[9px] font-black uppercase tracking-widest transition-colors">
                    ← Back to Portal Selector
                </motion.button>

                <div className="mt-10 opacity-20">
                    <p className="text-white text-[9px] font-black uppercase tracking-[0.8em] text-center">© 2026 RuPiKsha Digital Services Pvt. Ltd.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
