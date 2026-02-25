import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/rupiksha_logo.png';

const Contact = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const h = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    return (
        <div className="contact-root">
            <style>{CONTACT_CSS}</style>

            <nav className={`rp-nav ${scrolled ? 'rp-nav--scrolled' : ''}`}>
                <div className="rp-nav__inner">
                    <div className="rp-nav__brand" onClick={() => navigate('/')}>
                        <img src={logo} alt="Rupiksha" className="rp-nav__logo" />
                    </div>
                    <div className="rp-nav__links">
                        <button className="rp-nav__link" onClick={() => navigate('/')}>Home</button>
                        <button className="rp-nav__link" onClick={() => navigate('/about')}>About</button>
                        <button className="rp-nav__link active">Contact</button>
                        <button className="rp-btn rp-btn--sm rp-btn--primary" onClick={() => navigate('/portal')}>Login</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="contact-hero">
                <div className="contact-hero-container">
                    <span className="contact-tag">Contact Us</span>
                    <h1 className="contact-h1 partners-title-glow">Have questions?<br />We're here to help.</h1>
                    <p className="contact-sub">Our team is ready to assist you. Find the best way to get in touch below.</p>
                </div>
                <div className="hero-bg-blobs">
                    <div className="blob b1"></div>
                    <div className="blob b2"></div>
                </div>
            </header>

            <section className="contact-grid-section">
                <div className="contact-container">
                    <div className="contact-main-grid">

                        {/* Left: Contact Info */}
                        <div className="contact-info-panel">
                            <div className="info-block">
                                <span className="info-label">Get in Touch</span>
                                <h2>We're just a message away</h2>
                                <p>Contact us for any queries or assistance regarding our services. We value your feedback and are committed to providing the best support.</p>
                            </div>

                            <div className="contact-cards-stack">
                                <div className="contact-detail-card">
                                    <div className="detail-icon">📍</div>
                                    <div className="detail-text">
                                        <h4>Our Location</h4>
                                        <p>Rupiksha Service Pvt Ltd, C/O Anand Enterprises, Prakash path, New zeromile, Muzaffarpur, Bihar, 842001</p>
                                    </div>
                                </div>

                                <div className="contact-detail-card">
                                    <div className="detail-icon">📞</div>
                                    <div className="detail-text">
                                        <h4>Phone</h4>
                                        <p>Toll Free: <strong>+91 7004128310</strong></p>
                                    </div>
                                </div>

                                <div className="contact-detail-card">
                                    <div className="detail-icon">✉️</div>
                                    <div className="detail-text">
                                        <h4>Email</h4>
                                        <p><strong>support@rupiksha.com</strong></p>
                                    </div>
                                </div>

                                <div className="contact-detail-card">
                                    <div className="detail-icon">🕒</div>
                                    <div className="detail-text">
                                        <h4>Working Hours</h4>
                                        <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
                                        <small>24/7 Digital Support Available</small><br />
                                        <small style={{ color: '#f43f5e' }}>Sunday: Emergency Support Only</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="contact-form-panel">
                            <div className="form-card">
                                <h3>Send Us a Message</h3>
                                <div className="rp-form-grid">
                                    <div className="form-group">
                                        <label>Full Name*</label>
                                        <input type="text" placeholder="John Doe" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address*</label>
                                        <input type="email" placeholder="john@example.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" placeholder="+91 00000 00000" />
                                    </div>
                                    <div className="form-group">
                                        <label>Subject*</label>
                                        <select>
                                            <option>Partnership Inquiry</option>
                                            <option>Technical Support</option>
                                            <option>Billing Question</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group full">
                                        <label>Message*</label>
                                        <textarea rows="5" placeholder="How can we help you?"></textarea>
                                    </div>
                                    <button className="rp-btn rp-btn--primary rp-btn--lg full">Send Message →</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="contact-container">
                    <div className="section-center-head">
                        <span className="info-label">Knowledge Base</span>
                        <h2>Frequently Asked Questions</h2>
                        <p>Find quick answers to common questions about our services.</p>
                    </div>

                    <div className="faq-grid">
                        <div className="faq-card">
                            <h4>How do I become an Rupiksha partner?</h4>
                            <p>To become an Rupiksha partner, you need to register on our website or contact our sales team. After registration, our team will guide you through the onboarding process, which includes verification, training, and setup.</p>
                        </div>
                        <div className="faq-card">
                            <h4>What are the requirements to become a partner?</h4>
                            <p>Basic requirements include a computer/smartphone with internet connection, a valid ID proof, address proof, PAN card, and a bank account. Training will be provided by our specialists.</p>
                        </div>
                        <div className="faq-card">
                            <h4>How much investment is required to start?</h4>
                            <p>The initial investment is minimal. You can start with basic digital services with just a working capital of ₹5,000-₹10,000. Device costs (AEPS, mATM) may be additional based on your choice.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Map Placeholder */}
            <section className="map-section">
                <div className="contact-container">
                    <div className="map-box">
                        <div className="map-info">
                            <h3>Visit Our Office</h3>
                            <p>We're conveniently located in Muzaffarpur, Bihar, easily accessible from all major locations. Drop by for a cup of coffee and a business discussion.</p>
                        </div>
                        <div className="map-visual">
                            <iframe
                                title="Office Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.428612502!2d85.4228!3d26.1209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDA3JzE1LjIiTiA4NcKwMjUnMjIuMSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="contact-footer">
                <p>© 2026 RuPiKsha Digital Services Pvt Ltd. All rights reserved.</p>
            </footer>
        </div>
    );
};

