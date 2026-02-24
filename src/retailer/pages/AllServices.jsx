import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, Monitor, Smartphone,
    // ... (rest of imports)
} from 'lucide-react';

// ... (assets)

const AllServices = () => {
    const navigate = useNavigate();
    const [activeOnly, setActiveOnly] = useState(false);

    const onServiceClick = (id) => {
        const routeMap = {
            'aeps_services': '/aeps',
            'cms': '/cms',
            'travel': '/travel',
            'utility': '/utility',
            'quick_mr': '/dmt',
            'matm': '/matm',
            'matm_cash': '/matm',
            'matm_mp63': '/matm',
            // add more as needed
        };
        navigate(routeMap[id] || '/dashboard');
    };
    // ... (rest of component uses onServiceClick)

    const bankingServices = [
        { id: 'quick_mr', title: 'Quick MR Plus', icon: quickMrPlusNew, showTransact: true, isLarge: true },
        { id: 'pw_money_ekyc', title: 'Pw Money QMR EKYC', icon: pwMoneyEkycNew, showTransact: true, isLarge: true },
        { id: 'aeps_services', title: 'AEPS Services', icon: aepsLogo, showTransact: true, isLarge: true },
        { id: 'matm', title: '2-in-1 mPOS (New)', icon: <Smartphone className="text-blue-900" size={32} />, actionLabel: 'Purchase', actionColor: 'bg-blue-600' },
        { id: 'fino_suvidha', title: 'Fino Suvidha', icon: <Banknote className="text-emerald-600" size={32} />, actionLabel: 'Purchase', actionColor: 'bg-blue-600' },
        { id: 'smart_pos', title: 'Smart POS', icon: <Monitor className="text-blue-800" size={32} />, actionLabel: 'Purchase', actionColor: 'bg-blue-600' },
        { id: 'matm_cash', title: 'm-ATM Cash', icon: <CreditCard className="text-blue-700" size={32} /> },
        { id: 'matm_mp63', title: 'mATM - MP63', icon: <Smartphone className="text-blue-600" size={32} /> },
        { id: 'qpos_mini', title: '2-IN-1 (QPOS Mini)', icon: <Smartphone className="text-emerald-500" size={32} />, actionLabel: 'Purchase', actionColor: 'bg-blue-600' },
        { id: 'ybl_mr', title: 'Indo Nepal MR', icon: <Globe className="text-blue-900" size={32} />, actionLabel: 'Purchase', actionColor: 'bg-blue-600' },
    ];

    const travelServices = [
        { title: 'Hotel Booking', icon: <Hotel className="text-blue-800" size={32} /> },
        { title: 'Rail E-Ticketing (OTP Based)', icon: irctcLogo },
        { title: 'Train', icon: irctcLogo },
        { title: 'Bus Ticketing', icon: <Bus className="text-blue-700" size={32} /> },
        { title: 'Air Ticketing', icon: <Plane className="text-blue-600" size={32} /> },
        { title: 'New Air Ticketing', icon: <Plane className="text-blue-500" size={32} /> },
    ];


    const bharatConnectServices = [
        { title: 'Bill Pay', icon: bbpsLogo },
        { title: 'Loan Payments', icon: <Bank className="text-blue-900" size={32} /> },
        { title: 'Electricity Bill', icon: <Zap className="text-emerald-500" size={32} /> },
        { title: 'Gas Cylinder', icon: <Flame className="text-red-500" size={32} /> },
        { title: 'Piped Gas Bill', icon: <Flame className="text-orange-500" size={32} /> },
        { title: 'Water Bill', icon: <Droplets className="text-blue-500" size={32} /> },
        { title: 'FASTag Payments', icon: Car },
        { title: 'DTH', icon: <Tv className="text-emerald-600" size={32} /> },
        { title: 'Broadband Payments', icon: <Router className="text-blue-500" size={32} /> },
        { title: 'Landline Postpaid', icon: <PhoneCall className="text-blue-800" size={32} /> },
        { title: 'Mobile Postpaid', icon: <Smartphone className="text-blue-600" size={32} /> },
        { title: 'LIC Premium', icon: licLogo },
        { title: 'Insurance Payments', icon: <ShieldCheck className="text-emerald-500" size={32} /> },
        { title: 'Credit Card Bill', icon: <CreditCard className="text-blue-700" size={32} /> },
        { title: 'Visa/Master CC Bill', icon: <CreditCard className="text-blue-600" size={32} /> },
        { title: 'Municipal Taxes', icon: <FileText className="text-blue-500" size={32} /> },
        { title: 'Housing Societies', icon: <Building2 className="text-emerald-600" size={32} /> },
        { title: 'Digital Cable TV', icon: <Tv2 className="text-blue-500" size={32} /> },
        { title: 'Subscription', icon: <BellRing className="text-blue-700" size={32} /> },
        { title: 'Hospital Bill', icon: <Hospital className="text-blue-800" size={32} /> },
        { title: 'Clubs and Associations', icon: <Users2 className="text-blue-900" size={32} /> },
        { title: 'Education Bill', icon: <GraduationCap className="text-blue-700" size={32} /> },
    ];

    const utilityServices = [
        { title: 'Mobile Recharge', icon: <Smartphone className="text-blue-600" size={32} /> },
        { title: 'DTH Recharge', icon: <Monitor className="text-blue-500" size={32} /> },
        { title: 'Collection', icon: <Coins className="text-emerald-600" size={32} /> },
        { title: 'Instant Pan Card Service', icon: nsdlLogo },
        { title: 'Ayushpay Subscription', icon: <Smartphone className="text-blue-600" size={32} /> },
        { title: 'Digital Wallet Top-up', icon: <Wallet className="text-blue-600" size={32} /> },
        { title: 'Vouchers', icon: amazonLogo },
        { title: 'HDFC BF', icon: <div className="bg-blue-600 text-white font-bold p-1 rounded text-[8px]">HDFC</div> },
        { title: 'Recharge OTT', icon: <Tv className="text-blue-900" size={32} /> },
        { title: 'Digi Gold', icon: <Coins className="text-yellow-600" size={32} /> },
        { title: 'PAN Card', icon: nsdlLogo },
        { title: 'ITR-Filing', icon: <FileText className="text-blue-700" size={32} /> },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 font-['Inter',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[4px] mb-1">Service Marketplace</p>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Hub</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">One-stop shop for all your business needs</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                        <p className="text-[8px] font-black text-indigo-400 uppercase">Active Services</p>
                        <p className="text-xl font-black text-indigo-700">62+</p>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-4">Banking Services</h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Only Active</span>
                        <Toggle enabled={activeOnly} setEnabled={setActiveOnly} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {bankingServices.map((service, idx) => (
                        <ServiceCard
                            key={idx}
                            title={service.title}
                            icon={service.icon}
                            active={true}
                            showTransact={service.showTransact}
                            actionLabel={service.actionLabel}
                            actionColor={service.actionColor}
                            isLarge={service.isLarge}
                            onClick={() => service.id && onServiceClick(service.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-4">Travel Services</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {travelServices.map((service, idx) => (
                        <ServiceCard key={idx} title={service.title} icon={service.icon} active={true} showTransact={service.showTransact} onClick={() => onServiceClick('travel')} />
                    ))}
                </div>
            </div>




            <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-violet-500 pl-4">Bharat Connect</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {bharatConnectServices.map((service, idx) => (
                        <ServiceCard key={idx} title={service.title} icon={service.icon} active={true} showTransact={service.showTransact} onClick={() => onServiceClick('utility')} />
                    ))}
                </div>
            </div>

            <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-orange-500 pl-4">Utility & Other Services</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {utilityServices.map((service, idx) => (
                        <ServiceCard key={idx} title={service.title} icon={service.icon} active={true} showTransact={service.showTransact} onClick={() => onServiceClick('utility')} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllServices;
