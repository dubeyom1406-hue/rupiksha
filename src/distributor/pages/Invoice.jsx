import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, Calendar } from 'lucide-react';

const generateInvoices = () => Array.from({ length: 10 }, (_, i) => ({
    invoiceNo: `INV-2024-${String(i + 1).padStart(4, '0')}`,
    date: new Date(Date.now() - i * 86400000 * 15).toLocaleDateString('en-IN'),
    period: `${new Date(Date.now() - i * 86400000 * 15).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    amount: (Math.random() * 50000 + 5000).toFixed(2),
    gst: (Math.random() * 5000 + 500).toFixed(2),
    status: i === 0 ? 'Unpaid' : 'Paid',
}));

const Invoice = () => {
    const [invoices] = useState(generateInvoices);
    const [selected, setSelected] = useState(null);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FileText size={20} className="text-amber-500" /> Invoice
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Your billing history and invoices</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['Invoice No.', 'Date', 'Period', 'Amount', 'GST (18%)', 'Total', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoices.map((inv, i) => (
                                <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                    <td className="px-5 py-3.5 text-[10px] font-black text-amber-600">{inv.invoiceNo}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{inv.date}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-600">{inv.period}</td>
                                    <td className="px-5 py-3.5 text-xs font-black text-slate-700">₹ {parseFloat(inv.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-5 py-3.5 text-xs font-bold text-slate-500">₹ {parseFloat(inv.gst).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-5 py-3.5 text-xs font-black text-slate-800">₹ {(parseFloat(inv.amount) + parseFloat(inv.gst)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase
                                            ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 flex gap-2">
                                        <button onClick={() => setSelected(inv)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Printer size={13} /></button>
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Download size={13} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Preview Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0d1b2e] to-[#1e3a6e] p-6 text-white flex justify-between items-center">
                            <div>
                                <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest">RUPIKSHA Financial Services</p>
                                <h2 className="text-lg font-black mt-1">TAX INVOICE</h2>
                                <p className="text-slate-400 text-[10px] font-bold">{selected.invoiceNo} • {selected.date}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-xl font-black">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-6 text-xs">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill To</p>
                                    <p className="font-black text-slate-800">Your Business Name</p>
                                    <p className="text-slate-500">GSTIN: 09AABCU9603R1ZR</p>
                                    <p className="text-slate-500">State: Uttar Pradesh</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice Details</p>
                                    <p className="font-black text-amber-600">{selected.invoiceNo}</p>
                                    <p className="text-slate-500">Date: {selected.date}</p>
                                    <p className="text-slate-500">Period: {selected.period}</p>
                                </div>
                            </div>
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead><tr className="bg-slate-50">
                                        <th className="px-4 py-2 text-left font-black text-slate-400 text-[9px] uppercase">Description</th>
                                        <th className="px-4 py-2 text-right font-black text-slate-400 text-[9px] uppercase">Amount</th>
                                    </tr></thead>
                                    <tbody>
                                        <tr className="border-t border-slate-50"><td className="px-4 py-2.5 font-bold text-slate-600">Distributor Platform Fee — {selected.period}</td><td className="px-4 py-2.5 text-right font-black text-slate-700">₹ {parseFloat(selected.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td></tr>
                                        <tr className="border-t border-slate-50"><td className="px-4 py-2.5 font-bold text-slate-500">GST @ 18%</td><td className="px-4 py-2.5 text-right font-bold text-slate-500">₹ {parseFloat(selected.gst).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td></tr>
                                        <tr className="border-t-2 border-amber-200 bg-amber-50"><td className="px-4 py-3 font-black text-slate-800 uppercase text-[10px] tracking-wider">Total Due</td><td className="px-4 py-3 text-right font-black text-amber-600 text-sm">₹ {(parseFloat(selected.amount) + parseFloat(selected.gst)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-amber-400 transition-all">
                                    <Printer size={13} /> Print
                                </button>
                                <button onClick={() => setSelected(null)} className="flex-1 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-slate-50 transition-all">Close</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Invoice;
