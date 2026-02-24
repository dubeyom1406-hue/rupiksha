import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, ChevronDown } from 'lucide-react';

const RetailerEKYC = () => {
    const [selectedBank, setSelectedBank] = useState('P-1');
    const [aadhaar, setAadhaar] = useState('');
    const [device, setDevice] = useState('');

    const devices = [
        "Select Device",
        "Morpho MSO1300",
        "MORPHO L1",
        "Mantra MFS100",
        "MANTRA L1",
        "SECUGEN",
        "3M",
        "TATVIK",
        "PB510",
        "PB1000 L1",
        "Blue Print",
        "Aratek",
        "Identi5",
        "Identi5 L1"
    ];

    return (
        <div className="min-h-full flex items-center justify-center bg-gray-50 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl border border-gray-200"
            >
                <h1 className="text-xl font-bold text-[#1e3a8a] text-center mb-8">Please complete your biometric KYC</h1>

                <div className="space-y-6">
                    {/* Bank Selection */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-bold text-gray-600 min-w-[100px]">Select bank:</label>
                        <div className="flex items-center gap-6">
                            {['P-1', 'P-3', 'P-4'].map((bank) => (
                                <label key={bank} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="bank"
                                        value={bank}
                                        checked={selectedBank === bank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">{bank}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Remark */}
                    <div className="flex justify-center">
                        <p className="text-sm text-[#1e3a8a] font-medium">
                            Remark : Bio Auth 1 - eKYC for merchant activation [ Onboarding complete]
                        </p>
                    </div>

                    {/* Aadhaar and Device Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 font-medium">Aadhaar Number</label>
                            <input
                                type="text"
                                value={aadhaar}
                                onChange={(e) => setAadhaar(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-600 transition-colors text-sm"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm text-gray-600 font-medium">Select Device</label>
                            <div className="relative">
                                <select
                                    value={device}
                                    onChange={(e) => setDevice(e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none cursor-pointer"
                                >
                                    {devices.map((dev, idx) => (
                                        <option key={idx} value={dev}>{dev}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Capture Button */}
                    <div className="pt-6">
                        <button className="bg-[#6b7280] hover:bg-[#4b5563] text-white font-bold py-2.5 px-8 rounded-full shadow-md transition-all active:scale-95 text-sm flex items-center gap-2">
                            Capture
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RetailerEKYC;
