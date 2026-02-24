import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { dataService } from '../../services/dataService';
import { AnimatePresence, motion } from 'framer-motion';

const RetailerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [appData, setAppData] = useState(dataService.getData());
    const currentUser = appData.currentUser;

    // Map path to active tab for Sidebar
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'dashboard';
        if (path.startsWith('/aeps')) return 'aeps_services';
        if (path.startsWith('/cms')) return 'cms';
        if (path.startsWith('/travel')) return 'travel';
        if (path.startsWith('/utility')) return 'utility';
        if (path.startsWith('/all-services')) return 'all_services';
        if (path.startsWith('/reports')) return 'reports';
        if (path.startsWith('/plans')) return 'plans';
        if (path.startsWith('/matm')) return 'matm';
        if (path === '/add-money') return 'add_money';
        return 'dashboard';
    };

    const activeTab = getActiveTab();

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    const handleTabChange = (tab) => {
        const routes = {
            'dashboard': '/dashboard',
            'aeps_services': '/aeps',
            'cms': '/cms',
            'travel': '/travel',
            'utility': '/utility',
            'all_services': '/all-services',
            'reports': '/reports',
            'plans': '/plans',
            'matm': '/matm',
            'add_money': '/add-money'
        };
        navigate(routes[tab] || '/dashboard');
        setShowMobileSidebar(false);
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-['Inter',sans-serif] overflow-hidden relative">
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileSidebar(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                showMobileSidebar={showMobileSidebar}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header
                    onAddMoney={() => navigate('/add-money')}
                    onProfileClick={(type) => {
                        if (type === 'logout') {
                            dataService.logoutUser();
                            navigate('/');
                        }
                    }}
                    onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
                />
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default RetailerLayout;
