import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/rupiksha_logo.png';
import { Zap, ShieldCheck, Users, Target, Eye, Smartphone, Building2, Wallet, Shield, Infinity, Headset, ArrowLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

/* ─────────────────────────────────────────────
   Enhanced in-view hook for scroll animations
───────────────────────────────────────────── */
function useInView(threshold = 0.1) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); } },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

const AnimatedBlock = ({ children, className = "", delay = "0s" }) => {
    const [ref, visible] = useInView(0.15);
    return (
        <div
            ref={ref}
            className={`${className} reveal-block ${visible ? 'active' : ''}`}
            style={{ transitionDelay: delay }}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────
   3D Coin Component
───────────────────────────────────────────── */
const CoinModel = () => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = t * 0.6;
    });

    return (
        <group ref={meshRef}>
            {/* Main Coin Body - Outer Silver Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[2, 2, 0.4, 64]} />
                <meshStandardMaterial
                    color="#e5e7eb"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Inner Gold Circle */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <cylinderGeometry args={[1.4, 1.4, 0.42, 64]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    metalness={1}
                    roughness={0.2}
                />
            </mesh>

            {/* Indian Rupee Symbol (₹) - Front Side (Embossed) */}
            <group position={[0, 0.2, 0.22]}>
                {/* Upper Bar */}
                <mesh position={[0, 0.35, 0.02]}>
                    <boxGeometry args={[1.0, 0.14, 0.15]} />
                    <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.5} />
                </mesh>
                {/* Middle Bar */}
                <mesh position={[0, 0.12, 0.02]}>
                    <boxGeometry args={[0.9, 0.14, 0.15]} />
                    <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.5} />
                </mesh>
                {/* Curved Body (Devanagari Ra shape) */}
                <mesh position={[0.12, -0.22, 0.02]} rotation={[0, 0, -0.1]}>
                    <torusGeometry args={[0.48, 0.09, 16, 24, Math.PI + 0.5]} />
                    <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.5} />
                </mesh>
                {/* Slant Line */}
                <mesh position={[-0.18, -0.45, 0.02]} rotation={[0, 0, 0.4]}>
                    <boxGeometry args={[0.1, 0.75, 0.15]} />
                    <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.5} />
                </mesh>
            </group>

            {/* "10" Denomination at the bottom */}
            <group position={[0, -0.8, 0.22]}>
                <mesh position={[-0.25, 0, 0]}>
                    <boxGeometry args={[0.1, 0.6, 0.1]} />
                    <meshStandardMaterial color="#fff" metalness={1} />
                </mesh>
                <mesh position={[0.25, 0, 0]}>
                    <torusGeometry args={[0.2, 0.08, 16, 24]} />
                    <meshStandardMaterial color="#fff" metalness={1} />
                </mesh>
            </group>

            {/* Back Side - Repeating Symbol for brand recognition */}
            <group position={[0, 0, -0.22]} rotation={[0, Math.PI, 0]}>
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[1, 0.12, 0.1]} />
                    <meshStandardMaterial color="#fff" metalness={1} />
                </mesh>
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.9, 0.12, 0.1]} />
                    <meshStandardMaterial color="#fff" metalness={1} />
                </mesh>
                <mesh position={[0, -0.5, 0]}>
                    <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} />
                </mesh>
            </group>

            {/* Edge Ridges/Texture */}
            {[...Array(32)].map((_, i) => (
                <mesh key={i} rotation={[0, (i / 32) * Math.PI * 2, 0]} position={[2.01, 0, 0]}>
                    <boxGeometry args={[0.02, 0.35, 0.05]} />
                    <meshStandardMaterial color="#9ca3af" metalness={1} />
                </mesh>
            ))}
        </group>
    );
};

