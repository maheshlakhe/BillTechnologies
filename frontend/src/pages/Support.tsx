/* eslint-disable */
import React, { useState } from 'react';
import '../styles/landing.css';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const { user } = useAuth();

  // State for search, menu and filter
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState({ show: false, title: '', text: '' });

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'account', label: 'Account' },
    { id: 'billing', label: 'Billing & GST' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'hardware', label: 'Hardware' },
    { id: 'software', label: 'Software Sync' }
  ];

  const faqs = [
    { category: 'account', question: "How do I reset my password?", answer: "You can reset your password by clicking 'Forgot Password' on the login page and following the instructions sent to your email." },
    { category: 'account', question: "How can I update my profile?", answer: "Navigate to the 'Profile' section in your dashboard to update your personal information, contact details, and company logo." },
    { category: 'inventory', question: "Where can I see my bills and inventory?", answer: "All your generated bills are listed in the 'Bills' section. Inventory can be managed under the 'Products' or 'Inventory' tab in your main dashboard." },
    { category: 'billing', question: "How do I generate a GST report for filing?", answer: "Go to the 'Reports' section, select 'GST Reports', chooses the desired month/quarter, and click 'Export' to get your data in Excel or PDF format." },
    { category: 'billing', question: "Is my billing data secure on BillSoft?", answer: "Yes, we use industry-standard encryption and secure database systems. Regular backups are performed to ensure your data is safe and always accessible." },
    { category: 'billing', question: "Can I customize the design of my invoices?", answer: "Absolutely! Go to 'Settings' > 'Invoice Settings' to choose templates, add your logo, specify bank details, and customize colors to match your brand." },
    { category: 'account', question: "How do I add multiple users or staff to my account?", answer: "Administrators can add sub-users by navigating to 'User Management'. You can assign specific roles like 'Operator' or 'Accountant' with restricted permissions." },
    { category: 'hardware', question: "Do you support barcode scanning for faster billing?", answer: "Yes, BillSoft is compatible with most standard USB and Bluetooth barcode scanners for quick product lookup and billing." },
    { category: 'inventory', question: "How do I import my existing product list?", answer: "In the 'Products' section, click the 'Import' button. You can download our Excel template, fill in your product details, and upload it back for bulk entry." },
    { category: 'software', question: "Can I manage multiple business branches?", answer: "Yes, the 'Multi-Branch' module allows you to track sales, stock, and staff across different locations with centralized management." },
    { category: 'inventory', question: "How do I set up low-stock alerts?", answer: "Go to 'Inventory Settings' and define a 'Minimum Quantity' for each product. The system will alert you when stock levels fall below this threshold." },
    { category: 'billing', question: "Can I track customer loyalty points?", answer: "Our CRM module allows you to award points for every purchase. Customers can later redeem these points for discounts on future bills." },
    { category: 'billing', question: "How do I record business expenses?", answer: "Use the 'Expenses' module to log daily costs like rent, electricity, and salaries to get an accurate view of your net profit." },
    { category: 'account', question: "Can I export my customer list for marketing?", answer: "Yes, you can export your entire customer database to Excel from the 'Customers' section to run email or SMS campaigns." },
    { category: 'software', question: "Is there an offline mode for BillSoft?", answer: "Currently, BillSoft is a cloud-based application requiring an internet connection. This ensures your data is always synced and backed up in real-time." },
    { category: 'billing', question: "How do I create quotations for clients?", answer: "Navigate to the 'Invoices' section and choose 'Create Quotation'. Once approved, you can convert it into a final bill with a single click." },
    { category: 'billing', question: "Does the system support credit/debit note entry?", answer: "Yes, you can issue credit notes for customer returns and debit notes for purchase adjustments in the 'Accounts' module." },
    { category: 'inventory', question: "Can I track product expiry dates?", answer: "Absolutely! You can record expiry dates for batches, and the system will notify you of upcoming expirations in the inventory dashboard." },
    { category: 'account', question: "How do I cancel my subscription?", answer: "You can manage your plan under 'Subscription Settings'. You can cancel or downgrade your plan at any time; your data remains yours." },
    { category: 'software', question: "Do you offer custom software development?", answer: "If your business has unique requirements, contact our enterprise support via this form for information on custom integrations and private hosting." }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/web/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: '',
          message: `Category: ${formData.category}\n\n${formData.message}`,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      setShowSuccessModal({ show: true, title: 'Request Sent!', text: 'Our team will reach out within 24 hours.' });
      setFormData({ name: '', email: '', category: 'General Inquiry', message: '' });
    } catch (error) {
      showError('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (e.target as any).querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value : '';
    
    setShowGuideModal(false);
    
    try {
      await fetch(`${API_URL}/web/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Guide Requester',
          email: email,
          phone: '',
          message: 'Requested BillSoft User Guide PDF',
        }),
      });
    } catch (e) {
      console.error('Lead log failed', e);
    }

    window.open('/Billsoft_guide.pdf', '_blank');

    setShowSuccessModal({
      show: true,
      title: 'Guide Dispatched!',
      text: 'The User Guide has been opened in a new tab and sent to your email queue.'
    });
  };

  return (
    <div className="support-page-container" style={{ fontFamily: "'Geist', sans-serif" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>{`
        :root {
          --primary-blue: #3157a2;
          --accent-cyan: #00dfd8;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --bg-soft: #f8fafc;
          --gradient-main: linear-gradient(135deg, #3157a2 0%, #00dfd8 100%);
        }

        .support-page-container {
          background-color: var(--bg-soft);
          min-height: 100vh;
          color: var(--text-main);
        }

        /* Support Hero Section */
        .support-hero {
          background: radial-gradient(circle at 70% 30%, rgba(49, 87, 162, 0.04) 0%, rgba(255, 255, 255, 1) 100%);
          position: relative;
          padding: 80px 20px 120px;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .hero-title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 900;
          margin-bottom: 15px;
          color: #0c121e;
          letter-spacing: -1.5px;
        }

        /* Grid Layouts */
        .content-wrap {
          max-width: 1200px;
          margin: 60px auto;
          padding: 0 20px;
        }

        .channel-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 80px;
        }

        .card-link { text-decoration: none; color: inherit; display: block; }
        
        .channel-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 20px;
          height: 100%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .channel-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(49, 87, 162, 0.06);
          border-color: rgba(49, 87, 162, 0.2);
        }

        .icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .blue-icon { background: #eff6ff; color: #3157a2; }
        .purple-icon { background: #effdfd; color: #00dfd8; }
        .green-icon { background: #ecfdf5; color: #25d366; }

        /* FAQ Section */
        .faq-section {
          background: white;
          padding: 60px 40px;
          border-radius: 30px;
          margin: 40px auto;
          max-width: 1000px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }

        .category-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 40px;
        }

        .pill {
          padding: 10px 22px;
          border-radius: 100px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.3s;
          font-size: 14px;
        }

        .pill.active {
          background: var(--gradient-main);
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(49, 87, 162, 0.25);
        }

        .faq-item {
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 5px;
        }

        .faq-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 10px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          transition: 0.3s;
        }

        .faq-header:hover { color: var(--primary-blue); }

        .faq-body {
          padding: 0 10px 20px;
          color: var(--text-muted);
          line-height: 1.7;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Extra Info Cards Grid */
        .extra-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 40px;
          margin-bottom: 80px;
        }

        .extra-card {
          background: #ffffff;
          padding: 32px;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .extra-card:hover { 
          border-color: var(--accent-cyan); 
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.04);
        }

        .extra-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 12px; }

        .gradient-text {
          background: var(--gradient-main);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        /* Forms */
        .contact-wrap {
          background: white;
          border-radius: 30px;
          padding: 60px;
          max-width: 900px;
          margin: 80px auto;
          border: 1px solid #f1f5f9;
          box-shadow: 0 20px 50px rgba(0,0,0,0.03);
        }

        /* Modals */
        .bs-modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bs-modal-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          width: 90%;
          max-width: 460px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          text-align: center;
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .contact-wrap { padding: 30px 20px; border-radius: 20px; }
          .extra-grid { grid-template-columns: 1fr !important; }
          .faq-section { border-radius: 20px; padding: 30px 20px; }
        }
      `}</style>

      {/* NAVBAR (100% Consistent with LandingPage) */}
      <nav className="navbar navbar-expand-lg" style={{
          position: 'sticky',
          top: 0,
          zIndex: 1080,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 0',
          display: 'block',
          width: '100%'
      }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              {/* Brand/Logo */}
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <img src="/Bill (1).svg" alt="BillSoft Logo" style={{ height: '50px', marginRight: '12px' }} />
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000000', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px', display: 'flex' }}>
                      Bill<span style={{ color: '#3157a2' }}>Soft</span>
                  </span>
              </a>

              {/* Desktop Navigation Links */}
              <div className="d-none d-lg-flex" style={{ flexGrow: 1, justifyContent: 'center', gap: '35px' }}>
                  <div className="dropdown">
                      <a href="#" className="dropdown-toggle" id="solutionsDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>
                          Solutions
                      </a>
                      <ul className="dropdown-menu border-0 shadow-lg p-3" aria-labelledby="solutionsDropdown" style={{ borderRadius: '15px', minWidth: '250px' }}>
                          <li><h6 className="dropdown-header text-primary fw-bold">By Industry</h6></li>
                          <li><a className="dropdown-item py-2" href="#" onClick={(e) => { e.preventDefault(); navigate('/industry/retail'); }}>Retail & Supermarket</a></li>
                          <li><a className="dropdown-item py-2" href="#" onClick={(e) => { e.preventDefault(); navigate('/industry/restaurant'); }}>Restaurant & Cafe</a></li>
                          <li><a className="dropdown-item py-2" href="#" onClick={(e) => { e.preventDefault(); navigate('/industry/pharmacy'); }}>Pharmacy & Healthcare</a></li>
                          <li><a className="dropdown-item py-2" href="#" onClick={(e) => { e.preventDefault(); navigate('/industry/automobile'); }}>Automobile & Garage</a></li>
                          <li><a className="dropdown-item py-2" href="#" onClick={(e) => { e.preventDefault(); navigate('/industry/textile'); }}>Textile & Apparel</a></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><a className="dropdown-item py-2 fw-bold text-primary" href="/industry" onClick={(e) => { e.preventDefault(); navigate('/industry'); }}>View All 21 Industries</a></li>
                      </ul>
                  </div>
                  <a href="#about" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>About</a>
                  <a href="#features" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>Features</a>
                  <a href="#pricing" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>Pricing</a>

                  <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }} style={{ textDecoration: 'none', color: '#3157a2', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-headset"></i> Support
                  </a>
                  <span 
                      onClick={() => setShowGuideModal(true)} 
                      style={{ cursor: 'pointer', fontWeight: 700, color: '#000', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                      <i className="bi bi-file-earmark-pdf"></i> User Guide
                  </span>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center" style={{ gap: '15px' }}>
                  {user ? (
                      <button
                          className="btn"
                          style={{
                              borderRadius: '50px',
                              background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 28px',
                              fontWeight: 700,
                              fontSize: '15px',
                              boxShadow: '0 4px 12px rgba(49, 87, 162, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                          }}
                          onClick={() => navigate(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard')}
                      >
                          <i className="bi bi-speedometer2"></i> Dashboard
                      </button>
                  ) : (
                      <>
                          <button
                              className="btn"
                              style={{
                                  borderRadius: '50px',
                                  border: '1.5px solid #3157a2',
                                  color: '#3157a2',
                                  padding: '8px 24px',
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  backgroundColor: 'transparent'
                              }}
                              onClick={() => navigate('/login')}
                          >
                              Login
                          </button>
                          <button
                              className="btn d-none d-sm-block"
                              style={{
                                  borderRadius: '50px',
                                  background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 24px',
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  boxShadow: '0 4px 12px rgba(49, 87, 162, 0.3)'
                              }}
                              onClick={() => navigate('/signup')}
                          >
                              Try Free
                          </button>
                      </>
                  )}
                  {/* Mobile Toggle Button */}
                  <button
                      className="navbar-toggler d-lg-none"
                      type="button"
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      aria-label="Toggle navigation"
                      style={{ border: 'none', padding: '5px' }}
                  >
                      <i className="bi bi-list fs-1" style={{ color: '#000' }}></i>
                  </button>
              </div>
          </div>
      </nav>

      {/* MOBILE MENU DRAWER (100% Consistent with LandingPage) */}
      <div 
          className={`landing-mobile-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div className={`landing-mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="drawer-header">
              <img src="/logo.svg" alt="BillSoft Logo" style={{ height: '40px' }} />
              <button className="close-drawer" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="bi bi-x-lg"></i>
              </button>
          </div>
          <div className="drawer-body">
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); }}>Home</a>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 150); }}>About Us</a>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 150); }}>Features</a>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 150); }}>Pricing</a>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 150); }}>Contact</a>
              <hr />
              <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); setIsMobileMenuOpen(false); }} style={{ color: '#3157a2' }}>Support Hub</a>
              <span onClick={() => { setShowGuideModal(true); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer', display: 'block', padding: '10px 0', fontWeight: 'bold' }}>User Guide</span>
              <div className="mt-auto pt-4">
                  <button className="btn btn-try-now w-100 py-3" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Try BillSoft For Free</button>
              </div>
          </div>
      </div>

      {/* HERO SECTION WITH CONSISTENT AURA AND LIGHT GRADIENT */}
      <header className="support-hero">
        <h1 className="hero-title" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>How can we help?</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', fontWeight: 500 }}>
          Search our knowledge base or reach out to our dedicated support team.
        </p>
        <div className="search-area shadow-lg" style={{
            maxWidth: '600px',
            margin: '40px auto 0',
            position: 'absolute',
            left: '50%',
            bottom: '-32px',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            zIndex: 10,
            background: 'white',
            borderRadius: '100px',
            padding: '6px 12px 6px 24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }}>
          <i className="fas fa-search text-primary" style={{ fontSize: '18px' }}></i>
          <input
            type="text"
            placeholder="Search for answers (e.g. GST, Inventory, Backup)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '16px',
                padding: '12px 0',
                fontWeight: 500,
                backgroundColor: 'transparent'
            }}
          />
        </div>
      </header>

      {/* CHANNELS SECTION */}
      <main className="content-wrap">
        <div className="channel-cards">
          <a href="tel:+919069074780" className="card-link">
            <div className="channel-card">
              <div className="icon-circle blue-icon"><i className="fas fa-headset"></i></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Tech Support</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Call us: +91 90690 74780</p>
              </div>
            </div>
          </a>
          <a href="mailto:support@agbtechnologies.com" className="card-link">
            <div className="channel-card">
              <div className="icon-circle purple-icon"><i className="fas fa-envelope-open-text"></i></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Email Inquiry</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>support@agbtechnologies.com</p>
              </div>
            </div>
          </a>
          <a href="https://wa.me/9069074780" target="_blank" rel="noreferrer" className="card-link">
            <div className="channel-card">
              <div className="icon-circle green-icon"><i className="fab fa-whatsapp"></i></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>WhatsApp</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Chat with our experts</p>
              </div>
            </div>
          </a>
        </div>

        {/* ACCORDION FAQ SECTION */}
        <section className="faq-section">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px', fontFamily: "'Outfit', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="category-filters">
              {categories.map(cat => (
                <button key={cat.id} className={`pill ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="faq-accordion">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <div key={idx} className="faq-item">
                  <button className="faq-header" onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}>
                    <span>{faq.question}</span>
                    <i className={`fas fa-chevron-${expandedFaq === idx ? 'up' : 'down'}`} style={{ color: expandedFaq === idx ? 'var(--primary-blue)' : '#94a3b8' }}></i>
                  </button>
                  {expandedFaq === idx && <div className="faq-body" style={{ fontWeight: 500 }}>{faq.answer}</div>}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fas fa-search" style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.2 }}></i>
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </section>

        {/* CUSTOMIZATION AND UPDATES EXTRA CARDS */}
        <div className="extra-grid">
          <div className="extra-card">
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="gradient-text">Customization Requests</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontWeight: 500, margin: '8px 0 20px 0' }}>
              Need a tailored billing workflow or a custom report? Our engineers can build specialized modules exactly for your business logic.
            </p>
            <div onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} style={{ color: 'var(--primary-blue)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Contact for Customization <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          <div className="extra-card">
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="gradient-text">Product Updates</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontWeight: 500, margin: '8px 0 20px 0' }}>
              Stay ahead with the latest feature releases, tax compliance updates, and security patches. Join our monthly newsletter.
            </p>
            <a href="https://agbtechnologies.com/newsletter" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--primary-blue)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Join Product Newsletter <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>

        {/* DROP US A MESSAGE BRANDED FORM */}
        <section className="contact-wrap">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '14px', letterSpacing: '-1px', fontFamily: "'Outfit', sans-serif" }}>Drop us a message</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: 500 }}>Our technical team usually responds within 24 business hours.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              <div>
                <label style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#000' }}>Full Name</label>
                <input type="text" className="form-control py-3 rounded-pill" placeholder="e.g. Rahul Sharma" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#000' }}>Email Address</label>
                <input type="email" className="form-control py-3 rounded-pill" placeholder="name@company.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#000' }}>How can we help?</label>
              <select className="form-select py-3 rounded-pill" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option>General Inquiry</option>
                <option>Technical Issue</option>
                <option>Customization Request</option>
                <option>Feature Feedback</option>
                <option>Billing & Subscription</option>
              </select>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <label style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#000' }}>Message Details</label>
              <textarea rows={6} className="form-control py-3" style={{ borderRadius: '20px' }} placeholder="Describe your issue or request in detail..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
            </div>
            <button type="submit" className="btn btn-primary py-3 rounded-pill w-100 fw-bold" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)', border: 'none', color: '#fff', fontSize: '16px', boxShadow: '0 4px 12px rgba(49, 87, 162, 0.3)' }}>
              {isSubmitting ? <><i className="fas fa-spinner fa-spin me-2"></i> Processing Request...</> : 'Send Support Message'}
            </button>
          </form>
        </section>
      </main>

      {/* FOOTER (100% Consistent with LandingPage) */}
      <footer className="footer bg-dark text-white py-5">
          <div className="container text-center">
              <p className="mb-3 opacity-50 small">&copy; 2026 BillSoft India. Powered by AGB TECHNOLOGIES LLP</p>
              <div className="d-flex justify-content-center flex-wrap gap-4">
                  <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }} className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Support Hub</a>
                  <a href="/privacy-policy.html" target="_blank" className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Privacy Policy</a>
                  <a href="/refund-policy.html" target="_blank" className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Refund Policy</a>
                  <a href="/terms-of-use.html" target="_blank" className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Terms of Use</a>
              </div>
          </div>
      </footer>

      {/* MODALS */}
      {showGuideModal && (
        <div className="bs-modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="bs-modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowGuideModal(false)}><i className="fas fa-times"></i></button>
            <div style={{ width: '70px', height: '70px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#2563eb', margin: '0 auto 25px' }}>
              <i className="fas fa-file-pdf"></i>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px', fontFamily: "'Outfit', sans-serif" }}>User Guide</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontWeight: 500 }}>Enter your email to download the complete BillSoft manual.</p>
            <form onSubmit={handleModalSubmit}>
              <input type="email" className="form-control mb-3 py-3 rounded-pill text-center" placeholder="Enter your email" required style={{ border: '1px solid #e2e8f0' }} />
              <button type="submit" className="btn btn-primary py-3 rounded-pill w-100 fw-bold" style={{ background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)', border: 'none', color: '#fff', fontSize: '15px' }}>Download PDF Guide</button>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal.show && (
        <div className="bs-modal-overlay" onClick={() => setShowSuccessModal({ ...showSuccessModal, show: false })}>
          <div className="bs-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ width: '70px', height: '70px', background: '#f0fdf4', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#22c55e', margin: '0 auto 25px' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px', fontFamily: "'Outfit', sans-serif" }}>{showSuccessModal.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontWeight: 500 }}>{showSuccessModal.text}</p>
            <button onClick={() => setShowSuccessModal({ ...showSuccessModal, show: false })} className="btn btn-primary py-3 rounded-pill w-100 fw-bold" style={{ background: '#22c55e', border: 'none', color: '#fff', fontSize: '15px', boxShadow: '0 10px 20px rgba(34,197,94,0.2)' }}>
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
