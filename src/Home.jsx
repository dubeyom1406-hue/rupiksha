
import React, { useRef, useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

import {
    Float,
    Text,
    Environment,
    PresentationControls,
    ContactShadows,
    Html,
    MeshDistortMaterial,
    RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    Shield,
    Zap,
    CreditCard,
    Smartphone,
    Users,
    ArrowRight,
    CheckCircle2,
    Globe,
    Menu,
    X,
    ChevronDown,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Download,
    LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/rupiksha_logo.png';

// --- Advanced 3D Core ---

const DigitalNode = ({ position, color, icon: Icon, label, delay = 0 }) => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime() + delay;
        meshRef.current.position.y = position[1] + Math.sin(time) * 0.4;
        meshRef.current.rotation.y = time * 0.5;
    });

    return (
        <group position={position} ref={meshRef}>
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <mesh>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={2}
                        metalness={1}
                        roughness={0}
                    />
                </mesh>
                <Html position={[0, 1.2, 0]} transform occlude center>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3">
                        <Icon size={16} className="text-white" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
                    </div>
                </Html>
                <mesh position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color={color} transparent opacity={0.1} />
                </mesh>
            </Float>
        </group>
    );
};

const ConnectingLines = () => {
    const points = useMemo(() => [
        new THREE.Vector3(-4, 2, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4, -2, 0),
        new THREE.Vector3(-3, -3, -2),
        new THREE.Vector3(3, 3, -1),
    ], []);

    return (
        <group>
            {points.map((p, i) => (
                <line key={i}>
                    <bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(0, 0, 0), p]} />
                    <lineBasicMaterial attach="material" color="#4caf50" transparent opacity={0.2} />
                </line>
            ))}
        </group>
    );
};

const DigitalCore = () => {
    const coreRef = useRef();

    useFrame((state) => {
        coreRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
        coreRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    });

    return (
        <group ref={coreRef}>
            {/* The Central Hub - Minimal & Glowing */}
            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                <mesh>
                    <octahedronGeometry args={[3, 1]} />
                    <meshStandardMaterial
                        color="#1e3a8a"
                        wireframe
                        transparent
                        opacity={0.15}
                    />
                </mesh>
                <mesh scale={[0.6, 0.6, 0.6]}>
                    <octahedronGeometry args={[2, 0]} />
                    <meshStandardMaterial
                        color="#22c55e"
                        emissive="#22c55e"
                        emissiveIntensity={1}
                        metalness={1}
                        roughness={0}
                    />
                </mesh>
            </Float>

            {/* Orbiting Points */}
            <DigitalNode position={[-6, 3, -2]} color="#22c55e" icon={Shield} label="SECURITY" delay={0} />
            <DigitalNode position={[6, -3, -2]} color="#1e3a8a" icon={Zap} label="INSTANT" delay={2} />
            <DigitalNode position={[-4, -5, -3]} color="#facc15" icon={CreditCard} label="PAYMENTS" delay={4} />
            <DigitalNode position={[4, 5, -3]} color="#ffffff" icon={Smartphone} label="MOBILE" delay={6} />

            <ConnectingLines />
        </group>
    );
};

