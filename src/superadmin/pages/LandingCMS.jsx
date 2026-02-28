import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Type, BarChart2, Zap, Star, Phone, Eye, EyeOff,
    Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
    CheckCircle2, Globe, Edit3, ToggleLeft, ToggleRight,
    Palette, AlignLeft, Settings, Image as ImageIcon,
    ExternalLink, Sparkles, Wand2, ShieldCheck, Mail, MapPin,
    AlertTriangle, Send, RefreshCw, Layers, Monitor, Target
} from 'lucide-react';
import { landingContentService } from '../../services/landingContentService';

const Rocket = ({ size, style }) => <Layers size={size} style={style} />;

const SECTION_ICONS = {
    hero: Layout, stats: BarChart2, services: Zap,
    how_it_works: Star, advantages: Star, features: Star,
    contact: Phone, company: Globe, navbar: Layout,
};

const SectionHeader = ({ icon: Icon, title, color, expanded, onToggle, badge }) => (
    <button onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all active:scale-[0.99] group/header">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/header:rotate-12" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `1px solid ${color}44` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div className="text-left">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em] italic">{title}</h4>
                {badge && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">{badge}</p>}
            </div>
        </div>
        <div className={`p-2 rounded-xl transition-all ${expanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover/header:bg-slate-200'}`}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
    </button>
);

