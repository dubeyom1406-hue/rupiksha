import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Type, BarChart2, Zap, Star, Phone, Eye, EyeOff,
    Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
    CheckCircle2, Globe, Edit3, ToggleLeft, ToggleRight,
    Palette, AlignLeft, Settings, Image as ImageIcon
} from 'lucide-react';
import { landingContentService } from '../../services/landingContentService';

const SECTION_ICONS = {
    hero: Layout, stats: BarChart2, services: Zap,
    how_it_works: Star, advantages: Star, features: Star,
    contact: Phone, company: Globe, navbar: Layout,
};

function SectionHeader({ icon: Icon, title, color, expanded, onToggle, badge }) {
    return (
        <button onClick={onToggle}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={16} style={{ color }} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{title}</p>
                    {badge && <p className="text-[10px] text-slate-400 font-medium">{badge}</p>}
                </div>
            </div>
            {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
    );
}

function Field({ label, value, onChange, type = 'text', hint, multiline = false }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            {multiline ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-400 transition-all resize-none" />
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-400 transition-all" />
            )}
            {hint && <p className="text-[9px] text-slate-400">{hint}</p>}
        </div>
    );
}

function Toggle({ label, value, onChange }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <button onClick={() => onChange(!value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {value ? <><ToggleRight size={14} /> Visible</> : <><ToggleLeft size={14} /> Hidden</>}
            </button>
        </div>
    );
}

export default function LandingCMS() {
    const [content, setContent] = useState(landingContentService.get());
    const [saved, setSaved] = useState(false);
    const [expanded, setExpanded] = useState({ hero: true });
    const [activePreview, setActivePreview] = useState(false);

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
        landingContentService.save(content);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Reset all content to defaults? This cannot be undone.')) {
            landingContentService.reset();
            setContent(landingContentService.get());
        }
    };

    const SECTIONS = [
        { id: 'hero', label: 'Hero Section', icon: Layout, color: '#6366f1', badge: 'Headline, CTA, Badge' },
        { id: 'stats', label: 'Stats Bar', icon: BarChart2, color: '#10b981', badge: `${content.stats.length} counters` },
        { id: 'services', label: 'Services Visibility', icon: Zap, color: '#f59e0b', badge: `${Object.values(content.services_visibility).filter(Boolean).length} visible` },
        { id: 'how', label: 'How It Works', icon: Star, color: '#8b5cf6', badge: `${content.how.length} steps` },
        { id: 'advantages', label: 'Why Choose Us', icon: Star, color: '#ef4444', badge: `${content.advantages.length} cards` },
        { id: 'features', label: 'Key Features', icon: Star, color: '#06b6d4', badge: `${content.features.length} items` },
        { id: 'contact', label: 'Contact Info', icon: Phone, color: '#0ea5e9', badge: 'Phone, Email, Address' },
        { id: 'company', label: 'Company Info', icon: Globe, color: '#64748b', badge: 'Name, CIN, GSTIN' },
        { id: 'sections', label: 'Section Visibility', icon: Eye, color: '#f97316', badge: 'Show/Hide entire sections' },
    ];

    return (
        <div className="space-y-4 font-['Inter',sans-serif]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                        <Edit3 size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-white uppercase tracking-widest">Landing Page CMS</h1>
                        <p className="text-xs text-slate-400">Control every element of rupiksha.in</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/" target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-wide px-3 py-2 rounded-xl hover:bg-white/20 transition-all">
                        <Eye size={13} /> Preview
                    </a>
                    <button onClick={handleReset}
                        className="flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-wide px-3 py-2 rounded-xl hover:bg-red-500/20 transition-all">
                        <RotateCcw size={13} /> Reset
                    </button>
                    <button onClick={handleSave}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-wide px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all">
                        {saved ? <><CheckCircle2 size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
                    </button>
                </div>
            </div>

            {/* Save banner */}
            <AnimatePresence>
                {saved && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold">
                        <CheckCircle2 size={16} /> Landing page updated! Changes are live on your website.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sections */}
            <div className="space-y-3">
                {SECTIONS.map(sec => (
                    <div key={sec.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <SectionHeader icon={sec.icon} title={sec.label} color={sec.color}
                            badge={sec.badge} expanded={!!expanded[sec.id]} onToggle={() => toggle(sec.id)} />
                        <AnimatePresence>
                            {expanded[sec.id] && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="border-t border-slate-100 p-5 space-y-4">

                                        {/* ── HERO ── */}
                                        {sec.id === 'hero' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Field label="Top Badge Text" value={content.hero.badge} onChange={v => update('hero.badge', v)} hint="Small badge above headline (e.g. 🇮🇳 India's Most Trusted...)" />
                                                <Field label="Primary CTA Button" value={content.hero.cta_primary} onChange={v => update('hero.cta_primary', v)} />
                                                <Field label="Headline (HTML allowed)" value={content.hero.headline} onChange={v => update('hero.headline', v)} multiline hint='Use <span style="color:#22d3ee">text</span> for highlights' />
                                                <Field label="Sub-headline" value={content.hero.subheadline} onChange={v => update('hero.subheadline', v)} multiline />
                                                <Field label="Secondary CTA Button" value={content.hero.cta_secondary} onChange={v => update('hero.cta_secondary', v)} />
                                                <Field label="Announcement Banner" value={content.hero.announcement} onChange={v => update('hero.announcement', v)} hint="Text shown in top announcement bar" />
                                            </div>
                                        )}

                                        {/* ── STATS ── */}
                                        {sec.id === 'stats' && (
                                            <div className="space-y-3">
                                                {content.stats.map((stat, i) => (
                                                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Counter #{i + 1}</span>
                                                            <button onClick={() => removeArrayItem('stats', i)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <Field label="Number" value={stat.num} onChange={v => updateArrayItem('stats', i, 'num', v)} hint="e.g. 50K or 99.9" />
                                                            <Field label="Label" value={stat.label} onChange={v => updateArrayItem('stats', i, 'label', v)} />
                                                            <Field label="Prefix" value={stat.prefix} onChange={v => updateArrayItem('stats', i, 'prefix', v)} hint="e.g. ₹" />
                                                            <Field label="Suffix" value={stat.suffix} onChange={v => updateArrayItem('stats', i, 'suffix', v)} hint="e.g. Cr+ or %" />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => addArrayItem('stats', { num: '0', label: 'New Stat', suffix: '+', prefix: '' })}
                                                    className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wide w-full justify-center py-3 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all">
                                                    <Plus size={14} /> Add Counter
                                                </button>
                                            </div>
                                        )}

                                        {/* ── SERVICES VISIBILITY ── */}
                                        {sec.id === 'services' && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {Object.entries(content.services_visibility).map(([name, visible]) => (
                                                    <Toggle key={name} label={name} value={visible}
                                                        onChange={v => update(`services_visibility.${name}`, v)} />
                                                ))}
                                            </div>
                                        )}

                                        {/* ── HOW IT WORKS ── */}
                                        {sec.id === 'how' && (
                                            <div className="space-y-3">
                                                {content.how.map((step, i) => (
                                                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Step {step.step}</span>
                                                            <button onClick={() => removeArrayItem('how', i)} className="text-rose-400 hover:text-rose-600">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <Field label="Step Number" value={step.step} onChange={v => updateArrayItem('how', i, 'step', v)} />
                                                            <Field label="Title" value={step.title} onChange={v => updateArrayItem('how', i, 'title', v)} />
                                                            <Field label="Color" value={step.color} type="color" onChange={v => updateArrayItem('how', i, 'color', v)} />
                                                            <div className="md:col-span-3">
                                                                <Field label="Description" value={step.desc} onChange={v => updateArrayItem('how', i, 'desc', v)} multiline />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => addArrayItem('how', { step: `0${content.how.length + 1}`, color: '#6366f1', title: 'New Step', desc: 'Description here.' })}
                                                    className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wide w-full justify-center py-3 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-50 transition-all">
                                                    <Plus size={14} /> Add Step
                                                </button>
                                            </div>
                                        )}

                                        {/* ── WHY CHOOSE US ── */}
                                        {sec.id === 'advantages' && (
                                            <div className="space-y-3">
                                                {content.advantages.map((adv, i) => (
                                                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Card #{i + 1}</span>
                                                            <button onClick={() => removeArrayItem('advantages', i)} className="text-rose-400 hover:text-rose-600">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <Field label="Icon (emoji)" value={adv.icon} onChange={v => updateArrayItem('advantages', i, 'icon', v)} />
                                                            <Field label="Title" value={adv.title} onChange={v => updateArrayItem('advantages', i, 'title', v)} />
                                                            <Field label="Accent Color" value={adv.color} type="color" onChange={v => updateArrayItem('advantages', i, 'color', v)} />
                                                            <div className="col-span-2 md:col-span-4">
                                                                <Field label="Description" value={adv.desc} onChange={v => updateArrayItem('advantages', i, 'desc', v)} multiline />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => addArrayItem('advantages', { icon: '✨', title: 'New Advantage', desc: 'Description...', color: '#6366f1' })}
                                                    className="flex items-center gap-2 text-rose-600 text-xs font-black uppercase tracking-wide w-full justify-center py-3 border-2 border-dashed border-rose-200 rounded-xl hover:bg-rose-50 transition-all">
                                                    <Plus size={14} /> Add Advantage Card
                                                </button>
                                            </div>
                                        )}

                                        {/* ── KEY FEATURES ── */}
                                        {sec.id === 'features' && (
                                            <div className="space-y-3">
                                                {content.features.map((feat, i) => (
                                                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Feature #{i + 1}</span>
                                                            <button onClick={() => removeArrayItem('features', i)} className="text-rose-400 hover:text-rose-600">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <Field label="Icon (emoji)" value={feat.icon} onChange={v => updateArrayItem('features', i, 'icon', v)} />
                                                            <Field label="Title" value={feat.title} onChange={v => updateArrayItem('features', i, 'title', v)} />
                                                            <Field label="Description" value={feat.desc} onChange={v => updateArrayItem('features', i, 'desc', v)} />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => addArrayItem('features', { icon: '✨', title: 'New Feature', desc: 'Feature description.' })}
                                                    className="flex items-center gap-2 text-cyan-600 text-xs font-black uppercase tracking-wide w-full justify-center py-3 border-2 border-dashed border-cyan-200 rounded-xl hover:bg-cyan-50 transition-all">
                                                    <Plus size={14} /> Add Feature
                                                </button>
                                            </div>
                                        )}

                                        {/* ── CONTACT ── */}
                                        {sec.id === 'contact' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Field label="Phone Number" value={content.contact.phone} onChange={v => update('contact.phone', v)} />
                                                <Field label="Email Address" value={content.contact.email} onChange={v => update('contact.email', v)} />
                                                <Field label="WhatsApp Number" value={content.contact.whatsapp} onChange={v => update('contact.whatsapp', v)} />
                                                <Field label="Office Address" value={content.contact.address} onChange={v => update('contact.address', v)} multiline />
                                            </div>
                                        )}

                                        {/* ── COMPANY ── */}
                                        {sec.id === 'company' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Field label="Company Name" value={content.company.name} onChange={v => update('company.name', v)} />
                                                <Field label="Tagline" value={content.company.tagline} onChange={v => update('company.tagline', v)} />
                                                <Field label="Founded Year" value={content.company.founded} onChange={v => update('company.founded', v)} />
                                                <Field label="CIN Number" value={content.company.cin} onChange={v => update('company.cin', v)} />
                                                <Field label="GSTIN" value={content.company.gstin} onChange={v => update('company.gstin', v)} />
                                            </div>
                                        )}

                                        {/* ── SECTION VISIBILITY ── */}
                                        {sec.id === 'sections' && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {Object.entries(content.sections).map(([name, visible]) => (
                                                    <Toggle key={name} label={name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} value={visible}
                                                        onChange={v => update(`sections.${name}`, v)} />
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Floating Save */}
            <div className="sticky bottom-4 flex justify-end">
                <button onClick={handleSave}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-indigo-500/40 hover:scale-105 hover:shadow-indigo-500/60 active:scale-95 transition-all">
                    {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                    {saved ? 'Changes Saved!' : 'Save & Publish'}
                </button>
            </div>
        </div>
    );
}
