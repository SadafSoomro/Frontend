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
  ChevronRight

} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
    { id: 'banners', icon: <Image size={20} />, label: 'Banners', path: '/admin/banners' },
    { id: 'products', icon: <Package size={20} />, label: 'Products', path: '/admin/products' },
    { id: 'categories', icon: <Layers size={20} />, label: 'Categories', path: '/admin/categories' },
    { id: 'users', icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { id: 'orders', icon: <ShoppingCart size={20} />, label: 'Orders', path: '/admin/orders' },

    { id: 'wallet', icon: <Wallet size={20} />, label: 'Wallet', path: '/admin/wallet' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <span className="logo-text">SkinCare<span className="dot">.</span></span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end
              >
                <div className="nav-icon-wrapper">
                  {item.icon}
                </div>
                <span className="nav-label">{item.label}</span>
                {item.id === 'overview' && <div className="active-glow"></div>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" alt="User Avatar" />
            <div className="status-indicator"></div>
          </div>
          <div className="user-info">
            <span className="user-name">Emily Connor</span>
            <span className="user-role">Admin</span>
          </div>
          <ChevronRight size={16} className="profile-chevron" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