const CONTACT_CSS = `
.contact-root { background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
.contact-container { max-width: 1200px; margin: 0 auto; padding: 0 5%; }

/* Nav reusing logic */
.rp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; padding: 18px 0; transition: all 0.4s; }
.rp-nav--scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); box-shadow: 0 2px 20px rgba(0,0,0,0.08); padding: 12px 0; }
.rp-nav__inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.rp-nav__logo { height: 38px; }
.rp-nav__links { display: flex; align-items: center; gap: 8px; }
.rp-nav__link { background: none; border: none; font-family: inherit; font-size: 0.85rem; font-weight: 700; color: #475569; cursor: pointer; padding: 8px 14px; border-radius: 8px; }
.rp-nav__link.active { color: #2563eb; background: #eff6ff; }

/* Hero */
.contact-hero { height: 60vh; min-height: 500px; background: #f8fafc; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; text-align: center; }
.contact-tag { display: inline-block; padding: 8px 18px; background: #e2e8f0; border-radius: 99px; font-weight: 800; color: #2563eb; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px; margin-bottom: 24px; }
.contact-h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.1; letter-spacing: -2px; margin-bottom: 20px; }
.contact-sub { font-size: 1.2rem; color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.6; }

.hero-bg-blobs .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.25; z-index: 1; }
.b1 { width: 500px; height: 500px; background: #bfdbfe; top: -100px; left: -100px; }
.b2 { width: 400px; height: 400px; background: #fef9c3; bottom: -50px; right: -50px; }

/* Main Grid */
.contact-grid-section { padding: 100px 0; }
.contact-main-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; }

.info-label { color: #2563eb; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; font-size: 0.8rem; margin-bottom: 12px; display: block; }
.contact-info-panel h2 { font-size: 2.8rem; font-weight: 900; margin-bottom: 24px; line-height: 1.2; }
.contact-info-panel p { font-size: 1.1rem; color: #64748b; line-height: 1.8; margin-bottom: 40px; }

.contact-cards-stack { display: flex; flex-direction: column; gap: 24px; }
.contact-detail-card { display: flex; gap: 20px; padding: 24px; background: #fff; border: 1px solid #f1f5f9; border-radius: 20px; transition: all 0.3s; }
.contact-detail-card:hover { border-color: #2563eb; transform: translateX(8px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.detail-icon { font-size: 1.8rem; width: 50px; height: 50px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.detail-text h4 { font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; }
.detail-text p { font-size: 0.95rem; color: #475569; margin: 0; line-height: 1.5; }

/* Form Panel */
.form-card { background: #fff; padding: 60px; border-radius: 40px; border: 1px solid #f1f5f9; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); }
.form-card h3 { font-size: 1.8rem; font-weight: 800; margin-bottom: 32px; }
.rp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: #64748b; }
.form-group input, .form-group select, .form-group textarea { padding: 14px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-family: inherit; transition: all 0.2s; outline: none; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.08); }

/* FAQ */
.faq-section { padding: 100px 0; background: #f8fafc; }
.section-center-head { text-align: center; margin-bottom: 60px; }
.section-center-head h2 { font-size: 2.8rem; font-weight: 900; margin-bottom: 12px; }
.faq-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.faq-card { background: #fff; padding: 40px; border-radius: 30px; border: 1px solid #f1f5f9; }
.faq-card h4 { font-size: 1.2rem; font-weight: 800; margin-bottom: 16px; color: #0f172a; line-height: 1.4; }
.faq-card p { font-size: 0.95rem; color: #64748b; line-height: 1.7; }

/* Map */
.map-section { padding: 100px 0; }
.map-box { background: #0f172a; border-radius: 50px; overflow: hidden; display: grid; grid-template-columns: 1fr 1.5fr; align-items: center; }
.map-info { padding: 80px; color: #fff; }
.map-info h3 { font-size: 2.4rem; font-weight: 900; margin-bottom: 20px; }
.map-info p { font-size: 1.1rem; opacity: 0.7; line-height: 1.7; }
.map-visual img { width: 100%; height: 500px; object-fit: cover; }

.contact-footer { padding: 40px 0; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 0.9rem; }

/* Reused Buttons */
.rp-btn { border: none; border-radius: 99px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; }
.rp-btn--primary { background: #2563eb; color: #fff; }
.rp-btn--lg { padding: 18px 36px; font-size: 1rem; }
.rp-btn--sm { padding: 10px 24px; font-size: 0.85rem; }
.rp-btn.full { width: 100%; }

@media(max-width: 900px) {
    .contact-main-grid, .faq-grid, .map-box { grid-template-columns: 1fr; gap: 40px; }
    .rp-form-grid { grid-template-columns: 1fr; }
    .form-group.full { grid-column: span 1; }
    .map-info { padding: 40px; }
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

export default Contact;