const EnhancedParticles = () => {
    const count = 3000;
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 70;
            p[i * 3 + 1] = (Math.random() - 0.5) * 70;
            p[i * 3 + 2] = (Math.random() - 0.5) * 70;
        }
        return p;
    }, []);

    const ref = useRef();
    useFrame((state) => {
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.01;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={points}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                color="#2563eb"
                transparent
                opacity={0.3}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

// --- UI Sections ---

const Navbar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Solutions', id: 'services', hasDropdown: true },
        { name: 'Features', id: 'advantage', hasDropdown: true },
        { name: 'Ecosystem', id: 'roles', hasDropdown: true },
        { name: 'Developer', id: 'about', hasDropdown: false },
        { name: 'Contact', id: 'contact', hasDropdown: false }
    ];

    return (
        <nav className="fixed top-6 left-0 right-0 z-[101] px-6 transition-all duration-500">
            <div className={`max-w-7xl mx-auto flex justify-between items-center rounded-full border border-zinc-100 px-8 py-3 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-xl py-2' : 'bg-white/20 backdrop-blur-md'}`}>
                {/* Left: Logo */}
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src={logo} alt="Logo" className="h-6 md:h-8" />
                    <span className="text-zinc-900 font-black text-lg tracking-tighter">RUPIKSHA</span>
                </div>

                {/* Center: Nav Links */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-zinc-400 hover:text-zinc-900 transition-all tracking-widest"
                        >
                            {link.name}
                            {link.hasDropdown && <ChevronDown size={10} className="text-zinc-300" />}
                        </button>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-100 group">
                        <Download size={14} className="text-[#22c55e] group-hover:animate-bounce" />
                        Download APK
                    </button>
                    <button
                        onClick={() => navigate('/portal')}
                        className="bg-[#22c55e] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#22c55e]/90 transition-all flex items-center gap-2"
                    >
                        <LogIn size={14} />
                        Login
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="lg:hidden text-zinc-900" onClick={() => setMobileMenu(true)}>
                    <Menu size={20} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-black/95 z-[110] p-12 flex flex-col items-center justify-center gap-8 font-mono"
                    >
                        <button onClick={() => setMobileMenu(false)} className="absolute top-10 right-10 text-white"><X size={32} /></button>

                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => { setMobileMenu(false); document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                                className="text-3xl font-black uppercase tracking-tighter text-white/40 hover:text-[#22c55e] transition-colors"
                            >
                                {link.name}
                            </button>
                        ))}

                        <div className="mt-12 flex flex-col gap-4 w-full max-w-xs">
                            <button className="w-full bg-white/5 text-white py-5 rounded-full font-black uppercase text-xs tracking-widest border border-white/10">Download APK</button>
                            <button
                                onClick={() => { setMobileMenu(false); navigate('/portal'); }}
                                className="w-full bg-[#22c55e] text-black py-5 rounded-full font-black uppercase text-xs tracking-widest"
                            >
                                Login
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const Hero = () => {
    const containerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Logo Travel Animation - Moves down & changes color as user scrolls
    const logoY = useTransform(scrollYProgress, [0, 1], [0, 600]);
    const logoOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);

    //Reveal from BOTTOM as it crosses
    const logoReveal = useTransform(
        scrollYProgress,
        [0.45, 0.9],
        ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]
    );

    const springY = useSpring(logoY, { stiffness: 100, damping: 30 });

    return (
        <section ref={containerRef} className="relative min-h-[120vh] w-full bg-white pt-20 pb-20 z-20">
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none z-[110]">
                <div className="absolute inset-0 z-0 opacity-10">
                    <Canvas camera={{ position: [0, 0, 20], fov: 40 }}>
                        <EnhancedParticles />
                    </Canvas>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center pointer-events-auto">
                    {/* Main Headline */}
                    <motion.div
                        style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12 -mt-10"
                    >
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-[1.1] text-zinc-900 uppercase drop-shadow-sm">
                            Empowering India's <br />
                            <span className="text-zinc-900/30 italic">Digital Payments Revolution</span>
                        </h1>
                    </motion.div>

                    {/* Button Group - 3 Pills */}
                    <motion.div
                        style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [1, 0]) }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-3 mb-16"
                    >
                        {[
                            { text: "Start Building", bg: "bg-[#22c55e]", textCol: "text-white", iconBg: "bg-white", iconCol: "text-[#22c55e]", shadow: "shadow-lg shadow-green-500/20" },
                            { text: "Bridge to Core", bg: "bg-transparent border border-zinc-200", textCol: "text-zinc-900", iconBg: "bg-[#22c55e]", iconCol: "text-white", shadow: "" },
                            { text: "Swap Assets", bg: "bg-zinc-50 border border-zinc-100", textCol: "text-zinc-900", iconBg: "bg-zinc-200", iconCol: "text-zinc-900", shadow: "" }
                        ].map((btn, i) => (
                            <button
                                key={i}
                                className={`flex justify-between items-center gap-4 ${btn.bg} ${btn.textCol} ${btn.shadow} pl-8 pr-2 py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest md:min-w-[210px] hover:scale-[1.02] transition-all group relative`}
                            >
                                <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">{btn.text}</span>
                                <div className={`${btn.iconBg} w-9 h-9 rounded-full flex items-center justify-center overflow-hidden relative z-10`}>
                                    <motion.div
                                        initial={{ x: 0 }}
                                        whileHover={{
                                            x: [0, 25, -25, 0],
                                            transition: {
                                                duration: 0.5,
                                                times: [0, 0.4, 0.41, 1],
                                                ease: "easeInOut"
                                            }
                                        }}
                                    >
                                        <ArrowRight size={18} className={btn.iconCol} />
                                    </motion.div>
                                </div>
                            </button>
                        ))}
                    </motion.div>

                    {/* Traveling Logo with Precise Crossing Reveal Effect */}
                    <motion.div
                        style={{
                            y: springY,
                            opacity: logoOpacity
                        }}
                        className="relative p-10 -mt-12 z-[110]"
                    >
                        <div className="relative group">
                            {/* Base Logo (Original Green / Top Part) */}
                            <motion.div
                                animate={{ scale: [1, 1.01, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="relative z-10"
                            >
                                <img src={logo} alt="RUPIKSHA BASE" className="h-48 md:h-64 opacity-100" />
                            </motion.div>

                            {/* Overlay Logo (Transforming Blue / Bottom Part entering new section) */}
                            <motion.div
                                style={{
                                    clipPath: useTransform(
                                        scrollYProgress,
                                        [0.45, 0.85],
                                        ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]
                                    ),
                                    filter: "hue-rotate(200deg) brightness(1.2) drop-shadow(0 0 10px rgba(37,99,235,0.3))"
                                }}
                                animate={{ scale: [1, 1.01, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 z-20"
                            >
                                <img src={logo} alt="RUPIKSHA TRANSFORM" className="h-48 md:h-64 opacity-100" />
                            </motion.div>

                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-[#22c55e]/5 blur-3xl rounded-full -z-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const FlowingLines = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50/50">
            {/* Faint Circular Grid Pattern like in the image */}
            <div className="absolute inset-0 opacity-[0.03]">
                <svg width="100%" height="100%">
                    <circle cx="20%" cy="40%" r="300" fill="none" stroke="black" strokeWidth="1" />
                    <circle cx="20%" cy="40%" r="500" fill="none" stroke="black" strokeWidth="1" />
                    <circle cx="60%" cy="70%" r="400" fill="none" stroke="black" strokeWidth="1" />
                    <circle cx="80%" cy="20%" r="350" fill="none" stroke="black" strokeWidth="1" />
                    <line x1="0" y1="40%" x2="100%" y2="40%" stroke="black" strokeWidth="1" />
                    <line x1="20%" y1="0" x2="20%" y2="100%" stroke="black" strokeWidth="1" />
                </svg>
            </div>

            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 4000 1000">
                <defs>
                    <linearGradient id="thickBlueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                        <stop offset="20%" stopColor="#2563eb" stopOpacity="1" />
                        <stop offset="80%" stopColor="#2563eb" stopOpacity="1" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="thickGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
                        <stop offset="20%" stopColor="#22c55e" stopOpacity="1" />
                        <stop offset="80%" stopColor="#22c55e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Main Blue Flow - Thick, Rounded (Shape from Image) */}
                <motion.path
                    d="M -200,400 C 600,200 1400,800 2200,400 T 4200,500"
                    stroke="url(#thickBlueGradient)"
                    strokeWidth="55"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#softGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0.1, 0.4, 0.1],
                        pathOffset: [0, 0.9, 0],
                        opacity: [0, 0.6, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Main Green Flow - Thick, Rounded */}
                <motion.path
                    d="M -200,600 C 800,850 1800,250 2800,600 T 4200,300"
                    stroke="url(#thickGreenGradient)"
                    strokeWidth="55"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#softGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0.1, 0.3, 0.1],
                        pathOffset: [0, 1.1, 0],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 2
                    }}
                />
            </svg>

            {/* Subtle Ambient Glows */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
        </div>
    );
};

const OurServices = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const panels = gsap.utils.toArray(".gsap-panel");
            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: triggerRef.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (panels.length - 1),
                    end: () => "+=" + triggerRef.current.offsetWidth / 1.5,
                    invalidateOnRefresh: true,
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="bg-white border-t border-black overflow-hidden w-full relative">
            <div ref={triggerRef} className="flex flex-nowrap w-[300vw] h-screen items-center sticky top-0">
                {/* Background Animation Layer */}
                <FlowingLines />

                {/* Panel 1: RUPIKSHA IS BASED */}
                <div className="gsap-panel w-screen h-full flex-shrink-0 flex flex-col items-center justify-center relative px-6 bg-transparent">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-zinc-900 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-zinc-900 rounded-full" />
                    </div>

                    <div className="relative z-10 text-center max-w-5xl pt-96">
                        <h2 className="text-4xl md:text-[4.5rem] font-black tracking-tighter text-zinc-900 leading-[0.85] uppercase">
                            RUPIKSHA <br />
                            <span className="text-zinc-900 italic">IS BASED</span>
                        </h2>
                        <p className="mt-32 max-w-2xl mx-auto text-zinc-400 font-medium text-xl md:text-2xl leading-relaxed">
                            Comprehensive digital payment and financial solutions engineered for India's next-generation economy.
                        </p>
                    </div>
                </div>

                {/* Panel 2: MONEY TRANSFER */}
                <div className="gsap-panel w-screen h-full flex-shrink-0 flex flex-col items-center justify-center relative px-6 bg-transparent overflow-hidden">
                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl md:text-[5rem] font-black tracking-tighter text-zinc-900 leading-[0.85] mb-8 uppercase">
                            MONEY <br />
                            <span className="italic text-[#22c55e]">TRANSFER</span>
                        </h2>
                        <div className="flex justify-center">
                            <button className="flex items-center gap-4 bg-[#22c55e] hover:bg-[#16a34a] text-white pl-8 pr-2 py-1.5 rounded-full font-black text-xs uppercase tracking-widest transition-all group relative">
                                <span className="relative z-10">Learn More</span>
                                <div className="bg-white w-9 h-9 rounded-full flex items-center justify-center relative z-10">
                                    <ArrowRight size={18} className="text-[#22c55e] group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel 3: AEPS */}
                <div className="gsap-panel w-screen h-full flex-shrink-0 flex flex-col items-center justify-center relative px-6 bg-transparent overflow-hidden">
                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl md:text-[5rem] font-black tracking-tighter text-zinc-900 leading-[0.85] mb-8 uppercase italic">
                            <span className="text-[#22c55e] not-italic">AEPS</span> <br />
                            SERVICES
                        </h2>
                        <div className="flex justify-center">
                            <button className="flex items-center gap-4 bg-[#22c55e] hover:bg-[#16a34a] text-white pl-8 pr-2 py-1.5 rounded-full font-black text-xs uppercase tracking-widest transition-all group relative">
                                <span className="relative z-10">Learn More</span>
                                <div className="bg-white w-9 h-9 rounded-full flex items-center justify-center relative z-10">
                                    <ArrowRight size={18} className="text-[#22c55e] group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function Home() {
    return (
        <div className="bg-white selection:bg-[#22c55e] selection:text-white overflow-x-hidden relative">
            <div className="noise-overlay" />
            <Navbar />
            <Hero />
            <OurServices />

            {/* Multi-language floating widget */}
            <div className="fixed bottom-10 left-10 z-[100] group font-mono">
                <div className="bg-white w-20 h-20 rounded-none shadow-2xl flex items-center justify-center border border-zinc-100 hover:border-[#22c55e] transition-all cursor-pointer cyber-border">
                    <Globe size={24} className="text-zinc-400 group-hover:text-[#22c55e] group-hover:rotate-90 transition-all" />
                    <span className="absolute -top-2 -right-2 bg-[#22c55e] text-white text-[8px] px-1 font-bold tracking-tighter animate-pulse">EN</span>
                </div>
            </div>
        </div>
    );
}
