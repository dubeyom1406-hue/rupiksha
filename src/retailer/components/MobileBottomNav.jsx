import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Zap, Smartphone, FileText, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid, path: '/dashboard' },
    { id: 'aeps_services', label: 'Banking', icon: Landmark, path: '/aeps' },
    { id: 'utility', label: 'Utility', icon: Zap, path: '/utility' },
    { id: 'all_services', label: 'Services', icon: Smartphone, path: '/all-services' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
];

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100"
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex items-center justify-around px-2 pt-2 pb-2">
                {TABS.map(tab => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all"
                            style={{ minHeight: 52 }}
                        >
                            <div
                                className="flex items-center justify-center w-10 h-7 rounded-full transition-all"
                                style={{
                                    background: active ? '#1e3a8a15' : 'transparent',
                                }}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    style={{ color: active ? '#1e3a8a' : '#94a3b8' }}
                                />
                            </div>
                            <span
                                className="text-[9px] font-bold"
                                style={{
                                    color: active ? '#1e3a8a' : '#94a3b8',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                {tab.label}
                            </span>
                            {active && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute bottom-0 w-8 h-0.5 rounded-full bg-blue-900"
                                    style={{ bottom: 0 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
