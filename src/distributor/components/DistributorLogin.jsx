import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, RefreshCcw, Smartphone, Mail, User,
    Building2, MapPin, ChevronDown, ArrowRight, ArrowLeft,
    CheckCircle2, Clock
} from 'lucide-react';
import { sharedDataService } from '../../services/sharedDataService';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi", "Chandigarh", "Jammu and Kashmir", "Ladakh",
    "Andaman and Nicobar Islands", "Lakshadweep", "Puducherry"
];

const DistributorLogin = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'success'

    // ── Login state ──
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    // ── Register state (no password needed) ──
    const [regForm, setRegForm] = useState({
        name: '', mobile: '', email: '',
        businessName: '', state: '', city: '', pincode: ''
    });
    const [regError, setRegError] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [newAccount, setNewAccount] = useState(null);

    const genCaptcha = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let r = '';
        for (let i = 0; i < 4; i++) {
            r += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i === 1) r += ' ';
        }
        setCaptcha(r);
    };
    useEffect(() => { genCaptcha(); }, []);

    const updateReg = (field, value) =>
        setRegForm(prev => ({ ...prev, [field]: value }));

    // ── Handle Login ──
    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        const match = sharedDataService.getDistributorByCredential(loginForm.username, loginForm.password);
        setTimeout(() => {
            if (match) {
                if (match.status !== 'Approved') {
                    setLoginError('Aapka account abhi admin approval ke liye pending hai.');
                    setLoginLoading(false);
                    return;
                }
                sharedDataService.setCurrentDistributor(match);
                // Redirect to plan selection if no plan chosen yet
                if (!match.plan) {
                    navigate('/distributor-plans');
                } else {
                    navigate('/distributor');
                }
            } else {
                setLoginError('Invalid credentials. Please check your ID / Mobile and Password.');
                setLoginLoading(false);
            }
        }, 600);
    };

    // ── Register (single step, no password) ──
    const handleRegister = (e) => {
        e.preventDefault();
        setRegError('');
        if (!/^[6-9]\d{9}$/.test(regForm.mobile)) {
            setRegError('Please enter a valid 10-digit mobile number.');
            return;
        }
        const all = sharedDataService.getAllDistributors();
        if (all.find(d => d.mobile === regForm.mobile)) {
            setRegError('This mobile number is already registered.');
            return;
        }
        if (!regForm.name || !regForm.email || !regForm.businessName || !regForm.state || !regForm.city || !regForm.pincode) {
            setRegError('Please fill in all required fields.');
            return;
        }
        setRegLoading(true);
        setTimeout(() => {
            // password left blank — admin will assign on approval
            const acc = sharedDataService.registerDistributor({ ...regForm, password: '' });
            setNewAccount(acc);
            setRegLoading(false);
            setMode('success');
        }, 800);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SUCCESS SCREEN
    // ─────────────────────────────────────────────────────────────────────────
    if (mode === 'success') {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
            >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center mx-auto"
                >
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </motion.div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Application Submitted!</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                        Application admin ke paas review ke liye bhej di gayi hai.<br />
                        Approval hone par aapki email par <span className="text-amber-600">login ID aur password</span> mil jayega.
                    </p>
                </div>

                {/* Status chip */}
                <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                    <Clock size={16} className="text-amber-500" />
                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Pending Admin Approval</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted Details</p>
                    <p className="text-xs font-bold text-slate-700">Application ID: <span className="text-amber-600 font-mono">{newAccount?.id}</span></p>
                    <p className="text-xs font-bold text-slate-700">Name: {newAccount?.name}</p>
                    <p className="text-xs font-bold text-slate-700">Mobile: {newAccount?.mobile}</p>
                    <p className="text-xs font-bold text-slate-700">Email: {newAccount?.email}</p>
                    <p className="text-xs font-bold text-slate-700">Business: {newAccount?.businessName}</p>
                </div>

                <button
                    onClick={() => { setMode('login'); setCaptchaInput(''); genCaptcha(); }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-3 rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <ArrowLeft size={14} /> Back to Login
                </button>
            </motion.div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER SCREEN  (single step — no password)
    // ─────────────────────────────────────────────────────────────────────────
    if (mode === 'register') {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">

                {/* Info note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5 text-base">💡</span>
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                        Password set karne ki zarurat nahi. Admin approval ke baad aapki email par login credentials automatically bheje jayenge.
                    </p>
                </div>

                {regError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-3 py-2 rounded-xl"
                    >
                        {regError}
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest -mb-1">Personal Information</p>

                    <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Full Name *" value={regForm.name}
                            onChange={e => updateReg('name', e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="relative">
                        <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" placeholder="Mobile Number * (10 digits)" value={regForm.mobile}
                            onChange={e => updateReg('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" placeholder="Email Address * (credentials yahan ayenge)" value={regForm.email}
                            onChange={e => updateReg('email', e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                        />
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1 -mb-1">Business Information</p>

                    <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Business / Firm Name *" value={regForm.businessName}
                            onChange={e => updateReg('businessName', e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={regForm.state} onChange={e => updateReg('state', e.target.value)} required
                            className={`w-full pl-10 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium appearance-none
                                ${!regForm.state ? 'text-slate-400' : 'text-slate-800'}`}
                        >
                            <option value="">Select State *</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="City *" value={regForm.city}
                            onChange={e => updateReg('city', e.target.value)} required
                            className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                        />
                        <input type="text" placeholder="Pincode *" value={regForm.pincode}
                            onChange={e => updateReg('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} required
                            className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                        />
                    </div>

                    <button type="submit" disabled={regLoading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                    >
                        {regLoading
                            ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Submitting...</>
                            : <><CheckCircle2 size={14} /> Submit Application</>
                        }
                    </button>

                    <button type="button" onClick={() => { setMode('login'); setRegError(''); }}
                        className="w-full text-center text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider"
                    >
                        ← Already have an account? Login
                    </button>
                </form>
            </motion.div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN SCREEN
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            {loginError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold px-4 py-3 rounded-xl"
                >
                    {loginError}
                </motion.div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-r border-slate-200 bg-slate-50 rounded-l-md">
                        <Smartphone size={18} />
                    </div>
                    <input type="text" placeholder="Distributor ID / Mobile"
                        value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} required
                        className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-300 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                    />
                </div>
                <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password (Admin dwara email kiya gaya)"
                        value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm font-medium"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-l border-slate-200 hover:text-amber-600 bg-slate-50 rounded-r-md"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
                        <span className="text-xl font-['Brush_Script_MT',cursive] italic tracking-widest text-slate-600 select-none flex-1 text-center line-through decoration-slate-400">
                            {captcha}
                        </span>
                        <button type="button" onClick={genCaptcha}
                            className="text-slate-400 hover:text-amber-600 transition-transform hover:rotate-180 duration-500"
                        >
                            <RefreshCcw size={16} />
                        </button>
                    </div>
                    <input type="text" placeholder="Enter captcha" value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)} required
                        className="w-full px-3 py-3.5 border border-slate-300 rounded-md focus:border-amber-500 outline-none text-sm font-medium"
                    />
                </div>
                <button type="submit" disabled={loginLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black py-3.5 rounded-full text-sm uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-60"
                >
                    {loginLoading
                        ? <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Signing in...</span>
                        : <><span>Login as Distributor</span><ArrowRight size={16} /></>
                    }
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>
                <button type="button" onClick={() => { setMode('register'); setRegError(''); }}
                    className="w-full border-2 border-amber-400 hover:bg-amber-50 text-amber-600 font-black py-3 rounded-full text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Building2 size={15} /> Apply as Distributor
                </button>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo: <span className="text-amber-600">dist001</span> / <span className="text-amber-600">dist123</span>
                </p>
            </form>
        </div>
    );
};

export default DistributorLogin;
