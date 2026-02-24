import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { menuItems } from '../data/menuItems';
import { ChevronDown, ChevronRight, Phone, Smartphone, LayoutDashboard, ArrowLeft } from 'lucide-react';
import logo from '../../assets/rupiksha_new_logo.png';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminSidebar = ({ showMobile, onClose }) => {
    const [openMenus, setOpenMenus] = useState({});
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = (title) => {
        if (!isHovered) return; // Don't expand submenus when sidebar is collapsed
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const isPathActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <>
            {/* Mobile backdrop */}
            <AnimatePresence>
                {showMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — animated hover expand like retailer sidebar */}
            <motion.aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    width: isHovered ? 240 : 68,
                    x: typeof window !== 'undefined' && window.innerWidth < 1024
                        ? (showMobile ? 0 : -240)
                        : 0
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className={`
                    fixed top-0 left-0 h-screen z-50 flex flex-col
                    bg-gradient-to-b from-[#0d1b2e] via-[#162543] to-[#0d1b2e]
                    border-r border-white/5 shadow-2xl overflow-hidden
                    ${showMobile ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:flex lg:z-auto shrink-0
                `}
                style={{
                    width: typeof window !== 'undefined' && window.innerWidth < 1024 ? 240 : undefined
                }}
            >
                {/* Logo Area */}
                <div className={`flex flex-col items-center gap-2 px-3 py-5 border-b border-white/10 h-24 justify-center overflow-hidden`}>
                    <motion.img
                        animate={{ scale: isHovered ? 1 : 0.7 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        src={logo}
                        alt="Rupiksha Logo"
                        className="h-8 object-contain"
                    />
                    <AnimatePresence>
                        {isHovered && (
                            <motion.span
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="inline-block bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap"
                            >
                                SuperAdmin Portal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 scrollbar-none space-y-0.5 px-2">
                    {/* Dashboard NavLink */}
                    <NavLink
                        to="/superadmin"
                        end
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200
                            ${isActive
                                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            } ${isHovered ? 'justify-start' : 'justify-center'}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard size={16} className="shrink-0" />
                                {isHovered && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="truncate"
                                    >
                                        Dashboard
                                    </motion.span>
                                )}
                            </>
                        )}
                    </NavLink>

                    {/* Dynamic menu items */}
                    {menuItems.map((item) => {
                        const isActive = isPathActive(item.path);
                        const isOpen = openMenus[item.title];

                        return (
                            <div key={item.title}>
                                {item.submenu ? (
                                    <button
                                        onClick={() => toggleMenu(item.title)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200
                                            ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                            ${isHovered ? 'justify-start' : 'justify-center'}`}
                                    >
                                        <item.icon size={16} className="shrink-0" />
                                        {isHovered && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex-1 text-left truncate"
                                            >
                                                {item.title}
                                            </motion.span>
                                        )}
                                        {isHovered && (
                                            isOpen
                                                ? <ChevronDown size={11} className="shrink-0 text-amber-400" />
                                                : <ChevronRight size={11} className="shrink-0" />
                                        )}
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        end
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200
                                            ${isActive
                                                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            } ${isHovered ? 'justify-start' : 'justify-center'}`
                                        }
                                    >
                                        {() => (
                                            <>
                                                <item.icon size={16} className="shrink-0" />
                                                {isHovered && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="truncate"
                                                    >
                                                        {item.title}
                                                    </motion.span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                )}

                                {/* Submenu */}
                                <AnimatePresence>
                                    {item.submenu && isOpen && isHovered && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            className="overflow-hidden ml-5 mt-0.5 border-l border-amber-500/20 pl-3 space-y-0.5"
                                        >
                                            {item.submenu.map((sub) => (
                                                <NavLink
                                                    key={sub.path}
                                                    to={sub.path}
                                                    onClick={onClose}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all
                                                        ${isActive ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`
                                                    }
                                                >
                                                    <sub.icon size={11} className="shrink-0" />
                                                    <span className="truncate">{sub.title}</span>
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-3 space-y-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`w-full flex items-center gap-2 text-slate-400 hover:text-amber-400 text-[9px] font-black uppercase tracking-widest transition-colors py-2 px-2 rounded-lg hover:bg-white/5
                            ${isHovered ? 'justify-start' : 'justify-center'}`}
                    >
                        <ArrowLeft size={14} className="shrink-0" />
                        {isHovered && (
                            <motion.span
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                Back to Retailer Panel
                            </motion.span>
                        )}
                    </button>

                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 rounded-xl p-3 space-y-1"
                        >
                            <p className="text-[8px] font-black text-amber-300/60 uppercase tracking-widest">Customer Support</p>
                            <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
                                <Phone size={10} /> 022-6908-4510
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
                                <Smartphone size={10} /> 9223300024
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.aside>
        </>
    );
};

export default SuperAdminSidebar;
