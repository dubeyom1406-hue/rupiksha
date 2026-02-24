import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Eye, EyeOff, RefreshCcw,
    Facebook, Twitter, Linkedin, Youtube, Send,
    MessageSquare, Phone, Mail, Instagram, Globe,
    ChevronDown, ChevronRight, ChevronLeft, QrCode,
    Calendar, Smartphone, Check, HelpCircle,
    Building2, Users, ArrowRight, Shield
} from 'lucide-react';
import logo from './assets/rupiksha_logo.png';
import { dataService, BACKEND_URL } from './services/dataService';
import DistributorLogin from './distributor/components/DistributorLogin';
import SuperAdminLogin from './superadmin/components/SuperAdminLogin';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const TRANSLATIONS = {
    en: {
        income_calc: "₹ INCOME CALCULATOR",
        welcome: "WELCOME TO RUPIKSHA",
        login_btn: "Login",
        register_btn: "Register",
        submit_btn: "Submit",
        forgot_password: "Forgot Password?",
        username_placeholder: "Mobile Number",
        password_placeholder: "Password",
        captcha_placeholder: "Enter captcha",
        remember_me: "Remember me",
        new_user: "New User?",
        create_account_link: "Create a free account.",
        already_registered: "Already registered?",
        log_in_link: "Log in.",
        create_account_title: "Create a free account",
        register_p: "Get yourself a free account and start transacting today",
        mobile_label: "Mobile Number",
        name_label: "Full Name",
        email_label: "Email",
        state_label: "Please select your state",
        lang_label: "Please select your preferred language",
        dob_label: "Date of Birth",
        dob_note: "Note: Enter the Date of Birth as per RUPIKSHA record. Format should be DD/MM/YYYY",
        get_app: "GET RUPIKSHA APP",
        rights: "© RuPiKsha Digital Services Private Limited | All rights reserved.",
        chat_with_us: "CHAT WITH US NOW!",
        english: "English",
        hindi: "Hindi",
        select_lang: "SELECT LANGUAGE",
        back_to_login: "Back to login?",
        agreement: "I agree to receive communication over whatsapp, RCS service, mobile & email.",
        success_reg: "Registration Successful! Logging in...",
        success_login: "Login Successful!",
        otp_title: "Verify Mobile OTP",
        otp_placeholder: "Enter 6-digit OTP",
        otp_sent: "OTP sent to your registered mobile number",
        verify_otp_btn: "Verify & Login",
        resend_otp: "Resend Mobile OTP",
        invalid_otp: "Invalid OTP. Please try again.",
        cred_error: "Invalid credentials.",
        login_by_password: "Password Login",
        login_by_otp: "OTP Login",
        user_not_found: "User not found. Please register.",
        mobile_placeholder: "Enter Mobile Number"
    },
    hi: {
        income_calc: "₹ आय कैलकुलेटर",
        welcome: "रुपिक्षा में आपका स्वागत है",
        login_btn: "लॉगिन",
        register_btn: "रजिस्टर",
        submit_btn: "सबमिट",
        forgot_password: "पासवर्ड भूल गए?",
        username_placeholder: "मोबाइल नंबर",
        password_placeholder: "पासवर्ड",
        captcha_placeholder: "कैप्चा दर्ज करें",
        remember_me: "मुझे याद रखें",
        new_user: "नए उपयोगकर्ता?",
        create_account_link: "नि: शुल्क खाता बनाएं।",
        already_registered: "पहले से पंजीकृत हैं?",
        log_in_link: "लॉगिन करें।",
        create_account_title: "एक नि: शुल्क खाता बनाएं",
        register_p: "आज ही अपना मुफ़्त खाता प्राप्त करें और लेनदेन शुरू करें",
        mobile_label: "मोबाइल नंबर",
        name_label: "पूरा नाम",
        email_label: "ईमेल",
        state_label: "कृपया अपना राज्य चुनें",
        lang_label: "कृपया अपनी पसंदीदा भाषा चुनें",
        dob_label: "जन्म तिथि",
        dob_note: "नोट: रुपिक्षा रिकॉर्ड के अनुसार जन्म तिथि दर्ज करें। प्रारूप DD/MM/YYYY होना चाहिए",
        get_app: "रुपिक्षा ऐप प्राप्त करें",
        rights: "© रुपिक्षा डिजिटल सर्विसेज प्राइवेट लिमिटेड | सर्वाधिकार सुरक्षित।",
        chat_with_us: "अभी हमसे चैट करें!",
        english: "English",
        hindi: "हिंदी",
        select_lang: "भाषा चुनें",
        back_to_login: "लॉगिन पर वापस जाएं?",
        agreement: "मैं व्हाट्सएप, RCS सेवा, मोबाइल और ईमेल पर संचार प्राप्त करने के लिए सहमत हूं।",
        success_reg: "पंजीकरण सफल! लॉगिन किया जा रहा है...",
        success_login: "लॉगिन सफल!",
        otp_title: "मोबाइल ओटीपी सत्यापित करें",
        otp_placeholder: "6-अंकीय ओटीपी दर्ज करें",
        otp_sent: "ओटीपी आपके पंजीकृत मोबाइल नंबर पर भेज दिया गया है",
        verify_otp_btn: "सत्यापित करें और लॉगिन करें",
        resend_otp: "मोबाइल ओटीपी पुन: भेजें",
        invalid_otp: "अमान्य ओटीपी। कृपया पुन: प्रयास करें।",
        cred_error: "अमान्य क्रेडेंशियल।",
        login_by_password: "पासवर्ड लॉगिन",
        login_by_otp: "ओटीपी लॉगिन",
        user_not_found: "उपयोगकर्ता नहीं मिला। कृपया पंजीकरण करें।",
        mobile_placeholder: "मोबाइल नंबर दर्ज करें"
    }
};

