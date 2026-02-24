import React, { useState, useEffect } from 'react';
import {
    Fingerprint, Volume2, HelpCircle, Wallet, RefreshCw,
    Eye, Bell, MoreVertical, ChevronDown, Menu,
    User, CreditCard, FileText, Lock, Settings
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import mainLogo from '../../assets/rupiksha_logo.png';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onAddMoney, onProfileClick, onMenuClick }) => {
    const { t } = useLanguage();
    const [appData, setAppData] = useState(dataService.getData());
    const [showBalance, setShowBalance] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    const currentUser = appData.currentUser;
    const headerData = currentUser?.wallet || appData.wallet;

    // Get initials for profile
    const getInitials = () => {
        if (currentUser?.businessName) {
            return currentUser.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        }
        return currentUser?.mobile?.slice(-2) || 'RX';
    };

    return (
        <div className="flex flex-col w-full bg-white shadow-sm z-30 font-['Inter',sans-serif]">
            {/* Main Header Row */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">

                {/* Left Section: Menu + Logo */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center">
                            <span className="text-xl md:text-2xl font-black text-blue-600 tracking-tighter italic uppercase">Rupiksha</span>
                        </div>
                        <span className="text-[8px] text-blue-500 font-bold uppercase tracking-widest -mt-1">Making Life Simple</span>
                    </div>
                </div>

                {/* Middle Section: Shortcuts */}
                <div className="hidden lg:flex items-center space-x-8">
                    <div className="flex items-center space-x-2 text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                        <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                            <Fingerprint size={20} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-bold">Buy L1 Device</span>
                    </div>

                    {currentUser?.partyCode && (
                        <div className="bg-blue-50/50 border border-blue-100 px-4 py-1.5 rounded-xl flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Party Code</span>
                            <span className="text-xs font-black text-blue-600 tracking-wider leading-none">{currentUser.partyCode}</span>
                        </div>
                    )}

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg cursor-pointer relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Volume2 size={18} fill="white" />
                        <span className="text-sm font-bold">Buy SoundBox</span>
                        <div className="absolute inset-0 shadow-[0_0_20px_rgba(124,58,237,0.3)] pointer-events-none"></div>
                    </motion.div>
                </div>

                {/* Right Section: Balance & Profile */}
                <div className="flex items-center space-x-4">

                    {/* Balance Display Card */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 md:p-1.5 pr-2 shadow-sm space-x-1 md:space-x-3">
                        <div className="hidden sm:block bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <Wallet size={20} className="text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Balance</span>
                                <RefreshCw size={10} className="hidden sm:block text-slate-400 cursor-pointer hover:rotate-180 transition-all duration-500" />
                            </div>
                            <div className="flex items-center space-x-1 md:space-x-2 leading-none">
                                <span className="text-sm md:text-md font-black text-blue-900 tracking-tight">₹ {showBalance ? (headerData?.balance || '106.74') : '****'}</span>
                                <Eye
                                    size={14}
                                    className={`cursor-pointer ${showBalance ? 'text-red-400' : 'text-slate-400'}`}
                                    onClick={() => setShowBalance(!showBalance)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={onAddMoney}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wide transition-colors shadow-sm"
                        >
                            Add
                        </button>
                    </div>

                    {/* Notification & Profile */}
                    <div className="flex items-center space-x-3 border-l border-slate-100 pl-4 text-slate-500 relative">
                        <div className="relative cursor-pointer hover:text-slate-800 transition-colors">
                            <Bell size={22} fill="currentColor" className="text-slate-300" />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="relative">
                            <div
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-1 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full border-2 border-orange-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
                                    {currentUser?.profilePhoto ? (
                                        <img src={currentUser.profilePhoto} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-black text-orange-500 uppercase">{getInitials()}</span>
                                    )}
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="py-2">
                                                <button onClick={() => { onProfileClick('visiting_card'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                                    <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><CreditCard size={18} /></div>
                                                    <span className="text-sm font-bold text-slate-700">Visiting Card</span>
                                                </button>
                                                <button onClick={() => { onProfileClick('profile'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50">
                                                    <div className="bg-purple-100 p-1.5 rounded-lg text-purple-600"><User size={18} /></div>
                                                    <span className="text-sm font-bold text-slate-700">My Profile</span>
                                                </button>
                                                <button onClick={() => { onProfileClick('terms'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600"><FileText size={18} /></div>
                                                    <span className="text-sm font-bold text-slate-700">Terms & Condition</span>
                                                </button>
                                                <button onClick={() => { onProfileClick('privacy'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50">
                                                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600"><Lock size={18} /></div>
                                                    <span className="text-sm font-bold text-slate-700">Privacy Policy</span>
                                                </button>
                                                <button onClick={() => { onProfileClick('settings'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50">
                                                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600"><Settings size={18} /></div>
                                                    <span className="text-sm font-bold text-slate-700">Settings</span>
                                                </button>
                                                <button onClick={() => { onProfileClick('logout'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors text-red-600">
                                                    <div className="bg-red-50 p-1.5 rounded-lg"><Menu size={18} /></div>
                                                    <span className="text-sm font-bold">Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticker Row */}
            <div className="bg-white border-b border-slate-100 h-8 flex items-center px-4 overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee-slow py-1">
                    <span className="text-xs font-bold text-orange-600 flex items-center">
                        e issue is resolved we shall update shortly kindly use different alternative mode for adding money to your pay...
                    </span>
                    <span className="text-xs font-bold text-orange-600 flex items-center ml-20">
                        e issue is resolved we shall update shortly kindly use different alternative mode for adding money to your pay...
                    </span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee-slow {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-slow {
                    animation: marquee-slow 30s linear infinite;
                }
            `}} />
        </div>
    );
};

export default Header;
