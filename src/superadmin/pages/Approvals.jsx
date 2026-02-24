import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, X, Building2, ShieldCheck,
    RefreshCcw, AlertTriangle, Megaphone, Copy,
    ArrowRight, Link2, Trash2, Eye, Users
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { sharedDataService } from '../../services/sharedDataService';
import { sendApprovalEmail } from '../../services/emailService';

const Approvals = () => {
    const [data, setData] = useState(dataService.getData());
    const [distributors, setDistributors] = useState(sharedDataService.getAllDistributors());
    const [superadmins, setSuperadmins] = useState(sharedDataService.getAllSuperAdmins());
    const [status, setStatus] = useState(null);

    // Retailer Approval State
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [approvalForm, setApprovalForm] = useState({ password: '', partyCode: '', distributorId: '' });

    // Distributor Approval State
    const [showDistApprovalModal, setShowDistApprovalModal] = useState(false);
    const [selectedDist, setSelectedDist] = useState(null);
    const [distApprovalForm, setDistApprovalForm] = useState({ password: '', distribId: '' });

    // SuperAdmin Approval State
    const [showSAApprovalModal, setShowSAApprovalModal] = useState(false);
    const [selectedSA, setSelectedSA] = useState(null);
    const [saApprovalForm, setSAApprovalForm] = useState({ password: '' });

    // Share Modal State
    const [showCredentialCard, setShowCredentialCard] = useState(false);
    const [credentialData, setCredentialData] = useState(null);

    const refreshData = () => {
        setData(dataService.getData());
        setDistributors(sharedDataService.getAllDistributors());
        setSuperadmins(sharedDataService.getAllSuperAdmins());
    };

    useEffect(() => {
        refreshData();
        window.addEventListener('distributorDataUpdated', refreshData);
        window.addEventListener('superadminDataUpdated', refreshData);
        return () => {
            window.removeEventListener('distributorDataUpdated', refreshData);
            window.removeEventListener('superadminDataUpdated', refreshData);
        };
    }, []);

    // ─── Retailer Approval Logic ───────────────────────────────────────
    const handleApproveClick = (user) => {
        const approvedDists = sharedDataService.getAllDistributors().filter(d => d.status === 'Approved');
        setSelectedUser(user);
        setApprovalForm({
            password: user.password || ('RT@' + Math.floor(1000 + Math.random() * 9000)),
            partyCode: user.partyCode || 'RT' + Math.floor(100000 + Math.random() * 900000),
            distributorId: user.ownerId || approvedDists[0]?.id || ''
        });
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        if (!approvalForm.password || !approvalForm.partyCode) {
            alert('Please provide password and party code.');
            return;
        }

        const targetUser = selectedUser;
        dataService.approveUser(targetUser.username, approvalForm.password, approvalForm.partyCode);

        // Assign to distributor if selected
        if (approvalForm.distributorId) {
            sharedDataService.assignRetailerToDistributor(approvalForm.distributorId, targetUser.username);
        }

        refreshData();
        setShowApprovalModal(false);

        const shareData = {
            name: targetUser.name || targetUser.mobile,
            mobile: targetUser.mobile,
            password: approvalForm.password,
            idLabel: 'Party Code',
            idValue: approvalForm.partyCode,
            portalType: 'Retailer',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        const result = await sendApprovalEmail({
            to: targetUser.email,
            name: shareData.name,
            loginId: shareData.mobile,
            password: shareData.password,
            idLabel: shareData.idLabel,
            idValue: shareData.idValue,
            portalType: shareData.portalType
        });

        setCredentialData(prev => ({
            ...prev,
            emailStatus: result.success ? 'sent' : 'failed',
            error: result.success ? null : result.message
        }));
    };

    const handleRejectUser = (username) => {
        if (window.confirm(`Are you sure you want to reject user ${username}?`)) {
            dataService.rejectUser(username);
            refreshData();
            setStatus({ type: 'error', message: 'User rejected.' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    // ─── Distributor Approval Logic ────────────────────────────────────
    const handleDistApproveClick = (dist) => {
        setSelectedDist(dist);
        setDistApprovalForm({
            password: 'Dist@' + Math.floor(1000 + Math.random() * 9000),
            distribId: dist.id
        });
        setShowDistApprovalModal(true);
    };

    const submitDistApproval = async () => {
        if (!distApprovalForm.password) {
            alert('Please set a login password.');
            return;
        }

        const targetDist = selectedDist;
        sharedDataService.approveDistributor(targetDist.id, distApprovalForm.password, distApprovalForm.distribId);
        refreshData();
        setShowDistApprovalModal(false);

        const shareData = {
            name: targetDist.name,
            mobile: targetDist.mobile,
            password: distApprovalForm.password,
            idLabel: 'Distributor ID',
            idValue: distApprovalForm.distribId,
            portalType: 'Distributor',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        const result = await sendApprovalEmail({
            to: targetDist.email,
            name: shareData.name,
            loginId: shareData.mobile,
            password: shareData.password,
            idLabel: shareData.idLabel,
            idValue: shareData.idValue,
            portalType: shareData.portalType
        });

        setCredentialData(prev => ({
            ...prev,
            emailStatus: result.success ? 'sent' : 'failed',
            error: result.success ? null : result.message
        }));
    };

    const handleRejectDist = (id) => {
        if (window.confirm('Reject this distributor registration?')) {
            sharedDataService.rejectDistributor(id);
            refreshData();
            setStatus({ type: 'error', message: 'Distributor rejected.' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    // ─── SuperAdmin Approval Logic ────────────────────────────────────
    const handleSAApproveClick = (sa) => {
        setSelectedSA(sa);
        setSAApprovalForm({
            password: 'SA@' + Math.floor(1000 + Math.random() * 9000)
        });
        setShowSAApprovalModal(true);
    };

    const submitSAApproval = async () => {
        if (!saApprovalForm.password) {
            alert('Please set a password.');
            return;
        }

        const targetSA = selectedSA;
        sharedDataService.approveSuperAdmin(targetSA.id, saApprovalForm.password);
        refreshData();
        setShowSAApprovalModal(false);

        const shareData = {
            name: targetSA.name,
            mobile: targetSA.mobile,
            password: saApprovalForm.password,
            idLabel: 'SuperAdmin ID',
            idValue: targetSA.id,
            portalType: 'SuperAdmin',
            url: window.location.origin,
            emailStatus: 'sending'
        };

        setCredentialData(shareData);
        setShowCredentialCard(true);

        const result = await sendApprovalEmail({
            to: targetSA.email,
            name: shareData.name,
            loginId: shareData.mobile,
            password: shareData.password,
            idLabel: shareData.idLabel,
            idValue: shareData.idValue,
            portalType: shareData.portalType
        });

        setCredentialData(prev => ({
            ...prev,
            emailStatus: result.success ? 'sent' : 'failed',
            error: result.success ? null : result.message
        }));
    };

    const handleRejectSA = (id) => {
        if (window.confirm('Reject this SuperAdmin application?')) {
            sharedDataService.rejectSuperAdmin(id);
            refreshData();
            setStatus({ type: 'error', message: 'SuperAdmin rejected.' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    // ─── Components ───────────────────────────────────────────────────
    const CredentialSharerModal = () => {
        if (!credentialData) return null;

        const shareText = `*RUPIKSHA FINTECH APPROVAL* 🚀\n\n` +
            `Hello *${credentialData.name}*,\n` +
            `Aapka *${credentialData.portalType}* account approve ho gaya hai.\n\n` +
            `*Login Details:*\n` +
            `• ID: ${credentialData.mobile}\n` +
            `• Password: ${credentialData.password}\n` +
            `• ${credentialData.idLabel}: ${credentialData.idValue}\n\n` +
            `Login here: ${credentialData.url}\n\n` +
            `_Team RUPIKSHA_`;

        const copyAll = () => {
            navigator.clipboard.writeText(shareText);
            alert('Credentials Copied!');
        };

        const shareWA = () => {
            const url = `https://wa.me/91${credentialData.mobile}?text=${encodeURIComponent(shareText)}`;
            window.open(url, '_blank');
        };

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border border-slate-200 text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 relative">
                        {credentialData.emailStatus === 'sending' ? (
                            <RefreshCcw size={32} className="animate-spin text-amber-500" />
                        ) : credentialData.emailStatus === 'sent' ? (
                            <CheckCircle2 size={40} />
                        ) : (
                            <AlertTriangle size={40} className="text-red-500" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            {credentialData.emailStatus === 'sending' ? 'Sending Email...' :
                                credentialData.emailStatus === 'sent' ? 'Email Sent! ✅' : 'Email Failed ❌'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {credentialData.emailStatus === 'failed' ? credentialData.error : 'Sharing credentials with user'}
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{credentialData.portalType} ID</span>
                            <span className="text-xs font-black text-slate-800">{credentialData.idValue}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-tight">Mobile :</span>
                            <span className="font-black text-slate-700">{credentialData.mobile}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-tight">Pass :</span>
                            <span className="font-black text-slate-700">{credentialData.password}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={shareWA} className="w-full bg-[#25D366] text-white font-black py-4 rounded-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
                            <Megaphone size={16} /> Share on WhatsApp
                        </button>
                        <button onClick={copyAll} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
                            <Copy size={16} /> Copy Details
                        </button>
                    </div>

                    <button onClick={() => setShowCredentialCard(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600">Close Window</button>
                </motion.div>
            </div>
        );
    };

    const pendingUsers = (data.users || []).filter(u => u.status === 'Pending');
    const pendingDists = (distributors || []).filter(d => d.status === 'Pending');
    const pendingSAs = (superadmins || []).filter(s => s.status === 'Pending');

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {showApprovalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Approve Retailer</h3>
                            <button onClick={() => setShowApprovalModal(false)} className="text-slate-400"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Retailer</label>
                                <p className="p-3 bg-slate-50 rounded-lg font-bold text-slate-700">{selectedUser?.name || selectedUser?.mobile}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold" value={approvalForm.password} onChange={e => setApprovalForm({ ...approvalForm, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Party Code</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold" value={approvalForm.partyCode} onChange={e => setApprovalForm({ ...approvalForm, partyCode: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assign Distributor</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border rounded-lg font-bold text-slate-700"
                                    value={approvalForm.distributorId}
                                    onChange={e => setApprovalForm({ ...approvalForm, distributorId: e.target.value })}
                                >
                                    <option value="">No Distributor (Direct)</option>
                                    {distributors.filter(d => d.status === 'Approved').map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={submitApproval} className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs">Confirm Approval</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showDistApprovalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Approve Distributor</h3>
                            <button onClick={() => setShowDistApprovalModal(false)} className="text-slate-400"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Business</label>
                                <p className="p-3 bg-slate-50 rounded-lg font-bold text-amber-800">{selectedDist?.businessName}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Distributor ID</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold" value={distApprovalForm.distribId} onChange={e => setDistApprovalForm({ ...distApprovalForm, distribId: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold" value={distApprovalForm.password} onChange={e => setDistApprovalForm({ ...distApprovalForm, password: e.target.value })} />
                            </div>
                            <button onClick={submitDistApproval} className="w-full bg-amber-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs">Confirm Approval</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showSAApprovalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Approve SuperAdmin</h3>
                            <button onClick={() => setShowSAApprovalModal(false)} className="text-slate-400"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">User</label>
                                <p className="p-3 bg-slate-50 rounded-lg font-bold text-indigo-800">{selectedSA?.name || selectedSA?.mobile}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg font-mono font-bold" value={saApprovalForm.password} onChange={e => setSAApprovalForm({ ...saApprovalForm, password: e.target.value })} />
                            </div>
                            <button onClick={submitSAApproval} className="w-full bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs">Confirm Approval</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showCredentialCard && <CredentialSharerModal />}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Pending Approvals</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Review new registrations</p>
                </div>
                {status && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-widest ${status.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        {status.message}
                    </motion.div>
                )}
            </div>

            {/* Pending SuperAdmins */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-indigo-50/30">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-indigo-500" />
                        SuperAdmin Requests
                    </h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black">{pendingSAs.length} PENDING</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingSAs.map((sa, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{sa.name}</div>
                                        <div className="text-[10px] text-indigo-600 font-black uppercase">{sa.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                        {sa.mobile}<br />{sa.email}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">
                                        {sa.businessName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleSAApproveClick(sa)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                            <button onClick={() => handleRejectSA(sa.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pendingSAs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-300 font-bold italic">
                                        No pending superadmin requests.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Retailers */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-emerald-50/30">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Users size={18} className="text-emerald-500" />
                        Retailer Requests
                    </h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">{pendingUsers.length} PENDING</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Retailer</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingUsers.map((user, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{user.name || 'UNNAMED'}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{user.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{user.state}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleApproveClick(user)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                            <button onClick={() => handleRejectUser(user.username)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pendingUsers.length === 0 && (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic">No pending retailer requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Distributors */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-amber-50/30">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Building2 size={18} className="text-amber-500" />
                        Distributor Requests
                    </h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">{pendingDists.length} PENDING</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingDists.map((d, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{d.businessName}</div>
                                        <div className="text-[10px] text-amber-600 font-black uppercase">{d.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                        {d.mobile}<br />{d.email}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">
                                        {d.city}, {d.state}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleDistApproveClick(d)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><ShieldCheck size={18} /></button>
                                            <button onClick={() => handleRejectDist(d.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pendingDists.length === 0 && (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic">No pending distributor requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Approvals;