const Field = ({ label, value, onChange, type = 'text', hint, multiline = false, icon: Icon }) => (
    <div className="space-y-2 group/field">
        <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within/field:text-indigo-500 transition-colors">
                {Icon && <Icon size={12} />} {label}
            </label>
        </div>
        {multiline ? (
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none shadow-sm placeholder:text-slate-300"
                placeholder={`Enter ${label.toLowerCase()}...`} />
        ) : (
            <div className="relative">
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm placeholder:text-slate-300"
                    placeholder={`Enter ${label.toLowerCase()}...`} />
                {type === 'color' && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg pointer-events-none border border-white shadow-sm" style={{ background: value }} />}
            </div>
        )}
        {hint && <p className="text-[9px] text-slate-400 font-bold italic tracking-wide">{hint}</p>}
    </div>
);

const Toggle = ({ label, value, onChange }) => (
    <button onClick={() => onChange(!value)}
        className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${value ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
        <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${value ? 'text-emerald-700' : 'text-slate-500'}`}>{label}</span>
        <div className={`w-10 h-6 rounded-full relative transition-all shadow-inner ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${value ? 'left-5' : 'left-1'}`} />
        </div>
    </button>
);

export default function LandingCMS() {
    const [content, setContent] = useState(landingContentService.get());
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expanded, setExpanded] = useState({ hero: true });

    const toggle = (section) => setExpanded(p => ({ ...p, [section]: !p[section] }));

    const update = (path, value) => {
        setContent(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
            obj[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    const updateArrayItem = (arrayPath, index, field, value) => {
        setContent(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const keys = arrayPath.split('.');
            let obj = updated;
            for (const k of keys) obj = obj[k];
            obj[index][field] = value;
            return updated;
        });
    };

    const addArrayItem = (arrayPath, template) => {
        setContent(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const keys = arrayPath.split('.');
            let obj = updated;
            for (const k of keys) obj = obj[k];
            obj.push({ ...template });
            return updated;
        });
    };

    const removeArrayItem = (arrayPath, index) => {
        setContent(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const keys = arrayPath.split('.');
            let obj = updated;
            for (const k of keys) obj = obj[k];
            obj.splice(index, 1);
            return updated;
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            landingContentService.save(content);
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1200);
    };

    const handleReset = () => {
        if (window.confirm('WARNING: IRREVERSIBLE ACTION\nReset all website content to core factory defaults?')) {
            landingContentService.reset();
            setContent(landingContentService.get());
        }
    };

    const SECTIONS = [
        { id: 'hero', label: 'Launch_Sequence', icon: Rocket, color: '#6366f1', badge: 'HERO MODULE CONTROL' },
        { id: 'stats', label: 'Network_Metrix', icon: BarChart2, color: '#10b981', badge: `${content.stats.length} STATS OPERATIONAL` },
        { id: 'services', label: 'Service_Nodes', icon: Zap, color: '#f59e0b', badge: `${Object.values(content.services_visibility).filter(Boolean).length} NODES VISIBLE` },
        { id: 'how', label: 'Ops_Protocol', icon: Target, color: '#8b5cf6', badge: `${content.how.length} STEPS DEFINED` },
        { id: 'advantages', label: 'Core_Values', icon: ShieldCheck, color: '#ef4444', badge: `${content.advantages.length} PROPOSITIONS` },
        { id: 'features', label: 'System_Assets', icon: Layers, color: '#06b6d4', badge: `${content.features.length} FEATURES ENABLED` },
        { id: 'contact', label: 'Intel_Channels', icon: Phone, color: '#0ea5e9', badge: 'COMMS DATASET' },
        { id: 'company', label: 'Entity_Specs', icon: Globe, color: '#64748b', badge: 'LEGAL REGISTRY' },
        { id: 'sections', label: 'Grid_Visibility', icon: Monitor, color: '#f97316', badge: 'GLOBAL VISIBILITY TOGGLES' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-24">
            {/* ── CENTRAL CONTROL HEADER ───────────────────────────────────── */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0d1117] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between border border-white/[0.08] shadow-2xl overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-6">
                            <Wand2 size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white italic uppercase tracking-[0.2em] leading-none mb-2">Web_Commander</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.3em] opacity-80">Rupiksha_CMS v4.0 • Live Transmission Enabled</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-8 md:mt-0 relative z-10">
                        <button onClick={() => window.open('/', '_blank')}
                            className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/[0.08] hover:bg-white/10 hover:text-white transition-all group/btn"
                            title="Preview Site"
                        >
                            <ExternalLink size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button onClick={handleReset}
                            className="p-4 bg-white/5 text-rose-400/70 rounded-2xl border border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                            title="Reset Grid"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button onClick={handleSave} disabled={isSaving}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all relative overflow-hidden group/save ${saved ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 shadow-2xl hover:translate-y-[-2px] active:translate-y-[0px]'}`}>
                            {isSaving ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : saved ? (
                                <CheckCircle2 size={16} />
                            ) : (
                                <Save size={16} className="group-hover/save:scale-110 transition-transform" />
                            )}
                            {isSaving ? 'Synchronizing...' : saved ? 'Deployed!' : 'Push Changes'}
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-1000" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── MODULE CARDS ─────────────────────────────────────────────── */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {SECTIONS.map((sec, idx) => (
                        <motion.div key={sec.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                            className={`bg-white rounded-[2.5rem] shadow-xl border overflow-hidden transition-all duration-500 ${expanded[sec.id] ? 'border-indigo-100 ring-4 ring-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 shadow-slate-200/50'}`}>
                            <SectionHeader icon={sec.icon} title={sec.label} color={sec.color}
                                badge={sec.badge} expanded={!!expanded[sec.id]} onToggle={() => toggle(sec.id)} />
                            <AnimatePresence>
                                {expanded[sec.id] && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50/30">
                                        <div className="border-t border-slate-100 p-8 md:p-10 space-y-10">

                                            {/* ── HERO ── */}
                                            {sec.id === 'hero' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Field label="Protocol Badge" value={content.hero.badge} onChange={v => update('hero.badge', v)} icon={Sparkles} hint="Accent text displayed above the main headline" />
                                                    <Field label="Primary Command" value={content.hero.cta_primary} onChange={v => update('hero.cta_primary', v)} icon={Send} />
                                                    <div className="md:col-span-2">
                                                        <Field label="Executive Headline (HTML Allowed)" value={content.hero.headline} onChange={v => update('hero.headline', v)} multiline icon={Type} hint='Embed styles for emphasis: <span style="background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; color: transparent;">Your Text</span>' />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Field label="System Brief (Sub-headline)" value={content.hero.subheadline} onChange={v => update('hero.subheadline', v)} multiline icon={AlignLeft} />
                                                    </div>
                                                    <Field label="Secondary Command" value={content.hero.cta_secondary} onChange={v => update('hero.cta_secondary', v)} icon={Zap} />
                                                    <Field label="Global Announcement" value={content.hero.announcement} onChange={v => update('hero.announcement', v)} icon={ShieldCheck} hint="Text appearing in the global notification strip" />
                                                </div>
                                            )}

                                            {/* ── STATS ── */}
                                            {sec.id === 'stats' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {content.stats.map((stat, i) => (
                                                            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative group/stat hover:border-emerald-300 transition-all hover:shadow-emerald-500/5">
                                                                <button onClick={() => removeArrayItem('stats', i)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="col-span-2">
                                                                        <Field label={`DATA_STREAM_0${i + 1}`} value={stat.label} onChange={v => updateArrayItem('stats', i, 'label', v)} />
                                                                    </div>
                                                                    <Field label="Value" value={stat.num} onChange={v => updateArrayItem('stats', i, 'num', v)} />
                                                                    <Field label="Suffix" value={stat.suffix} onChange={v => updateArrayItem('stats', i, 'suffix', v)} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => addArrayItem('stats', { num: '100', label: 'New Metric', suffix: '+', prefix: '' })}
                                                        className="w-full flex items-center justify-center gap-3 py-6 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-500 transition-all group/add">
                                                        <Plus size={18} className="group-hover/add:rotate-90 transition-transform" /> Connect_New_Data_Node
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── SERVICES ── */}
                                            {sec.id === 'services' && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {Object.entries(content.services_visibility).map(([name, visible]) => (
                                                        <Toggle key={name} label={name} value={visible}
                                                            onChange={v => update(`services_visibility.${name}`, v)} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* ── OPS PROTOCOL (How It Works) ── */}
                                            {sec.id === 'how' && (
                                                <div className="space-y-6 pr-4">
                                                    {content.how.map((step, i) => (
                                                        <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative hover:border-indigo-200 transition-all group/item">
                                                            <div className="absolute -left-3 top-8 w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-black italic shadow-xl shadow-slate-900/20 group-hover/item:scale-110 transition-transform">
                                                                {step.step}
                                                            </div>
                                                            <button onClick={() => removeArrayItem('how', i)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                                                <Field label="Protocol_Title" value={step.title} onChange={v => updateArrayItem('how', i, 'title', v)} />
                                                                <Field label="Color_Coding" value={step.color} type="color" onChange={v => updateArrayItem('how', i, 'color', v)} />
                                                                <div className="md:col-span-2">
                                                                    <Field label="Execution_Parameters" value={step.desc} onChange={v => updateArrayItem('how', i, 'desc', v)} multiline />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addArrayItem('how', { step: `0${content.how.length + 1}`, color: '#6366f1', title: 'New Protocol', desc: 'Initialize data sequence...' })}
                                                        className="w-full flex items-center justify-center gap-3 py-6 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all">
                                                        <Plus size={18} /> Append_New_Sequence
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── CORE VALUES ── */}
                                            {sec.id === 'advantages' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {content.advantages.map((adv, i) => (
                                                        <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative hover:shadow-xl transition-all group/adv">
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-slate-50 group-hover/adv:rotate-6 transition-transform">
                                                                    {adv.icon}
                                                                </div>
                                                                <button onClick={() => removeArrayItem('advantages', i)} className="p-2 text-slate-200 hover:text-rose-500 transition-all">
                                                                    <X size={20} />
                                                                </button>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <Field label="Value_Descriptor" value={adv.title} onChange={v => updateArrayItem('advantages', i, 'title', v)} />
                                                                <Field label="Logic_Summary" value={adv.desc} onChange={v => updateArrayItem('advantages', i, 'desc', v)} multiline />
                                                                <Field label="Interface_Accent" value={adv.color} type="color" onChange={v => updateArrayItem('advantages', i, 'color', v)} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addArrayItem('advantages', { icon: '💎', title: 'Absolute Integrity', desc: 'Immutable trust protocols...', color: '#10b981' })}
                                                        className="md:col-span-2 flex items-center justify-center gap-3 py-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all">
                                                        <Plus size={24} /> Inject_New_Proposition
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── CONTACT & COMPANY ── */}
                                            {(sec.id === 'contact' || sec.id === 'company') && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {sec.id === 'contact' ? (
                                                        <>
                                                            <Field label="Support_Voice" value={content.contact.phone} onChange={v => update('contact.phone', v)} icon={Phone} />
                                                            <Field label="Secure_Mailbox" value={content.contact.email} onChange={v => update('contact.email', v)} icon={Mail} />
                                                            <Field label="Instant_Bridge" value={content.contact.whatsapp} onChange={v => update('contact.whatsapp', v)} icon={MessageCircle} />
                                                            <div className="md:col-span-2">
                                                                <Field label="Command_Center_Location" value={content.contact.address} onChange={v => update('contact.address', v)} multiline icon={MapPin} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Field label="Entity_Signature" value={content.company.name} onChange={v => update('company.name', v)} icon={Building2} />
                                                            <Field label="Core_Tagline" value={content.company.tagline} onChange={v => update('company.tagline', v)} icon={Sparkles} />
                                                            <Field label="Epoch_Identifier" value={content.company.founded} onChange={v => update('company.founded', v)} icon={Target} />
                                                            <Field label="Tax_Identity (GST)" value={content.company.gstin} onChange={v => update('company.gstin', v)} icon={ShieldCheck} />
                                                            <div className="md:col-span-2">
                                                                <Field label="Corporate_Registry (CIN)" value={content.company.cin} onChange={v => update('company.cin', v)} icon={Layers} />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── VISIBILITY GRID ── */}
                                            {sec.id === 'sections' && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                    {Object.entries(content.sections).map(([name, visible]) => (
                                                        <Toggle key={name} label={name.replace(/_/g, ' ')} value={visible}
                                                            onChange={v => update(`sections.${name}`, v)} />
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Floating Banner */}
            <AnimatePresence>
                {saved && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="pr-4 border-r border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System_Sync_Finished</p>
                            <p className="text-sm font-bold">Rupiksha.in updated successfully.</p>
                        </div>
                        <button onClick={() => setSaved(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const MessageCircle = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
);