/* ─────────────────────────────────────────────
   3D Hub Component (Genesis Mode)
───────────────────────────────────────────── */
const HubModel = () => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = t * 0.4;
        meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    });

    return (
        <group ref={meshRef}>
            {/* Core Central Pillar */}
            <mesh>
                <boxGeometry args={[1, 3, 1]} />
                <meshStandardMaterial color="#2563eb" metalness={1} roughness={0.2} emissive="#1e40af" emissiveIntensity={0.5} />
            </mesh>
            {/* Floating Data Rings */}
            <group rotation={[Math.PI / 4, 0, 0]}>
                <mesh>
                    <torusGeometry args={[2.5, 0.05, 16, 100]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} />
                </mesh>
            </group>
            <group rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
                <mesh>
                    <torusGeometry args={[2.2, 0.03, 16, 100]} />
                    <meshStandardMaterial color="#e5e7eb" metalness={1} opacity={0.6} transparent />
                </mesh>
            </group>
            {/* Satellite Nodes */}
            {[...Array(4)].map((_, i) => (
                <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 2, Math.sin(i * Math.PI / 2) * 0.5, Math.sin(i * Math.PI / 2) * 2]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} />
                </mesh>
            ))}
        </group>
    );
};

const Hero3DScene = ({ mode }) => {
    return (
        <div className="hero-3d-wrapper">
            <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                <pointLight position={[-10, -10, -10]} intensity={1} />
                <PresentationControls
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
                        {mode === 'hero' ? <CoinModel /> : <HubModel />}
                    </Float>
                </PresentationControls>
                <Environment preset="city" />
                <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            </Canvas>
        </div>
    );
};

