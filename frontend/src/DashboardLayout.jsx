import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from './context/AuthContext';

const DashboardLayout = ({ role, children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const menuButtonRef = useRef();
  const sidebarRef = useRef();
  
  // Use state for mobile detection with proper resize handling
  const [isMobile, setIsMobile] = useState(() => {
    // Check if window is available (for SSR compatibility)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  
  // Initialize sidebar state - open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check localStorage first for saved preference
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem('sidebarOpen');
      if (savedState !== null) {
        return JSON.parse(savedState);
      }
    }
    // Default: open on desktop, closed on mobile
    return !isMobile;
  });

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen]);
  
  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // Auto-close sidebar when switching to mobile
      if (newIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);
  
  // Close sidebar on mobile when route changes, but keep desktop state
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Toggle sidebar
  const toggleSidebar = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && 
          sidebarOpen &&
          sidebarRef.current && 
          !sidebarRef.current.contains(e.target) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // Role-based navigation links
  const getRoleLinks = () => {
    const baseLinks = [
      { to: "/profile", icon: "👤", label: "My Profile" }
    ];

    // Convert role to lowercase for case-insensitive comparison
    const normalizedRole = role?.toLowerCase();

    switch(normalizedRole) {
      case 'admin':
        return [
          { to: "/admindashboard", icon: "📊", label: "Dashboard" },
          ...baseLinks,
          { to: "/members", icon: "👥", label: "Member Management" },
          { to: "/contributions", icon: "💰", label: "Contributions" },
          { to: "/loans", icon: "🏦", label: "Loan Management" },
          { to: "/lottery", icon: "🎟️", label: "Lottery System" },
          { to: "/penalties", icon: "⚖️", label: "Penalties" },
          { to: "/reports", icon: "📈", label: "Financial Reports" }
        ];
      
      case 'finance':
        return [
          { to: "/financedashboard", icon: "📊", label: "Dashboard" },
          ...baseLinks,
          { to: "/transactions", icon: "💸", label: "Transactions" },
          { to: "/reports", icon: "📊", label: "Financial Reports" },
          { to: "/audit", icon: "🔍", label: "Audit Trail" },
          { to: "/monthly-summary", icon: "📅", label: "Monthly Summary" }
        ];
      
      case 'member':
        return [
          { to: "/memberdashboard", icon: "📊", label: "Dashboard" },
          ...baseLinks,
          { to: "/my-contributions", icon: "💰", label: "My Contributions" },
          { to: "/reports", icon: "📈", label: "Financial Reports" },
          { to: "/my-loans", icon: "🏦", label: "My Loans" },
          { to: "/lottery-status", icon: "🎟️", label: "Lottery Status" },
          { to: "/my-penalties", icon: "⚠️", label: "My Penalties" }
        ];
      
      default:
        return [
          { to: "/memberdashboard", icon: "📊", label: "Dashboard" },
          ...baseLinks
        ];
    }
  };

  // Handle overlay click to close sidebar
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  console.log('Rendering with sidebarOpen:', sidebarOpen, 'isMobile:', isMobile);

  // Close sidebar when clicking on a nav item on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Mobile Menu Button - Always visible on mobile */}
      <button 
        ref={menuButtonRef}
        className="mobile-menu-button"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay - Only shown when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`sidebar ${sidebarOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`} 
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <h2 className={sidebarOpen ? '' : 'hidden'}>UBUMWE MIS</h2>
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav" onClick={handleNavClick}>
          {getRoleLinks().map((link) => (
            <NavItem 
              key={link.to} 
              to={link.to} 
              icon={link.icon} 
              label={link.label} 
            />
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <ProfileButton role={role} user={user} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-content">
            <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
            <div className="topbar-actions">
              <button className="notification-btn">
                🔔
            
              </button>
              <ProfileButton role={role} user={user} />
            </div>
          </div>
        </header>
        
        <div className="content-area">
          <Outlet />
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''}`
      }
    >
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
};

const ProfileButton = ({ role, user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="profile-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }} ref={ref}>
      <div className="profile-avatar" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>👤</div>
      <div className="profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="profile-name" style={{ color: '#111', fontWeight: 600 }}>{user?.username || user?.name || 'Member Name'}</span>
      <span className="profile-role">{role}</span>
    </div>
      {open && (
        <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', boxShadow: '0 2px 8px #bbb', borderRadius: 8, minWidth: 160, zIndex: 10, padding: 8 }}>
          <button
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: '10px 0', fontWeight: 500, textAlign: 'left' }}
            onClick={() => { setOpen(false); navigate('/profile'); }}
          >
            My Profile
          </button>
          <button
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '10px 0', fontWeight: 500, textAlign: 'left' }}
            onClick={() => { setOpen(false); logout(); navigate('/login'); }}
          >
            Logout
          </button>
        </div>
      )}
  </div>
);
};

export default DashboardLayout;