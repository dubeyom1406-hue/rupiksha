import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminTopBar from './SuperAdminTopBar';
import { sharedDataService } from '../../services/sharedDataService';

const SuperAdminLayout = () => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Guard: if no active session, send to login
        const session = sharedDataService.getCurrentSuperAdmin();
        if (!session) {
            navigate('/', { replace: true });
            return;
        }
        // Ensure we always read the freshest data from localStorage
        const fresh = sharedDataService.getSuperAdminById(session.id);
        if (fresh) {
            sharedDataService.setCurrentSuperAdmin(fresh);
        }
    }, [navigate]);

    return (
        <div className="flex h-screen bg-[#f0f4ff] overflow-hidden font-['Inter',sans-serif]">
            <SuperAdminSidebar
                showMobile={showMobileSidebar}
                onClose={() => setShowMobileSidebar(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <SuperAdminTopBar onMenuClick={() => setShowMobileSidebar(v => !v)} />

                {/* Welcome Strip */}
                <div className="bg-gradient-to-r from-[#0a0f1e] via-[#12244e] to-[#0a0f1e] text-center py-2 text-[9px] font-black uppercase tracking-[0.3em] shrink-0 flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-white/70">Rupiksha SuperAdmin Portal</span>
                    <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full px-3 py-0.5 text-[8px]">B Panel — Live</span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white border-b border-slate-100 px-4 flex items-center gap-1 shrink-0 overflow-x-auto shadow-sm">
                    {[
                        { to: '/superadmin', label: 'Dashboard', end: true },
                        { to: '/superadmin/distributors', label: 'Distributors' },
                        { to: '/superadmin/retailers', label: 'Retailers' },
                        { to: '/superadmin/transactions', label: 'Transactions' },
                        { to: '/superadmin/reports', label: 'Reports' },
                        { to: '/superadmin/accounts', label: 'Accounts' },
                    ].map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `px-4 py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap border-b-2 transition-all
                                ${isActive
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