const About = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [view, setView] = useState('hero'); // 'hero' or 'genesis'

    // Scroll container ref for Mission/Vision
    const mvContainerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: mvContainerRef,
        offset: ["start end", "end start"]
    });

    // Transforms for Mission Card (shrinks and slides up)
    const missionScale = useTransform(scrollYProgress, [0.2, 0.4], [1, 0.85]);
    const missionY = useTransform(scrollYProgress, [0.2, 0.4], [0, -80]);
    const missionOpacity = useTransform(scrollYProgress, [0.2, 0.38], [1, 0]);
    const missionBlur = useTransform(scrollYProgress, [0.2, 0.4], ["blur(0px)", "blur(10px)"]);

    // Transforms for Vision Card (comes into focus)
    const visionScale = useTransform(scrollYProgress, [0.2, 0.45], [0.9, 1]);
    const visionY = useTransform(scrollYProgress, [0.2, 0.45], [50, 0]);
    const visionOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
    const visionBlur = useTransform(scrollYProgress, [0.2, 0.4], ["blur(10px)", "blur(0px)"]);

    // Scroll container ref for Benefits
    const benefitsContainerRef = useRef(null);
    const { scrollYProgress: benefitsProgress } = useScroll({
        target: benefitsContainerRef,
        offset: ["start start", "end end"]
    });

    // Color definitions for benefits
    const benefitColors = [
        { main: '#2563eb', bg: '#eff6ff', glow: 'rgba(37,99,235,0.2)' },    // Blue
        { main: '#059669', bg: '#ecfdf5', glow: 'rgba(5,150,105,0.2)' },    // Green
        { main: '#d97706', bg: '#fffbeb', glow: 'rgba(217,119,6,0.2)' },    // Amber
        { main: '#dc2626', bg: '#fef2f2', glow: 'rgba(220,38,38,0.2)' },    // Red
        { main: '#7c3aed', bg: '#f5f3ff', glow: 'rgba(124,58,237,0.2)' },   // Purple
        { main: '#0891b2', bg: '#f0f9ff', glow: 'rgba(8,145,178,0.2)' }     // Cyan
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        const h = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    return (
        <div className="about-root">
            <style>{ABOUT_CSS}</style>

            {/* 💎 Premium Nav */}
            <nav className={`rp-nav ${scrolled ? 'rp-nav--scrolled' : ''}`}>
                <div className="rp-nav__inner">
                    <div className="rp-nav__brand" onClick={() => navigate('/')}>
                        <img src={logo} alt="Rupiksha" className="rp-nav__logo" />
                    </div>
                    <div className="rp-nav__links">
                        <button className="rp-nav__link" onClick={() => navigate('/')}>Home</button>
                        <button className="rp-nav__link active" onClick={() => { setView('hero'); navigate('/about'); }}>About</button>
                        <button className="rp-nav__link" onClick={() => navigate('/contact')}>Contact</button>
                        <button className="rp-btn rp-btn--sm rp-btn--primary" onClick={() => navigate('/portal')}>Login</button>
                    </div>
                </div>
            </nav>

            {/* 🔥 Dynamic High-Impact Hero */}
            <header className="about-hero">
                <div className="about-hero-container">
                    <div className="hero-split-grid">
                        {/* Left Side: 3D Scene */}
                        <div className="hero-left-visual">
                            <Hero3DScene mode={view} />
                            <div className="visual-circle vc-1"></div>
                        </div>

                        {/* Right Side: Content with AnimatePresence */}
                        <div className="hero-right-content">
                            <AnimatePresence mode="wait">
                                {view === 'hero' ? (
                                    <motion.div
                                        key="hero-content"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <span className="about-tag">Founded 2025</span>
                                        <h1 className="about-h1 partners-title-glow">
                                            Empowering Bharat's<br />
                                            <span className="text-shimmer">Digital Economy</span>
                                        </h1>
                                        <p className="about-sub">
                                            We are redefining financial inclusion by bridging the gap between traditional banking and the digital future.
                                        </p>
                                        <div className="hero-cta-wrap">
                                            <button className="rp-btn rp-btn--primary rp-btn--lg rp-btn--pulse" onClick={() => setView('genesis')}>
                                                Our Evolution <span className="btn-arrow-bounce">↓</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="genesis-content"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <span className="section-label">The Genesis</span>
                                        <h2 className="section-title-dissolve">Transforming India's Payment Landscape</h2>
                                        <p className="about-sub-plain">
                                            Founded in 2025, <strong>Rupiksha</strong> was established with a mission to democratize access to financial services across India, particularly in underserved areas.
                                        </p>
                                        <p className="about-sub-plain">
                                            What began as a vision has now grown into one of India's leading digital payment platforms, serving merchants and customers nationwide.
                                        </p>
                                        <div className="story-features-mini">
                                            <div className="s-feat"><Zap size={18} /> Innovation Driven</div>
                                            <div className="s-feat"><ShieldCheck size={18} /> Secure Infrastructure</div>
                                            <div className="s-feat"><Users size={18} /> Citizen Centric</div>
                                        </div>
                                        <div className="genesis-actions">
                                            <button className="back-btn-minimal" onClick={() => setView('hero')}>
                                                <ArrowLeft size={18} strokeWidth={3} /> Back to Hero
                                            </button>
                                            <button className="rp-btn-show-more" onClick={() => document.getElementById('mission-vision')?.scrollIntoView({ behavior: 'smooth' })}>
                                                Show More <span>+</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>




            {/* 🎯 Mission & Vision - Scroll-Driven Sticky Stack */}
            <section className="about-section light-bg mv-section-tight" id="mission-vision">
                <div className="about-container">
                    <div className="mv-scroll-stack" ref={mvContainerRef}>
                        <div className="mv-sticky-wrapper">
                            {/* Mission Card */}
                            <motion.div
                                className="mv-card-premium mission"
                                style={{
                                    scale: missionScale,
                                    y: missionY,
                                    opacity: missionOpacity,
                                    filter: missionBlur,
                                    position: 'absolute',
                                    top: 0,
                                    left: '50%',
                                    x: '-50%',
                                    zIndex: 30
                                }}
                            >
                                <div className="mv-icon-box">
                                    <Target size={32} strokeWidth={2.5} />
                                </div>
                                <div className="mv-content-box">
                                    <h3>Our Mission</h3>
                                    <p>To empower businesses and individuals across India with accessible, secure, and innovative digital financial solutions that drive growth.</p>
                                </div>
                            </motion.div>

                            {/* Vision Card */}
                            <motion.div
                                className="mv-card-premium vision"
                                style={{
                                    scale: visionScale,
                                    y: visionY,
                                    opacity: visionOpacity,
                                    filter: visionBlur,
                                    position: 'relative',
                                    zIndex: 10
                                }}
                            >
                                <div className="mv-icon-box">
                                    <Eye size={32} strokeWidth={2.5} />
                                </div>
                                <div className="mv-content-box">
                                    <h3>Our Vision</h3>
                                    <p>To become India's most trusted financial services platform, creating a seamless digital ecosystem that connects everyone nationwide.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🌟 Partner Benefits - Horizontal Cinematic Scroll */}
            {/* 🌟 Partner Benefits - Cinematic Horizontal Unlock */}
            <section className="benefits-parallax-outer" ref={benefitsContainerRef} style={{ height: '4500px', background: '#fff' }}>
                <div className="benefits-parallax-sticky">
                    <div className="benefits-section-bg"></div>
                    <div className="about_container_lock">
                        <div className="section-header-center" style={{ marginBottom: '40px' }}>
                            <span className="section-label">Opportunities</span>
                            <h2 className="section-title-dissolve">Why Partner with Us?</h2>
                        </div>
                    </div>

                    <div className="carousel_viewport">
                        {[
                            { i: <Smartphone size={32} />, t: 'Instant Setup', d: 'Launch your digital storefront in less than 2 minutes using our cloud-native app.' },
                            { i: <Building2 size={32} />, t: 'Service Hub', d: 'One-stop shop for AEPS, BBPS, Travel, Insurance and Govt. documentation.' },
                            { i: <Wallet size={32} />, t: 'Passive Income', d: 'Earn attractive commissions (₹40k-₹60k/mo) on every transaction.' },
                            { i: <Shield size={32} />, t: 'Bank Security', d: 'Certified secure infrastructure ensured by RBI & NPCI compliance standards.' },
                            { i: <Infinity size={32} />, t: 'Lifetime Payouts', d: 'Secure your future with lifetime commissions on your merchant network activity.' },
                            { i: <Headset size={32} />, t: '24/7 Support', d: 'Dedicated relationship managers and round-the-clock technical assistance.' }
                        ].map((b, i, arr) => {
                            const count = arr.length;
                            const step = 1 / count;

                            // Precise control over 0-1 scroll range for each card
                            const start = i * step;
                            const centerStart = start + (step * 0.15); // Card reaches center
                            const centerEnd = start + (step * 0.85);   // Card starts leaving center
                            const end = (i + 1) * step;

                            // X-Position: Right -> Center (Stays) -> Left
                            const x = useTransform(benefitsProgress, [start, centerStart, centerEnd, end], ["120%", "0%", "0%", "-120%"]);

                            // Scale: Active center card is slightly larger
                            const scale = useTransform(benefitsProgress, [start, centerStart, centerEnd, end], [0.8, 1.05, 1.05, 0.8]);

                            // Opacity: Fade in/out
                            const opacity = useTransform(benefitsProgress, [start - 0.02, start, end, end + 0.02], [0, 1, 1, 0]);

                            // Blur & Tint: Full effect on sides, clear in center
                            const blur = useTransform(benefitsProgress, [start, centerStart, centerEnd, end], ["blur(15px)", "blur(0px)", "blur(0px)", "blur(15px)"]);
                            const blueTint = useTransform(benefitsProgress, [start, centerStart, centerEnd, end], [0.85, 0, 0, 0.85]);

                            return (
                                <motion.div
                                    key={i}
                                    className="benefit-card-v5"
                                    style={{
                                        x,
                                        scale,
                                        opacity,
                                        filter: blur,
                                        '--blue-overlay': blueTint,
                                        '--accent-color': benefitColors[i].main,
                                        '--bg-color': benefitColors[i].bg,
                                        '--glow-color': benefitColors[i].glow,
                                        zIndex: 10
                                    }}
                                >
                                    <div className="card-blue-screen"></div>
                                    <div className="v5-icon-box">{b.i}</div>
                                    <div className="v5-text-box">
                                        <h4>{b.t}</h4>
                                        <p>{b.d}</p>
                                    </div>
                                    <div className="benefit-card-arrow">
                                        <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <footer className="about-footer-simple">
                <div className="about-container">
                    <div className="footer-flex">
                        <img src={logo} alt="Rupiksha" />
                        <p>© 2026 RuPiKsha Digital Services. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div >
    );
};

const ABOUT_CSS = `
:root {
    --accent: #2563eb;
    --dark: #0f172a;
    --grey: #64748b;
    --bg-light: #f8fafc;
    --white: #ffffff;
}

.about-root {
    background: #fff;
    color: var(--dark);
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
    scroll-behavior: smooth;
}

/* Animations */
.reveal-block { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
.reveal-block.active { opacity: 1; transform: translateY(0); }

/* Nav */
.rp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; padding: 20px 0; transition: all 0.4s; }
.rp-nav--scrolled { background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid #f1f5f9; padding: 14px 0; }
.rp-nav__inner { max-width: 1200px; margin: 0 auto; padding: 0 5%; display: flex; align-items: center; justify-content: space-between; }
.rp-nav__logo { height: 36px; cursor: pointer; }
.rp-nav__links { display: flex; align-items: center; gap: 8px; }
.rp-nav__link { background: none; border: none; font-family: inherit; font-size: 0.88rem; font-weight: 700; color: var(--grey); cursor: pointer; padding: 10px 16px; border-radius: 12px; transition: all 0.2s; }
.rp-nav__link:hover { color: var(--accent); background: #eff6ff; }
.rp-nav__link.active { color: var(--accent); background: #eff6ff; }

/* Buttons */
.rp-btn { display: inline-flex; align-items: center; gap: 10px; border-radius: 99px; font-weight: 800; cursor: pointer; border: none; transition: all 0.3s; font-family: inherit; }
.rp-btn--primary { background: var(--accent); color: #fff; box-shadow: 0 10px 20px rgba(37,99,235,0.2); }
.rp-btn--primary:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(37,99,235,0.4); }
.rp-btn--white { background: #fff; color: var(--accent); }
.rp-btn--outline { background: transparent; border: 2.5px solid var(--accent); color: var(--accent); }
.rp-btn--lg { padding: 18px 45px; font-size: 1.1rem; }
.rp-btn--sm { padding: 10px 24px; font-size: 0.85rem; }

/* 🌟 Advanced Button Animations */
.rp-btn--pulse {
    position: relative;
    overflow: hidden;
}

.rp-btn--pulse::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 99px;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    animation: btnPulse 3s ease-out infinite;
}

@keyframes btnPulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.btn-arrow-bounce {
    display: inline-block;
    animation: arrowBounce 1.5s ease-in-out infinite;
    font-size: 1.2rem;
    margin-left: 5px;
}

@keyframes arrowBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
}

.rp-btn--pulse::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
    );
    transform: skewX(-25deg);
    animation: btnShimmer 4s infinite;
}

@keyframes btnShimmer {
    0% { left: -100%; }
    20% { left: 200%; }
    100% { left: 200%; }
}

/* Hero */
.about-hero { min-height: 90vh; display: flex; align-items: center; position: relative; background: radial-gradient(circle at top left, #f1f7ff 0%, #fff 70%); padding-top: 80px; }
.about-hero-container { max-width: 1400px; margin: 0 auto; padding: 0 5%; width: 100%; position: relative; z-index: 10; }

.hero-split-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 40px; align-items: center; }

.hero-left-visual { position: relative; height: 500px; display: flex; align-items: center; justify-content: center; z-index: 5; }
.hero-right-content { text-align: left; padding-left: 50px; z-index: 10; min-height: 450px; display: flex; align-items: center; }

.back-btn-minimal { 
    background: none; 
    border: none; 
    color: var(--accent); 
    font-weight: 950; 
    font-size: 1.1rem; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    cursor: pointer; 
    padding: 0; 
    opacity: 0.8; 
    transition: all 0.3s; 
    text-transform: uppercase;
    letter-spacing: 1px;
}
.back-btn-minimal:hover { opacity: 1; transform: translateX(-5px); }

.genesis-actions {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-top: 45px;
}

.rp-btn-show-more {
    background: #1e3a8a; /* Navy Blue */
    color: #fff; /* White */
    padding: 14px 32px;
    border-radius: 99px;
    border: none;
    font-weight: 900;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(30, 58, 138, 0.25);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 12px;
}

.rp-btn-show-more span {
    font-size: 1.4rem;
    line-height: 1;
}

.rp-btn-show-more:hover {
    transform: scale(1.08) translateY(-3px);
    box-shadow: 0 15px 35px rgba(37, 99, 235, 0.35);
}

.about-sub-plain { font-size: 1.1rem; color: #475569; max-width: 550px; line-height: 1.7; margin-bottom: 20px; }
.story-features-mini { display: flex; flex-direction: column; gap: 14px; margin-top: 25px; }

.about-tag { font-size: 0.85rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; background: #eff6ff; padding: 8px 24px; border-radius: 99px; display: inline-block; margin-bottom: 24px; }
.about-h1 { font-size: clamp(2.5rem, 5vw, 4.2rem); font-weight: 950; line-height: 1.05; letter-spacing: -2px; margin-bottom: 32px; }
.text-shimmer {
    background: linear-gradient(90deg, #2563eb, #7c3aed, #2563eb);
    background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmerText 4s linear infinite;
}
@keyframes shimmerText { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
.about-sub { font-size: 1.2rem; color: var(--grey); max-width: 600px; margin: 0 0 40px; line-height: 1.6; }

.hero-left-visual .visual-circle { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.35; z-index: 1; }
.vc-1 { width: 500px; height: 500px; background: #93c5fd; top: 0; left: -100px; }

.hero-3d-wrapper {
    position: absolute;
    width: 600px;
    height: 600px;
    z-index: 5;
    pointer-events: auto;
    opacity: 1;
}

@media (max-width: 1000px) {
    .hero-split-grid { grid-template-columns: 1fr; text-align: center; gap: 0; }
    .hero-right-content { text-align: center; padding: 0; margin-top: -100px; }
    .hero-left-visual { height: 450px; }
    .about-sub { margin: 0 auto 40px; }
}


/* Sections */
.about-section { padding: 100px 0; }
.mv-section-tight { padding: 150px 0 20px; }
.light-bg { background: var(--bg-light); }
.section-label { color: var(--accent); font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; display: block; }
.section-label::after { content: ''; display: block; width: 45px; height: 3px; background: var(--accent); margin-top: 12px; border-radius: 2px; }
.section-title-dissolve { font-size: clamp(2.2rem, 5vw, 2.8rem); font-weight: 950; line-height: 1.15; margin-bottom: 24px; letter-spacing: -1.5px; }

/* Story Bento */
.story-bento-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 60px; align-items: flex-start; }
.story-text-card { text-align: left; }
.story-text-card p { font-size: 1.1rem; line-height: 1.8; color: #475569; margin-bottom: 25px; }
.story-features { display: flex; flex-direction: column; gap: 18px; margin-top: 30px; }
.s-feat { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1.15rem; color: var(--dark); transition: all 0.3s; }
.s-feat:hover { transform: translateX(8px); color: var(--accent); }
.s-feat svg { color: var(--accent); }

.story-image-card { position: relative; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); }
.story-image-card img { width: 100%; height: 550px; object-fit: cover; }
.image-overlay-pill { position: absolute; bottom: 30px; left: 30px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 20px; font-weight: 800; font-size: 0.9rem; color: var(--accent); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

.mv-scroll-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    height: 480px; /* Further reduced height to remove bottom space */
}

.mv-sticky-wrapper {
    position: sticky;
    top: 250px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.mv-card-premium {
    width: 100%;
    max-width: 620px;
    height: 250px;
    background: #fff;
    padding: 35px;
    border-radius: 35px;
    display: flex;
    align-items: center;
    gap: 25px;
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.12);
    border: 1px solid rgba(0,0,0,0.05);
}

.mv-card-premium.vision {
    background: #1e3a8a;
    color: #fff;
    z-index: 10;
}



/* Visual Fixes for Vision mode */
.vision .mv-icon-box { background: rgba(255,255,255,0.12); color: #fff; }
.vision .mv-content-box h3 { color: #fff; }
.vision .mv-content-box p { color: rgba(255,255,255,0.8); }

.mv-icon-box {
    flex-shrink: 0;
    width: 90px;
    height: 90px;
    background: #eff6ff;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
}

.mv-content-box h3 { font-size: 2rem; font-weight: 950; margin-bottom: 12px; color: var(--dark); }
.mv-content-box p { font-size: 1.15rem; line-height: 1.7; color: #475569; }

@media (max-width: 768px) {
    .mv-card-premium { flex-direction: column; text-align: center; height: auto; padding: 40px 25px; top: 15vh; gap: 20px; }
    .mv-sticky-box { height: 50vh; }
    .mv-icon-box { margin: 0 auto; }
}

/* Benefits V5 - Deep Lock Cinematic */
.benefits-parallax-outer {
    width: 100%;
    position: relative;
    z-index: 50;
}

.benefits-parallax-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
}

.about_container_lock {
    width: 100%;
    max-width: 1200px;
    padding: 0 20px;
    position: absolute;
    top: 10%;
    z-index: 150;
}

.carousel_viewport {
    position: relative;
    width: 100%;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.benefit-card-v5 {
    position: absolute;
    width: 720px;
    height: 380px;
    background: #fff;
    border-radius: 50px;
    padding: 60px;
    display: flex;
    align-items: center;
    gap: 40px;
    border: 1px solid var(--glow-color);
    box-shadow: 0 50px 100px -30px rgba(0,0,0,0.12);
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(20px);
}

.card-blue-screen {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1e3a8a, #3b82f6, #1e40af);
    opacity: var(--blue-overlay);
    z-index: 100;
    border-radius: 50px;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.benefit-card-v5 h4 { font-size: 1.8rem; font-weight: 950; color: var(--dark); margin-bottom: 12px; }
.benefit-card-v5 p { font-size: 1.15rem; color: #475569; line-height: 1.7; }
.v5-icon-box { flex-shrink: 0; width: 90px; height: 90px; background: var(--bg-color); color: var(--accent-color); border-radius: 25px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--glow-color); }


.blue-tint-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1e3a8a; /* Deep blue tint for side cards */
    opacity: var(--blue-tint);
    pointer-events: none;
    z-index: 5;
    transition: opacity 0.3s ease;
}

.b-icon-v3 { 
    width: 70px;
    height: 70px;
    background: var(--bg-color);
    border-radius: 20px;
    color: var(--accent-color); 
    margin-bottom: 32px; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    border: 1px solid var(--glow-color);
}

.benefit-item-v3 h4 { 
    font-size: 1.5rem; 
    font-weight: 950; 
    margin-bottom: 18px; 
    color: var(--dark);
    letter-spacing: -0.8px;
    transition: color 0.3s ease;
}

.benefit-item-v3 p { 
    font-size: 1.05rem; 
    color: #64748b; 
    line-height: 1.7; 
    font-weight: 500;
}

.benefit-card-arrow {
    position: absolute;
    bottom: 40px;
    right: 40px;
    width: 44px;
    height: 44px;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--grey);
    opacity: 0;
    transform: translateX(-20px);
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.benefit-item-v3:hover .benefit-card-arrow {
    opacity: 1;
    transform: translateX(0);
    background: var(--accent);
    color: #fff;
}

.benefit-item-v3:hover h4 {
    color: var(--accent);
}

.section-label { 
    color: var(--accent); 
    font-weight: 900; 
    font-size: 0.85rem; 
    text-transform: uppercase; 
    letter-spacing: 4px; 
    margin-bottom: 24px; 
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.section-label::before, .section-label::after { 
    content: ''; 
    display: block; 
    width: 30px; 
    height: 2px; 
    background: var(--accent); 
    border-radius: 2px;
    opacity: 0.3;
}

/* Background Decoration for Benefits Section */
.benefits-section-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.03) 0%, transparent 50%);
    pointer-events: none;
}

    .story-image-card img { height: 400px; }
}

@media (max-width: 800px) {
    .about-h1 { font-size: 3rem; }
    .rp-btn--lg { width: 100%; padding: 16px 30px; }
    .footer-flex { flex-direction: column; gap: 20px; text-align: center; }
}

.partners-title-glow {
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #3b82f6, #0f172a);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: partnersGlowShine 6s linear infinite;
}
@keyframes partnersGlowShine { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
`;

export default About;
