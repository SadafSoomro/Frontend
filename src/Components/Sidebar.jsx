import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  ShoppingCart,
  Wallet,
  Settings,
  Image,
  LogIn,
  UserPlus,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuSections = [
    {
      title: 'Navigation',
      items: [
        { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin', end: true }
      ]
    },
    {
      title: 'Authentication',
      items: [
        { id: 'login', icon: <LogIn size={18} />, label: 'Login', path: '/login' },
        { id: 'register', icon: <UserPlus size={18} />, label: 'Register', path: '/signup' }
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
        { id: 'wallet', icon: <Wallet size={18} />, label: 'Wallet', path: '/admin/wallet' }
      ]
    },
    {
      title: 'Support',
      items: [
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