import { useLanguage } from './context/LanguageContext';

// ... (existing imports)

const Login = () => {
    const navigate = useNavigate();
    const { language: lang, setLanguage: setLang, t: translate } = useLanguage();
    // Helper to map global translations to local legacy TRANSLATIONS object if needed, 
    // OR just use local t function that uses global lang.
    // However, existing code uses `t(key)` helper that looks up `TRANSLATIONS[lang][key]`.
    // Let's keep `TRANSLATIONS` object in Login.jsx for now but control `lang` via context.

    // Legacy t function for Login page specific strings (keeping local dictionary for now as it has many keys)
    const t = (key) => {
        if (!TRANSLATIONS[lang]) return key;
        return TRANSLATIONS[lang][key] || key;
    };

    // portal: 'select' → show portal chooser, 'retailer' → retailer login, 'distributor' → distributor login
    const [portal, setPortal] = useState('select');
    const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
    // const [lang, setLang] = useState('en'); // Removed local state
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginStep, setLoginStep] = useState('credentials'); // 'credentials', 'otp'
    const [loginMethod, setLoginMethod] = useState('password'); // 'password', 'otp'
    const [enteredOtp, setEnteredOtp] = useState('');
    const [tempUser, setTempUser] = useState(null);
    const [captcha, setCaptcha] = useState('rx h');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Form States
    const [loginForm, setLoginForm] = useState({ username: '', password: '', captcha: '' });
    // Initialize registerForm lang with global lang
    const [registerForm, setRegisterForm] = useState({ name: '', mobile: '', email: '', state: '', lang: lang === 'en' ? 'English' : 'Hindi', captcha: '', agreement: false });
    const [forgotForm, setForgotForm] = useState({ mobile: '', dob: '' });

    // Update register form when global lang changes
    useEffect(() => {
        setRegisterForm(prev => ({ ...prev, lang: lang === 'en' ? 'English' : 'Hindi' }));
    }, [lang]);

    const slides = [
        {
            title: "Never-Before Offer",
            subtitle: "100% FREE IRCTC Rail Agent ID",
            desc: "Valid for 1 Full Year | OTP-Based Activation | Instant Activation",
            action: "ACTIVATE TODAY – LIMITED TIME OFFER",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000"
        },
        {
            title: "Expand Your Business",
            subtitle: "Multiple Services, One Platform",
            desc: "Banking, Utility & Travel Services at your fingertips",
            action: "JOIN THE NETWORK",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (view === 'login') {
            if (loginStep === 'credentials') {
                let userRes;
                if (loginMethod === 'password') {
                    userRes = dataService.checkCredentials(loginForm.username, loginForm.password);
                } else {
                    const user = dataService.getUserByUsername(loginForm.username);
                    userRes = user ? { success: true, user } : { success: false, message: t('user_not_found') };
                }

                if (userRes.success) {
                    const user = userRes.user;
                    setTempUser(user);

                    if (loginMethod === 'password') {
                        // Directly log in for password (or you could also add OTP here if requested)
                        dataService.loginUser(loginForm.username, loginForm.password);
                        setTimeout(() => {
                            navigate('/dashboard');
                            setIsLoading(false);
                        }, 500);
                    } else {
                        // OTP Login Method -> Send OTP via Backend
                        try {
                            const mobile = user.mobile || loginForm.username;
                            const backendRes = await fetch(`${BACKEND_URL}/send-mobile-otp`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ mobile: mobile })
                            });

                            if (backendRes.ok) {
                                setLoginStep('otp');
                                setIsLoading(false);
                            } else {
                                const errorText = await backendRes.text();
                                let errorMsg = "Failed to send OTP.";
                                try {
                                    const errorJson = JSON.parse(errorText);
                                    errorMsg = errorJson.error || errorJson.message || errorMsg;
                                } catch (e) {
                                    errorMsg = errorText || errorMsg;
                                }
                                alert(errorMsg);
                                setIsLoading(false);
                            }
                        } catch (err) {
                            console.error("OTP Send Error:", err);
                            alert(`Connection error: ${err.message}. Please ensure the Java backend is running on port 5001.`);
                            setIsLoading(false);
                        }
                    }
                } else {
                    alert(userRes.message || t('cred_error'));
                    setIsLoading(false);
                }
            } else if (loginStep === 'otp') {
                // Verify Mobile OTP via Backend
                try {
                    const response = await fetch(`${BACKEND_URL}/verify-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ identity: tempUser.mobile || tempUser.username, otp: enteredOtp })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Finalize login
                        if (loginMethod === 'password') {
                            dataService.loginUser(loginForm.username, loginForm.password);
                        } else {
                            const allData = dataService.getData();
                            allData.currentUser = tempUser;
                            dataService.saveData(allData);
                            dataService.logLogin(tempUser.username, 'Success (OTP-Login)');
                        }

                        setTimeout(() => {
                            navigate('/dashboard');
                            setIsLoading(false);
                        }, 500);
                    } else {
                        const errorText = await response.text();
                        let errorMsg = "Verification failed.";
                        try {
                            const errorJson = JSON.parse(errorText);
                            errorMsg = errorJson.error || errorJson.message || errorMsg;
                        } catch (e) {
                            errorMsg = errorText || errorMsg;
                        }
                        alert(errorMsg);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error("OTP Verify Error:", error);
                    alert(`Connection error: ${error.message}. Please ensure the Java backend is running on port 5001.`);
                    setIsLoading(false);
                }
            }
        } else if (view === 'register') {
            dataService.registerUser(registerForm);
            setTimeout(() => {
                setView('login');
                setIsLoading(false);
                alert(`Registration Successful! Your account for ${registerForm.mobile} is now pending admin approval. You will be able to login once an administrator approves your request and assigns your credentials.`);
            }, 1000);
        } else {
            setTimeout(() => {
                setView('login');
                setIsLoading(false);
            }, 1000);
        }
    };

    const refreshCaptcha = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i === 1) result += ' ';
        }
        setCaptcha(result);
    };

    // ── Portal Selection Screen ────────────────────────────────────────────
    if (portal === 'select') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-['Montserrat',sans-serif] relative overflow-hidden py-16 px-4">
                {/* BG Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-[1240px] flex flex-col items-center z-10"
                >
                    {/* Brand Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center mb-10 md:mb-14 text-center"
                    >
                        <div className="relative mb-10">
                            <img src={logo} alt="Rupiksha" className="h-32 md:h-52 object-contain brightness-0 invert" />
                        </div>
                        <h1 className="text-white text-xl md:text-2xl font-black uppercase tracking-[0.15em] leading-tight">
                            SELECT YOUR <span className="text-blue-500">PORTAL</span>
                        </h1>
                        <p className="text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mt-3">Making Life Simple & Digital</p>
                    </motion.div>

                    {/* Portal Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-[1100px]">
                        {/* Retailer Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group relative h-[420px] bg-gradient-to-b from-blue-600 to-blue-900 rounded-[3rem] p-8 flex flex-col text-left overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                    <Users size={32} className="text-white" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] opacity-60">Panel A</span>
                                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        RETAILER
                                    </h3>
                                </div>

                                <div className="mt-auto">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPortal('retailer')}
                                        className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 transition-all"
                                    >
                                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">LOGIN NOW</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Distributor Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group relative h-[420px] bg-gradient-to-b from-amber-500 to-orange-700 rounded-[3rem] p-8 flex flex-col text-left overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                    <Building2 size={32} className="text-white" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-amber-200 uppercase tracking-[0.2em] opacity-60">Panel B</span>
                                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        DISTRIBUTOR
                                    </h3>
                                </div>

                                <div className="mt-auto">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPortal('distributor')}
                                        className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 transition-all"
                                    >
                                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">LOGIN NOW</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* SuperAdmin Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group relative h-[420px] bg-gradient-to-b from-indigo-700 to-purple-900 rounded-[3rem] p-8 flex flex-col text-left overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                                    <Shield size={32} className="text-white" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] opacity-60">Control Center</span>
                                    <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        SUPER DISTRIBUTOR
                                    </h3>
                                </div>

                                <div className="mt-auto">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPortal('superadmin')}
                                        className="inline-flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 transition-all"
                                    >
                                        <span className="group-hover:tracking-[0.3em] transition-all duration-300">SUPER DISTRIBUTOR LOGIN</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="mt-24 md:mt-32 text-center opacity-30">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.8em]">
                            © 2026 RuPiKsha Digital Services Pvt. Ltd.
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Distributor Login Screen ─────────────────────────────────────────────
    if (portal === 'distributor') {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Montserrat',sans-serif]">
                <header className="bg-white px-4 md:px-8 py-2 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => setPortal('select')}>
                        <img src={logo} alt="RUPIKSHA" className="h-10 md:h-12 object-contain" />
                        <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-tighter self-start">Making Life Simple</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">Distributor Portal — B Panel</span>
                        <button
                            onClick={() => setPortal('select')}
                            className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Change Portal
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                    {/* Left: Distributor Login */}
                    <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-white overflow-y-auto">
                        <div className="w-full max-w-[440px] space-y-6">
                            <h2 className="text-amber-500 text-2xl md:text-3xl font-black text-center tracking-tighter uppercase">
                                DISTRIBUTOR LOGIN
                            </h2>
                            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2.5 font-bold uppercase tracking-widest text-sm">
                                    B Panel — Distributor Access
                                </div>
                                <div className="p-8">
                                    <DistributorLogin />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Distributor promo banner */}
                    <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#162543] to-[#0d1b35] relative overflow-hidden items-center justify-center p-8 lg:p-14">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
                                <Building2 size={40} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">Distributor B Panel</span>
                                <h3 className="text-3xl font-black tracking-tight">Manage Your<br />Retailer Network</h3>
                                <p className="text-white/60 text-sm font-bold">Track retailer performance, manage transactions, and grow your distribution business.</p>
                            </div>
                            {[
                                '142+ Active Retailers',
                                'Real-time Transaction Reports',
                                'Commission Tracking',
                                'Ledger Management',
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
                                        <Check size={11} className="text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-white/80">{f}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </main>
            </div>
        );
    }

    // ── SuperAdmin Login Screen ─────────────────────────────────────────────
    if (portal === 'superadmin') {
        return (
            <div className="min-h-screen bg-[#f0f4ff] flex flex-col font-['Montserrat',sans-serif]">
                <header className="bg-white px-4 md:px-8 py-2 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => setPortal('select')}>
                        <img src={logo} alt="RUPIKSHA" className="h-10 md:h-12 object-contain" />
                        <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-tighter self-start">Making Life Simple</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200">Control Panel — SuperAdmin</span>
                        <button
                            onClick={() => setPortal('select')}
                            className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Change Portal
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                    {/* Left: SuperAdmin Login */}
                    <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-white overflow-y-auto">
                        <div className="w-full max-w-[440px] space-y-6">
                            <h2 className="text-indigo-600 text-2xl md:text-3xl font-black text-center tracking-tighter uppercase">
                                SUPER ADMIN LOGIN
                            </h2>
                            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2.5 font-bold uppercase tracking-widest text-sm">
                                    System Control — Super Distributor Access
                                </div>
                                <div className="p-8">
                                    <SuperAdminLogin />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: SuperAdmin promo banner */}
                    <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] relative overflow-hidden items-center justify-center p-8 lg:p-14">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
                                <Shield size={40} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Super Distributor Control Panel</span>
                                <h3 className="text-3xl font-black tracking-tight">Ultimate Authority & OverSight</h3>
                                <p className="text-white/60 text-sm font-bold">Monitor the entire ecosystem from a single dashboard. Manage partners, track growth and ensure security.</p>
                            </div>
                            {[
                                'Manage All Distributors',
                                'Manage All Retailers',
                                'System-wide Transactions',
                                'Direct Service Overrides',
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="w-5 h-5 bg-indigo-400 rounded-full flex items-center justify-center shrink-0">
                                        <Check size={11} className="text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-white/80">{f}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Montserrat',sans-serif]">
            {/* Header — same style as Distributor portal */}
            <header className="bg-white px-4 md:px-8 py-2 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-50">
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setView('login')}>
                    <img src={logo} alt="RUPIKSHA" className="h-10 md:h-12 object-contain" />
                    <span className="text-[8px] font-bold text-slate-400 -mt-1 uppercase tracking-tighter self-start">Making Life Simple</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200">Retailer Portal — A Panel</span>
                    <button
                        onClick={() => setPortal('select')}
                        className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Change Portal
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                {/* Left: Retailer Login Card */}
                <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-12 flex flex-col items-center justify-center bg-white overflow-y-auto">
                    <div className="w-full max-w-[440px] space-y-6">
                        <h2 className="text-[#1e40af] text-2xl md:text-3xl font-black text-center tracking-tighter uppercase">
                            RETAILER LOGIN
                        </h2>
                        <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white text-center py-2.5 font-bold uppercase tracking-widest text-sm">
                                {view === 'login' ? 'A Panel — Retailer Access' :
                                    view === 'register' ? t('create_account_title') : t('forgot_password')}
                            </div>

                            <AnimatePresence mode="wait">
                                {view === 'login' ? (
                                    <motion.form
                                        key="login"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleAction}
                                        className="p-8 space-y-5"
                                    >
                                        {/* Login Method Toggle */}
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button type="button" onClick={() => setLoginMethod('password')}
                                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-all ${loginMethod === 'password' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {t('login_by_password')}
                                            </button>
                                            <button type="button" onClick={() => setLoginMethod('otp')}
                                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-all ${loginMethod === 'otp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {t('login_by_otp')}
                                            </button>
                                        </div>

                                        {loginStep === 'otp' ? (
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t('otp_sent')}</p>
                                                    <p className="text-sm font-black text-blue-600 mt-1">{tempUser?.mobile || loginForm.username}</p>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-r border-slate-200 bg-slate-50 rounded-l-md">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder={t('otp_placeholder')}
                                                        className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold tracking-[0.5em] text-center"
                                                        value={enteredOtp}
                                                        onChange={(e) => setEnteredOtp(e.target.value)}
                                                        maxLength={6}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" disabled={isLoading}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 text-white font-black py-3.5 rounded-full text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-60"
                                                >
                                                    {isLoading
                                                        ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" /> Verifying...</>
                                                        : <><span>{t('verify_otp_btn')}</span><ArrowRight size={16} /></>
                                                    }
                                                </button>
                                                <button type="button" onClick={() => { setLoginStep('credentials'); setEnteredOtp(''); }}
                                                    className="w-full text-center text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider">
                                                    ← {t('back_to_login')}
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-r border-slate-200 bg-slate-50 rounded-l-md">
                                                        <Smartphone size={18} />
                                                    </div>
                                                    <input type="text" placeholder={t('mobile_placeholder')}
                                                        className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium"
                                                        value={loginForm.username}
                                                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                {loginMethod === 'password' && (
                                                    <>
                                                        <div className="relative">
                                                            <input type={showPassword ? 'text' : 'password'}
                                                                placeholder={t('password_placeholder')}
                                                                className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium"
                                                                value={loginForm.password}
                                                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                                required
                                                            />
                                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 border-l border-slate-200 hover:text-blue-600 bg-slate-50 rounded-r-md">
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 items-center">
                                                            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
                                                                <span className="text-xl font-['Brush_Script_MT',cursive] italic tracking-widest text-slate-600 select-none flex-1 text-center line-through decoration-slate-400">
                                                                    {captcha}
                                                                </span>
                                                                <button type="button" onClick={refreshCaptcha} className="text-slate-400 hover:text-blue-600 transition-transform hover:rotate-180 duration-500">
                                                                    <RefreshCcw size={16} />
                                                                </button>
                                                            </div>
                                                            <input type="text" placeholder={t('captcha_placeholder')}
                                                                className="w-full px-3 py-3.5 border border-slate-300 rounded-md outline-none focus:border-blue-500 text-sm font-medium"
                                                                onChange={(e) => setLoginForm({ ...loginForm, captcha: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <button type="submit" disabled={isLoading}
                                                    className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:opacity-90 text-white font-black py-3.5 rounded-full text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-60"
                                                >
                                                    {isLoading
                                                        ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" /> Signing in...</>
                                                        : <><span>{t('login_btn')}</span><ArrowRight size={16} /></>
                                                    }
                                                </button>
                                            </>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-px bg-slate-200" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                                            <div className="flex-1 h-px bg-slate-200" />
                                        </div>

                                        <button type="button" onClick={() => setView('register')}
                                            className="w-full border-2 border-blue-400 hover:bg-blue-50 text-blue-600 font-black py-3 rounded-full text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                                            <Users size={15} /> Create Free Account
                                        </button>

                                        <button type="button" onClick={() => setView('forgot')}
                                            className="w-full text-center text-[10px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-wider">
                                            {t('forgot_password')}
                                        </button>
                                    </motion.form>
                                ) : view === 'register' ? (
                                    <motion.form
                                        key="register"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleAction}
                                        className="p-8 space-y-4"
                                    >
                                        <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-wide">{t('register_p')}</p>

                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder={t('name_label')}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 outline-none text-sm font-medium"
                                                value={registerForm.name}
                                                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                                required />
                                        </div>
                                        <div className="relative">
                                            <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder={t('mobile_label')}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 outline-none text-sm font-medium"
                                                value={registerForm.mobile}
                                                onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
                                                required />
                                        </div>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="email" placeholder={t('email_label')}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 outline-none text-sm font-medium"
                                                value={registerForm.email}
                                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                                required />
                                        </div>
                                        <div className="relative">
                                            <select
                                                className={`w-full px-3 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 outline-none text-sm font-medium appearance-none ${!registerForm.state ? 'text-slate-400' : 'text-slate-900'}`}
                                                value={registerForm.state}
                                                onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })}
                                                required>
                                                <option value="">{t('state_label')}</option>
                                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 items-center">
                                            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
                                                <span className="text-xl font-['Brush_Script_MT',cursive] italic tracking-widest text-slate-600 select-none flex-1 text-center line-through decoration-slate-400">
                                                    {captcha}
                                                </span>
                                                <button type="button" onClick={refreshCaptcha} className="text-slate-400 hover:text-blue-600 transition-transform hover:rotate-180 duration-500">
                                                    <RefreshCcw size={16} />
                                                </button>
                                            </div>
                                            <input type="text" placeholder={t('captcha_placeholder')}
                                                className="w-full px-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                                                onChange={(e) => setRegisterForm({ ...registerForm, captcha: e.target.value })}
                                                required />
                                        </div>

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox"
                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={registerForm.agreement}
                                                onChange={(e) => setRegisterForm({ ...registerForm, agreement: e.target.checked })}
                                                required />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight">{t('agreement')}</span>
                                        </label>

                                        <button type="submit" disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:opacity-90 text-white font-black py-3.5 rounded-full text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                                            {isLoading
                                                ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />Submitting...</>
                                                : <><Users size={14} /> {t('register_btn')}</>}
                                        </button>
                                        <button type="button" onClick={() => setView('login')}
                                            className="w-full text-center text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider">
                                            ← {t('already_registered')} {t('log_in_link')}
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="forgot"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleAction}
                                        className="p-8 space-y-5"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{t('mobile_label')}</label>
                                            <input type="text" placeholder="Enter your registered mobile number"
                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 outline-none text-sm font-medium"
                                                value={forgotForm.mobile}
                                                onChange={(e) => setForgotForm({ ...forgotForm, mobile: e.target.value })}
                                                required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{t('dob_label')}</label>
                                            <div className="flex">
                                                <div className="w-12 bg-slate-50 border border-r-0 border-slate-300 rounded-l-xl flex items-center justify-center text-slate-400">
                                                    <Calendar size={16} />
                                                </div>
                                                <input type="text" placeholder="DD/MM/YYYY"
                                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-r-xl focus:border-blue-500 outline-none text-sm font-medium"
                                                    value={forgotForm.dob}
                                                    onChange={(e) => setForgotForm({ ...forgotForm, dob: e.target.value })}
                                                    required />
                                            </div>
                                            <p className="text-[9px] font-bold mt-1.5 text-emerald-600 italic">{t('dob_note')}</p>
                                        </div>
                                        <button type="submit" disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:opacity-90 text-white font-black py-3.5 rounded-full text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                                            {t('submit_btn')} <ArrowRight size={14} />
                                        </button>
                                        <button type="button" onClick={() => setView('login')}
                                            className="w-full text-center text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider">
                                            ← {t('back_to_login')}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right: Retailer Promo Panel — mirrors exact Distributor right panel style */}
                <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0c1a3a] via-[#1e40af] to-[#0c1a3a] relative overflow-hidden items-center justify-center p-8 lg:p-14">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/10 blur-[150px] rounded-full -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/10 blur-[120px] rounded-full -ml-40 -mb-40" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-white max-w-md text-center space-y-6 z-10"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
                            <Users size={40} className="text-white" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Retailer A Panel</span>
                            <h3 className="text-3xl font-black tracking-tight">Grow Your<br />Business Today</h3>
                            <p className="text-white/60 text-sm font-bold">Access AEPS, DMT, BBPS, Travel &amp; 20+ services — all on one powerful platform.</p>
                        </div>
                        {[
                            'AEPS & Micro ATM Services',
                            'BBPS — Utility Bill Payments',
                            'DMT — Money Transfer',
                            'Travel Booking & Insurance',
                            '24×7 Dedicated Support',
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-left bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center shrink-0">
                                    <Check size={11} className="text-white" />
                                </div>
                                <span className="text-sm font-bold text-white/80">{f}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>

            {/* WhatsApp Float */}
            <a href="https://wa.me/919289309524" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[100] group">
                <div className="absolute -top-14 right-0 bg-white text-[#1e40af] px-4 py-2 rounded-lg shadow-2xl text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border border-slate-100 uppercase">
                    {t('chat_with_us')}
                    <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100" />
                </div>
                <div className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:bg-[#128C7E] hover:scale-110 active:scale-90 transition-all relative flex items-center justify-center">
                    <MessageSquare size={32} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce shadow">1</span>
                </div>
            </a>
        </div>
    );
};

export default Login;
