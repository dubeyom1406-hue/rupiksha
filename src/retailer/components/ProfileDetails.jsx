import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle2, AlertCircle, User,
    Building2, MapPin, Phone, Mail, Lock,
    Save, Download, Printer, Camera, Pencil,
    ChevronDown, ArrowRight, RefreshCw, X, Calendar, ShieldCheck, Edit3, Plus, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, BACKEND_URL as IMPORTED_BACKEND_URL } from '../../services/dataService';

// Fallback if import system has issues with named exports in some environments
const BACKEND_URL = IMPORTED_BACKEND_URL || `/api`;

// Sub-components
import BusinessInfo from './profile/BusinessInfo';
import PersonalInfo from './profile/PersonalInfo';
import BankingInfo from './profile/BankingInfo';
import AdditionalDetails from './profile/AdditionalDetails';
import UPIDetails from './profile/UPIDetails';
import Documents from './profile/Documents';
import PasswordDetails from './profile/PasswordDetails';
import Settings from './profile/Settings';

const ProfileDetails = ({ activeTab = 'personal' }) => {
    const [activeSubTab, setActiveSubTab] = useState(activeTab);
    const [additionalTab, setAdditionalTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [appData, setAppData] = useState(dataService.getData());
    const fileInputRef = useRef(null);

    // Email Verification State
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [generatedOtp, setGeneratedOtp] = useState('');

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    useEffect(() => {
        setActiveSubTab(activeTab);
    }, [activeTab]);

    const currentUser = appData.currentUser;
    const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || "https://ui-avatars.com/api/?name=User&background=A0A0A0&color=fff");

    useEffect(() => {
        if (currentUser?.profilePhoto) {
            setProfilePhoto(currentUser.profilePhoto);
        }
    }, [currentUser?.profilePhoto]);

    const [formData, setFormData] = useState({
        // Business
        businessName: currentUser?.businessName || '',
        businessType: currentUser?.businessType || 'Sole proprietorship',
        category: currentUser?.category || 'Retail',
        address1: currentUser?.address1 || '',
        address2: currentUser?.address2 || '',
        pincode: currentUser?.pincode || '',
        area: currentUser?.area || 'Sikandarpur (Muzaffarpur)',
        salesName: currentUser?.salesName || '',
        salesContact: currentUser?.salesContact || '',
        // Personal
        name: currentUser?.name || '',
        gender: currentUser?.gender || 'Male',
        maritalStatus: currentUser?.maritalStatus || 'Single',
        dob: currentUser?.dob || '',
        residentialAddress1: currentUser?.residentialAddress1 || '',
        residentialAddress2: currentUser?.residentialAddress2 || '',
        personalPincode: currentUser?.personalPincode || '',
        personalArea: currentUser?.personalArea || 'Muzaffarpur',
        email: currentUser?.email || '',
        mobile: currentUser?.mobile || '',
        username: currentUser?.username || '',
        partyCode: currentUser?.partyCode || '',
        emailVerified: currentUser?.emailVerified || false,
        // PAN
        panNumber: currentUser?.panNumber || '',
        isPanVerified: currentUser?.isPanVerified || false,
        panName: currentUser?.panName || '',
        // Banking
        accHolderName: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        branchName: '',
        // Additional Personal
        altNumber: '',
        addEducation: '',
        handicapped: 'NO',
        nomineeDetails: '',
        nomineeName: '',
        nomineeAge: '',
        marriedStatus: '',
        spouseName: '',
        weddingDate: '',
        // Additional Business
        expectedBizRs: '',
        expectedBizTxn: '',
        weeklyOff: 'Sunday',
        monthlyIncome: '',
        bizExperience: '',
        footFall: '',
        // General
        servicesRequired: 'NO',
        selectServices: '',
        competitorId: 'NO',
        competitors: '',
        referenceFrom: '',
        // UPI
        upiId: '',
        // Password
        otp: '',
        newPassword: '',
        confirmPassword: '',
        // Settings
        emailNotifications: true,
        whatsappUpdates: true,
        twoStepAuth: false,
        theme: 'light',
        language: 'English'
    });

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                ...currentUser,
                name: currentUser.name || prev.name,
                mobile: currentUser.mobile || currentUser.username || prev.mobile,
                email: currentUser.email || prev.email,
                emailVerified: currentUser.emailVerified || false,
                panNumber: currentUser.panNumber || prev.panNumber,
                isPanVerified: currentUser.isPanVerified || false
            }));
            if (currentUser.profilePhoto) {
                setProfilePhoto(currentUser.profilePhoto);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async () => {
        if (!formData.email) {
            alert("Please provide an email address first.");
            return;
        }

        setIsSendingOtp(true);
        try {
            const response = await fetch(`${BACKEND_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();
            if (response.ok) {
                setShowVerifyModal(true);
                setTimer(60);
                setIsSendingOtp(false);
            } else {
                throw new Error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            setIsSendingOtp(false);

            // Show meaningful error to user
            alert(`Error sending OTP: ${error.message || "Connection refused"}. Please ensure the server is running on port 5001.`);
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) return;

        setIsVerifying(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: enteredOtp })
            });

            const data = await response.json();
            if (response.ok) {
                const updatedData = { ...formData, emailVerified: true };
                dataService.updateUserProfile(updatedData);
                setFormData(updatedData);
                setShowVerifyModal(false);
                setIsVerifying(false);
                setShowSavedToast(true);
                setTimeout(() => setShowSavedToast(false), 3000);
            } else {
                alert(data.message || "Invalid OTP. Please try again.");
                setIsVerifying(false);
            }
        } catch (error) {
            alert("Verification Failed. Check your connection.");
            setIsVerifying(false);
        }
    };

    const [isVerifyingPan, setIsVerifyingPan] = useState(false);

    const handlePanVerify = async () => {
        if (!formData.panNumber || formData.panNumber.length !== 10) {
            alert("Please enter a valid 10-digit PAN number.");
            return;
        }

        setIsVerifyingPan(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-pan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pan: formData.panNumber, name: formData.name })
            });

            const result = await response.json();
            if (result.success) {
                const panData = result.data;
                const updatedData = {
                    ...formData,
                    isPanVerified: true,
                    panName: panData.nameAtPan || panData.name
                };
                dataService.updateUserProfile(updatedData);
                setFormData(updatedData);
                alert(`PAN Verified Successfully! Name: ${panData.nameAtPan || panData.name}`);
            } else {
                // Show the specific error message from Cashfree/Backend
                const errorMsg = result.message || "PAN verification failed. Please check the number.";
                const errorCode = result.status_code ? ` (Status: ${result.status_code})` : "";
                alert(`${errorMsg}${errorCode}`);
            }
        } catch (error) {
            alert(`Verification Failed: ${error.message}. Please check your connection and ensure the server is running on port 5001.`);
        } finally {
            setIsVerifyingPan(false);
        }
    };
    const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);

    const handleUpiVerify = async () => {
        if (!formData.upiId || !formData.upiId.includes('@')) {
            alert("Please enter a valid UPI ID (e.g. name@bank).");
            return;
        }

        setIsVerifyingUpi(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-upi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vpa: formData.upiId })
            });

            const result = await response.json();
            if (result.success) {
                const upiData = result.data;
                alert(`UPI Verified Successfully! Name: ${upiData.name || 'Verified'}`);
                // You can add a isUpiVerified flag to formData if needed
                handleInputChange('isUpiVerified', true);
            } else {
                alert(result.message || "UPI verification failed. Please check the ID.");
            }
        } catch (error) {
            alert(`Verification Failed: ${error.message}. Please check your connection.`);
        } finally {
            setIsVerifyingUpi(false);
        }
    };

    const indianBanks = [
        "State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Bank of Baroda",
        "Axis Bank", "Canara Bank", "Union Bank of India", "IDBI Bank", "IndusInd Bank",
        "Kotak Mahindra Bank", "Yes Bank", "Federal Bank", "Bank of India", "Central Bank of India",
        "Indian Bank", "UCO Bank", "Punjab & Sind Bank", "South Indian Bank", "Karnataka Bank"
    ];

    const [showPasswords, setShowPasswords] = useState(false);
    const [isFetchingIFSC, setIsFetchingIFSC] = useState(false);
    const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

    const handleAccountVerify = async (accNum) => {
        if (accNum.length >= 10 && formData.ifscCode.length === 11) {
            setIsVerifyingAccount(true);
            try {
                const response = await fetch(`${BACKEND_URL}/verify-account`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountNumber: accNum, ifsc: formData.ifscCode })
                });
                const data = await response.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        accHolderName: data.accountHolderName
                    }));
                }
            } catch (err) {
                setIsVerifyingAccount(false);
            }
        }
    };

    const handleIFSCFetch = async (ifsc) => {
        if (ifsc.length === 11) {
            setIsFetchingIFSC(true);
            try {
                const response = await fetch(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        bankName: data.BANK,
                        branchName: data.BRANCH,
                        address1: data.ADDRESS,
                        personalArea: data.CITY,
                    }));
                } else {
                    // Fallback using first 4 chars if API fails
                    const bankCode = ifsc.substring(0, 4).toUpperCase();
                    const bankMap = {
                        'SBIN': 'STATE BANK OF INDIA',
                        'HDFC': 'HDFC BANK',
                        'ICIC': 'ICICI BANK',
                        'BARB': 'BANK OF BARODA',
                        'PUNB': 'PUNJAB NATIONAL BANK',
                        'AXIS': 'AXIS BANK',
                        'KKBK': 'KOTAK MAHINDRA BANK',
                        'UTIB': 'AXIS BANK',
                        'YESB': 'YES BANK'
                    };
                    if (bankMap[bankCode]) {
                        setFormData(prev => ({ ...prev, bankName: bankMap[bankCode] }));
                    }
                }
            } catch (error) {
                setIsFetchingIFSC(false);
            }
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        const success = dataService.updateUserProfile({
            ...formData,
            profilePhoto: profilePhoto
        });

        if (success) {
            window.dispatchEvent(new Event('dataUpdated'));
            setTimeout(() => {
                setIsSaving(false);
                setShowSavedToast(true);
                setTimeout(() => setShowSavedToast(false), 3000);
            }, 800);
        } else {
            setIsSaving(false);
            alert("Failed to update profile.");
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setProfilePhoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'ifscCode') handleIFSCFetch(value);
        if (field === 'accountNumber') handleAccountVerify(value);
    };

    const getSectionStatus = (id) => {
        if (!currentUser) return 'none';

        switch (id) {
            case 'business':
                return (formData.businessName && formData.address1 && formData.pincode) ? 'verified' : 'missing';
            case 'personal':
                return (formData.name && formData.email && formData.dob && formData.gender && formData.emailVerified) ? 'verified' : 'missing';
            case 'additional':
                return (formData.nomineeName && formData.marriedStatus) ? 'verified' : 'missing';
            case 'banking':
                return (currentUser.banks?.length > 0) ? 'verified' : 'missing';
            case 'documents':
                return (currentUser.documents?.length >= 3) ? 'verified' : 'missing';
            case 'upi':
                return formData.upiId ? 'verified' : 'none';
            default:
                return 'none';
        }
    };

    const menuItems = [
        { id: 'business', label: 'Business Information', status: getSectionStatus('business') },
        { id: 'personal', label: 'Personal Information', status: getSectionStatus('personal') },
        { id: 'additional', label: 'Additional Details', status: getSectionStatus('additional') },
        { id: 'banking', label: 'Banking Details', status: getSectionStatus('banking') },
        { id: 'upi', label: 'UPI', status: getSectionStatus('upi') },
        { id: 'documents', label: 'My Documents', status: getSectionStatus('documents') },
        { id: 'password', label: 'Password', status: 'none' },
        { id: 'settings', label: 'Settings', status: 'none' },
    ];

    const getStatusIcon = (status) => {
        if (status === 'verified') return <CheckCircle2 size={16} className="text-emerald-500" />;
        if (status === 'pending') return <div className="w-4 h-4 rounded-full border-2 border-amber-300" />;
        if (status === 'missing') return <AlertCircle size={16} className="text-rose-500" />;
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f7fa] font-['Inter',sans-serif]">
            {!currentUser?.profileComplete && (
                <div className="bg-blue-600 text-white px-8 py-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-3">
                        <AlertCircle size={20} className="animate-pulse" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Complete Your Profile</p>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">You must complete your profile information to access all RuPiKsha services.</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white px-4 md:px-8 py-4 md:py-6 border-b border-slate-200">
                <h1 className="text-xl md:text-3xl font-bold text-[#4e5d78] tracking-tight">Profile Details</h1>
            </div>
            <div className="flex flex-col lg:flex-1 lg:flex-row overflow-hidden pb-16 lg:pb-0">
                <div className="w-full lg:w-[380px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-x-auto lg:overflow-y-auto flex lg:flex-col no-scrollbar shrink-0">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveSubTab(item.id)}
                            className={`flex items-center justify-between px-6 lg:px-8 py-3 lg:py-4 cursor-pointer border-r lg:border-r-0 lg:border-b border-slate-100 transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${activeSubTab === item.id ? 'bg-[#f8fafc] border-b-2 lg:border-b-0' : 'hover:bg-slate-50'}`}
                        >
                            <span className={`text-[13px] lg:text-[15px] font-medium ${activeSubTab === item.id ? 'text-[#334e68] font-bold' : 'text-[#718096]'}`}>{item.label}</span>
                            <div className="hidden lg:flex items-center ms-2">{getStatusIcon(item.status)}</div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto bg-[#f4f7fa] p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeSubTab} initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}>
                            {activeSubTab === 'business' && <BusinessInfo formData={formData} handleInputChange={handleInputChange} handleSave={handleSave} isSaving={isSaving} />}
                            {activeSubTab === 'personal' && (
                                <PersonalInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    isSendingOtp={isSendingOtp}
                                    profilePhoto={profilePhoto}
                                    fileInputRef={fileInputRef}
                                    handlePhotoChange={handlePhotoChange}
                                    onVerifyEmail={handleSendOtp}
                                    onVerifyPan={handlePanVerify}
                                    isVerifyingPan={isVerifyingPan}
                                />
                            )}
                            {activeSubTab === 'banking' && (
                                <BankingInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    isFetchingIFSC={isFetchingIFSC}
                                    isVerifyingAccount={isVerifyingAccount}
                                    setFormData={setFormData}
                                    currentUser={currentUser}
                                />
                            )}
                            {activeSubTab === 'additional' && (
                                <AdditionalDetails
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    additionalTab={additionalTab}
                                    setAdditionalTab={setAdditionalTab}
                                />
                            )}
                            {activeSubTab === 'upi' && (
                                <UPIDetails
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    onVerifyUpi={handleUpiVerify}
                                    isVerifyingUpi={isVerifyingUpi}
                                />
                            )}
                            {activeSubTab === 'documents' && <Documents currentUser={currentUser} />}
                            {activeSubTab === 'password' && (
                                <PasswordDetails
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    isSendingOtp={isSendingOtp}
                                    onVerifyEmail={handleSendOtp}
                                    showPasswords={showPasswords}
                                    setShowPasswords={setShowPasswords}
                                />
                            )}
                            {activeSubTab === 'settings' && <Settings formData={formData} handleInputChange={handleInputChange} handleSave={handleSave} />}
                            {activeSubTab === 'visiting_card' && (
                                <div className="flex flex-col items-center justify-center space-y-12 py-10">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Your Digital Identity</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Official RuPiKsha Partner Card</p>
                                    </div>

                                    {/* Premium Visiting Card */}
                                    <motion.div
                                        initial={{ rotateY: -20, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        className="w-full max-w-[450px] aspect-[45/26] bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative group"
                                    >
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-50 rounded-full -ml-16 -mb-16 blur-3xl opacity-50"></div>

                                        <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-50 flex items-center justify-center">
                                                        {profilePhoto ? (
                                                            <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="text-slate-300" size={30} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-800 leading-tight uppercase tracking-tight">{formData.name || currentUser?.name || 'Partner Name'}</h4>
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-0.5">Verified Retailer</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-blue-900 tracking-tighter italic uppercase leading-none">Rupiksha</div>
                                                    <div className="text-[7px] font-black text-blue-500 uppercase tracking-widest mt-0.5">Making Life Simple</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Building2 size={12} className="text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate">{formData.businessName || currentUser?.businessName || 'Business Name'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Smartphone size={12} className="text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600 tracking-tight">{formData.mobile || currentUser?.mobile || 'Mobile Number'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin size={12} className="text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate">{formData.address1 || 'Address not set'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <ShieldCheck size={12} className="text-emerald-500" />
                                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{formData.partyCode || currentUser?.partyCode || 'PENDING'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-5 pointer-events-none">
                                                <ScanFace size={150} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
                                        <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all">
                                            <Download size={16} />
                                            <span>Download Card</span>
                                        </button>
                                        <button className="bg-white text-slate-600 border border-slate-200 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center justify-center space-x-2 hover:bg-slate-50 transition-all">
                                            <Printer size={16} />
                                            <span>Print Receipt</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!['business', 'personal', 'additional', 'banking', 'upi', 'documents', 'password', 'settings', 'visiting_card'].includes(activeSubTab) && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-20 text-center">
                                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{activeSubTab} SECTION</h3>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            {/* Email Verification Modal */}
            <AnimatePresence>
                {showVerifyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowVerifyModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-8 text-center"
                        >
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                    <Mail size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Verify Your Email</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">We've sent a 6-digit code to</p>
                                <p className="text-sm font-black text-blue-600 mt-1">{formData.email}</p>
                            </div>

                            <div className="flex justify-between gap-2 mb-8">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val) {
                                                const newOtp = [...otp];
                                                newOtp[idx] = val;
                                                setOtp(newOtp);
                                                // Focus next
                                                const next = e.target.nextElementSibling;
                                                if (next) next.focus();
                                            } else {
                                                const newOtp = [...otp];
                                                newOtp[idx] = '';
                                                setOtp(newOtp);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[idx]) {
                                                const prev = e.target.previousElementSibling;
                                                if (prev) prev.focus();
                                            }
                                        }}
                                        className="w-12 h-14 border-2 border-slate-100 rounded-xl text-center text-xl font-black text-slate-700 focus:border-blue-600 focus:bg-blue-50 outline-none transition-all shadow-sm"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifying || otp.join('').length < 6}
                                    className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl hover:bg-blue-900 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isVerifying ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <RefreshCw size={18} className="animate-spin" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : 'Verify OTP'}
                                </button>

                                <div className="text-center">
                                    {timer > 0 ? (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Resend Code in <span className="text-blue-600">00:{timer < 10 ? `0${timer}` : timer}</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleSendOtp}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                        >
                                            Resend Verification Code
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 z-[100] bg-slate-900 text-white px-8 py-3 rounded-full border border-emerald-500 shadow-2xl flex items-center space-x-3"
                    >
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Profile Updated Successfully</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDetails;
