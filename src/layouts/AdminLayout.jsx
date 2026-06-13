import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Search, Sun, Moon, Bell, Menu } from 'lucide-react';
import './AdminLayout.css';
import '../Styles/CrudPage.css';

const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const AdminLayout = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    document.body.className = `admin-body ${theme}`;
    localStorage.setItem('theme', theme);
    return () => {
      document.body.className = '';
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`admin-layout ${theme} ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <Sidebar />
      <div className="dashboard-body">
        <main className="main-wrapper">
          <header className="top-bar">
            <div className="header-left">
              <button className="menu-toggle-btn" onClick={toggleSidebar} title="Toggle Sidebar">
                <Menu size={20} />
              </button>
              <div className="header-search">
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search..." aria-label="Search" />
                <span className="search-shortcut">Ctrl + K</span>
              </div>
            </div>

            <div className="header-right">
              <button className="header-icon-btn" onClick={toggleTheme} title="Toggle Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="header-icon-btn" title="GitHub">
                <GithubIcon />
              </a>
              <div className="notification-wrapper">
                <button className="header-icon-btn" title="Notifications">
                  <Bell size={18} />
                  <span className="notification-badge">2</span>
                </button>
              </div>
              <div className="header-profile" title={user?.email || 'admin@makskin.com'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`}
                  alt={user?.name || 'Profile'}
                  className="header-avatar"
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name || 'Guest Admin'}</span>
                  <span style={{ fontSize: '0.65rem', color: (user?.role || 'admin') === 'admin' ? '#22c55e' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                    {user?.role || 'admin'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section className="page-content">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
