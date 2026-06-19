import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  ShoppingCart,
  Wallet,
  Settings,
  Image,
  LogOut,
  UserCircle,
  HelpCircle,
  Sparkles,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Navigation',
      items: [
        { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin', end: true }
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', icon: <UserCircle size={18} />, label: 'My Profile', path: '/admin/profile' },
      ]
    },
    {
      title: 'Store & Inventory',
      items: [
        { id: 'banners', icon: <Image size={18} />, label: 'Banners', path: '/admin/banners' },
        { id: 'products', icon: <Package size={18} />, label: 'Products', path: '/admin/products' },
        { id: 'categories', icon: <Layers size={18} />, label: 'Categories', path: '/admin/categories' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'users', icon: <Users size={18} />, label: 'Users', path: '/admin/users' },
        { id: 'orders', icon: <ShoppingCart size={18} />, label: 'Orders', path: '/admin/orders' },
        { id: 'coupons', icon: <Tag size={18} />, label: 'Coupons', path: '/admin/coupons' },
        { id: 'sales', icon: <Sparkles size={18} />, label: 'Sales', path: '/admin/sales' },
        { id: 'wallet', icon: <Wallet size={18} />, label: 'Wallet', path: '/admin/wallet' }
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'chat', icon: <MessageCircle size={18} />, label: 'Chat', path: '/admin/chat' },
        { id: 'settings', icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
        { id: 'documentation', icon: <HelpCircle size={18} />, label: 'Documentation', path: '/admin/settings', dummy: true }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Makskin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuSections.map((section, idx) => (
          <div key={idx} className="sidebar-section">
            <h4 className="sidebar-section-title">{section.title}</h4>
            <ul>
              {section.items.map((item) => (
                <li key={item.id}>
                  {item.dummy ? (
                    <div className="nav-item dummy">
                      <span className="nav-icon-wrapper">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <span className="nav-icon-wrapper">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info" style={{ padding: '0 1rem 0.75rem', fontSize: '0.8rem' }}>
          <span style={{ display: 'block', fontWeight: 600 }}>{user?.name || 'Guest Admin'}</span>
          <span style={{ display: 'block', opacity: 0.6, fontSize: '0.7rem', wordBreak: 'break-all' }}>{user?.email || 'admin@makskin.com'}</span>
          <span style={{
            display: 'inline-block',
            marginTop: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: (user?.role || 'admin') === 'admin' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            color: (user?.role || 'admin') === 'admin' ? '#22c55e' : '#f59e0b',
            border: (user?.role || 'admin') === 'admin' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            {(user?.role || 'admin') === 'admin' ? 'Admin Role' : 'User Role'}
          </span>
        </div>
        <button className="nav-item" onClick={() => { handleLogout(); if (onClose) onClose(); }} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', color: 'inherit' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <div className="mantis-pro-card">
          <div className="pro-illustration">
            <Sparkles size={24} className="pro-icon" />
          </div>
          <h4>Makskin Pro</h4>
          <p>Checkout pro features</p>
          <button className="pro-badge-btn">Pro</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
