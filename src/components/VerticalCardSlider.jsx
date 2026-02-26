import React, { useState, useRef, useEffect } from 'react';
import './VerticalCardSlider.css';

const VerticalCardSlider = () => {
    const [progress, setProgress] = useState(0);
    const sectionRef = useRef(null);

    const items = [
        { title: "Register Free", desc: "Sign up in under 2 minutes with your mobile number. No paperwork needed.", step: "01", color: "#2563eb", icon: "🚀" },
        { title: "Upload KYC", desc: "Submit your Aadhaar and PAN details securely for instant verification.", step: "02", color: "#4f46e5", icon: "🔐" },
        { title: "Get Approved", desc: "Our team verifies your account and activates all financial services within hours.", step: "03", color: "#16a34a", icon: "✅" },
        { title: "Add Wallet Balance", desc: "Add funds via UPI, Bank Transfer or Credit Card to start transacting.", step: "04", color: "#dc2626", icon: "💳" },
        { title: "Start Earning", desc: "Offer digital payments to customers and earn commissions on every transaction.", step: "05", color: "#ca8a04", icon: "💰" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            // Total scrollable distance for this block
            const total = sectionRef.current.offsetHeight - window.innerHeight;
            // Map the scroll progress from 0 to 1
            const val = Math.min(Math.max(-rect.top / total, 0), 1);
            setProgress(val);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // initial state
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Active item index as a continuous float value
    const activeFloat = progress * (items.length - 1);

    const getItemStyle = (index) => {
        const stt = index - activeFloat;
        const absStt = Math.abs(stt);

        // Spread the cards horizontally on scroll
        const translateX = 240 * stt;
        // Move them slightly higher with translateY
        const translateY = -60;

        // Cards drop back into depth
        const scale = Math.max(0.4, 1 - 0.25 * absStt);

        // 3D Rotation like a carousel around the Y Axis
        const rotateY = stt * -15;

        // Stack ordering
        const zIndex = 100 - Math.round(absStt * 10);

        // Blur & Fade out cards that are far away
        const opacity = absStt > 2.5 ? 0 : 1 - (absStt * 0.25);
        const blurNum = absStt * 4;
        const blur = `blur(${blurNum}px)`;

        return {
            transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
            zIndex,
            filter: blur,
            opacity,
            willChange: 'transform, opacity, filter',
        };
    };

    return (
        <section ref={sectionRef} style={{ height: '400vh', background: '#f8fafc', position: 'relative' }}>
            <div className="slider-section-wrapper" style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            }}>
                <div className="section-header-slider">
                    <span className="slider-tag">Simple Process</span>
                    <h2 className="slider-main-title">How It Works</h2>
                    <p className="slider-main-desc">Follow these 5 simple steps to launch your digital banking point with Rupiksha.</p>
                </div>

                <div className="slider">
                    {items.map((item, index) => {
                        const style = getItemStyle(index);
                        const isActive = Math.abs(index - activeFloat) < 0.5;

                        return (
                            <div
                                key={index}
                                className={`item ${isActive ? 'active' : ''}`}
                                style={{
                                    ...style,
                                    // Make cards MASSIVE and GLASSY
                                    width: '420px',
                                    height: '520px',
                                    left: 'calc(50% - 210px)', // Center horizontally
                                    background: isActive ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(40px) saturate(200%)',
                                    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                                    border: `1px solid rgba(255, 255, 255, 0.7)`,
                                    borderTopColor: 'rgba(255, 255, 255, 1)',
                                    borderLeftColor: 'rgba(255, 255, 255, 1)',
                                    boxShadow: isActive ? '0 40px 100px -20px rgba(0,0,0,0.15), inset 0 1px 1px 0 rgba(255,255,255,0.8)' : '0 20px 40px -10px rgba(0,0,0,0.05)',
                                    color: '#0f172a',
                                    transition: 'background 0.5s ease, box-shadow 0.5s ease, border 0.5s ease'
                                }}
                            >
                                <div className="item-step" style={{
                                    background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                                    boxShadow: `0 15px 30px -5px ${item.color}60`,
                                    width: '74px',
                                    height: '74px',
                                    fontSize: '2rem',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    zIndex: 10
                                }}>
                                    {item.step}
                                </div>

                                {/* Inner Content */}
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 900, marginTop: '25px', letterSpacing: '-0.5px' }}>{item.title}</h1>
                                    <p style={{ fontSize: '1.25rem', color: '#334155', marginTop: '15px', lineHeight: 1.7, fontWeight: 500 }}>{item.desc}</p>
                                </div>

                                <div className="item-footer" style={{ color: item.color, marginTop: 'auto', fontSize: '13px', fontWeight: 900, opacity: 0.9, letterSpacing: '2px', position: 'relative', zIndex: 10 }}>
                                    RUPIKSHA FINTECH
                                </div>

                                {/* Decorative Giant 3D Icon that lights up on hover */}
                                <div className="hover-light-icon" style={{
                                    position: 'absolute',
                                    bottom: '25px',
                                    right: '25px',
                                    fontSize: '9rem',
                                    lineHeight: 1,
                                    zIndex: 1,
                                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}>
                                    {item.icon}
                                </div>

                                {/* Decorative Soft Glow inside the glassy card */}
                                {isActive && (
                                    <div className="hover-light-glow" style={{
                                        position: 'absolute',
                                        bottom: '-20%',
                                        right: '-20%',
                                        width: '280px',
                                        height: '280px',
                                        background: item.color,
                                        filter: 'blur(100px)',
                                        opacity: 0.15,
                                        borderRadius: '50%',
                                        zIndex: 0,
                                        pointerEvents: 'none',
                                        transition: 'all 0.5s ease',
                                    }}></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
};

export default VerticalCardSlider;
