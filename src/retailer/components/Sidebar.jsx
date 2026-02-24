import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    LayoutGrid, Plane, Smartphone, HandCoins, FileText,
    Fingerprint, Calculator, Zap, Lightbulb, Landmark, Headset,
    FileChartColumn, CreditCard, ScanFace, ChevronRight, ChevronDown,
    Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mainLogo from '../../assets/rupiksha_logo.png';
import { dataService } from '../../services/dataService';
const Sidebar = ({ activeTab, setActiveTab, showMobileSidebar }) => {
    const { t } = useLanguage();
    const [expandedItems, setExpandedItems] = useState({ banking: false, travel: false });
    const [isHovered, setIsHovered] = useState(false);
    const [appData, setAppData] = useState(dataService.getData());

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    const toggleExpand = (id) => {
        if (!isHovered) return; // Don't expand submenus if sidebar is collapsed
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Professional, clean colors.

    const serviceItems = [
        {
            id: 'banking',
            label: 'Banking Hub',
            icon: Landmark,
            hasSubmenu: true,
            subItems: [
                { id: 'aeps_services', label: 'AEPS Services' },
                { id: 'cms', label: 'CMS – Loan EMI' },
                { id: 'matm', label: 'MATM' },
                { id: 'add_money', label: 'Add Money' },
                { id: 'quick_mr', label: 'Quick Mr' },
                { id: 'ybl_mr', label: 'YBL MR' },
                { id: 'pw_money_ekyc', label: 'PW Money QMR EKYC' },
            ]
        },

        { id: 'travel', label: 'Travel Hub', icon: Plane },
        { id: 'utility', label: 'Utility Hub', icon: Zap },
        { id: 'bharat_connect', label: 'Bharat Connect', icon: Building2 },
        { id: 'payout', label: 'Payout Hub', icon: HandCoins },
    ];

    const businessItems = [
        { id: 'reports', label: 'Reports & Ledger', icon: FileChartColumn, onClick: () => setActiveTab('reports') },
        { id: 'plans', label: 'Commission Plans', icon: CreditCard, onClick: () => setActiveTab('plans') },
    ];

    const ekycItems = [
        { id: 'retailer_ekyc', label: 'Retailer eKYC', icon: ScanFace, type: 'ekyc' },
        { id: 'icici_ekyc', label: 'ICICI eKYC', icon: Fingerprint, type: 'ekyc' },
        { id: 'support', label: 'Help & Support', icon: Headset, type: 'support' },
    ];

    const MenuItem = ({ item, isActive, onClick }) => {
        const isExpanded = expandedItems[item.id];

        return (
            <div>
                <motion.div
                    whileHover={{ x: isHovered ? 4 : 0 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                        if (item.hasSubmenu) {
                            toggleExpand(item.id);
                        } else {
                            onClick();
                        }
                    }}
                    className={`flex items-center ${isHovered ? 'justify-between' : 'justify-center'} px-6 py-3 cursor-pointer group transition-all duration-200 border-l-[3px]
                    ${isActive ? 'bg-slate-50 border-[#4a148c]' : 'border-transparent hover:bg-slate-50'}`}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`transition-colors flex flex-col items-center ${isActive ? 'text-[#4a148c]' : 'text-slate-500 group-hover:text-slate-700'}`}>
                            <item.icon size={24} strokeWidth={1.5} />
                            {item.id === 'banking' && isHovered && (
                                <div className="h-0.5 w-4 bg-current rounded-full mt-0.5 opacity-50"></div>
                            )}
                        </div>
                        {isHovered && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`font-semibold text-sm tracking-wide ${isActive ? 'text-slate-900 border-b-2 border-[#4a148c]' : 'text-slate-500 group-hover:text-slate-800'}`}
                                style={{ textShadow: '0 1px 1px rgba(0,0,0,0.05)' }}
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </div>
                    {isHovered && (
                        item.hasSubmenu ? (
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-0'}`}>
                                <ChevronRight size={18} className={`${isExpanded ? 'text-blue-900' : 'text-slate-300'}`} />
                            </div>
                        ) : (
                            item.type !== 'doc' && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={14} className="text-slate-300" />
                                </div>
                            )
                        )
                    )}
                </motion.div>

                {/* Submenu */}
                <AnimatePresence>
                    {item.hasSubmenu && isExpanded && isHovered && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="bg-white overflow-hidden"
                        >
                            {item.subItems.map((sub, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 6, color: '#1e3a8a' }}
                                    onClick={() => {
                                        // If this is the travel menu, keep dashboard activeTab as 'travel' and emit a selection event
                                        if (item.id === 'travel') {
                                            setActiveTab('travel');
                                            try { window.dispatchEvent(new CustomEvent('travelSelect', { detail: sub.id })); } catch (e) { /* ignore */ }
                                        }
                                        else if (item.id === 'utility') {
                                            setActiveTab('utility');
                                            try { window.dispatchEvent(new CustomEvent('utilitySelect', { detail: sub.id })); } catch (e) { /* ignore */ }
                                        }
                                        else {
                                            setActiveTab(sub.id);
                                        }
                                    }}
                                    className={`pl-10 py-2.5 text-[13px] font-bold cursor-pointer hover:bg-slate-50 transition-all text-left
                                    ${activeTab === sub.id || (item.id === 'travel' && activeTab === 'travel') || (item.id === 'utility' && activeTab === 'utility') ? 'text-blue-900 bg-blue-50/50' : 'text-slate-500'}`}
                                >
                                    {sub.label}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const currentUser = appData.currentUser;
    const getInitials = () => {
        if (currentUser?.businessName) {
            return currentUser.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        }
        return currentUser?.mobile?.slice(-2) || 'RX';
    };

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
            initial={false}
            animate={{
                width: isHovered ? 288 : 88,
                x: typeof window !== 'undefined' && window.innerWidth < 1024 ? (showMobileSidebar ? 0 : -288) : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed lg:relative bg-white flex-shrink-0 border-r border-slate-200 flex flex-col h-full font-['Inter',sans-serif] shadow-xl z-50 lg:z-20 overflow-hidden
                ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            style={{
                width: typeof window !== 'undefined' && window.innerWidth < 1024 ? 288 : undefined
            }}
        >
            {/* Logo Area */}
            <div className={`p-6 flex items-center ${isHovered ? 'justify-center' : 'justify-center'} border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 h-24 overflow-hidden`}>
                <motion.img
                    animate={{ scale: isHovered ? 1 : 0.6 }}
                    src={mainLogo}
                    alt="RUPIKSHA"
                    className="h-12 object-contain drop-shadow-md"
                />
            </div>

            <div className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                {/* Main Navigation */}
                <div className="mb-6 space-y-1">
                    <MenuItem
                        item={{ id: 'dashboard', label: 'My Dashboard', icon: LayoutGrid, type: 'main' }}
                        isActive={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <MenuItem
                        item={{ id: 'all_services', label: 'All Services', icon: Smartphone, type: 'main' }}
                        isActive={activeTab === 'all_services'}
                        onClick={() => setActiveTab('all_services')}
                    />
                </div>

                {/* Services Header */}
                <div className="px-6 py-2 flex items-center mb-2 overflow-hidden h-8">
                    {isHovered ? (
                        <>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1"></div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-2 whitespace-nowrap"
                            >
                                Services
                            </motion.h3>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1"></div>
                        </>
                    ) : (
                        <div className="w-full h-px bg-slate-100"></div>
                    )}
                </div>

                {/* Service List */}
                <div className="space-y-1 mb-6">
                    {serviceItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab))}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </div>

                {/* Business Hub Header */}
                <div className="px-6 py-2 flex items-center mb-2 overflow-hidden h-8">
                    {isHovered ? (
                        <>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1"></div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-2 whitespace-nowrap"
                            >
                                Business Hub
                            </motion.h3>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1"></div>
                        </>
                    ) : (
                        <div className="w-full h-px bg-slate-100"></div>
                    )}
                </div>

                {/* Business List */}
                <div className="space-y-1 mb-6">
                    {businessItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            onClick={item.onClick}
                        />
                    ))}
                </div>

                {/* EKYC Header */}
                <div className="px-6 py-2 flex items-center mb-2 overflow-hidden h-8">
                    {isHovered ? (
                        <>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1"></div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-2 whitespace-nowrap"
                            >
                                EKYC & Utilities
                            </motion.h3>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1"></div>
                        </>
                    ) : (
                        <div className="w-full h-px bg-slate-100"></div>
                    )}
                </div>

                {/* EKYC List */}
                <div className="space-y-1 pb-8">
                    {ekycItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </div>
            </div>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className={`flex items-center ${isHovered ? 'space-x-3 px-2' : 'justify-center'} py-2`}>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center">
                            {currentUser?.profilePhoto ? (
                                <img src={currentUser.profilePhoto} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] font-black text-blue-600 uppercase">{getInitials()}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col overflow-hidden"
                        >
                            <span className="text-[11px] font-black text-slate-800 uppercase truncate">
                                {currentUser?.businessName || currentUser?.mobile || 'User'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Online
                            </span>
                        </motion.div>
                    )}
                </div>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-[10px] text-slate-300 text-center font-bold uppercase tracking-widest"
                    >
                        v2.1.0 RUPIKSHA
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Sidebar;
