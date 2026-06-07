import React from 'react';
import { Mail, Bell, ShoppingCart, Truck, Plane } from 'lucide-react';
import './RightPanel.css';

const paymentHistory = [
  {
    id: 1,
    name: 'Vitamin C Serum',
    amount: 'Rs 2,499',
    date: '4th, May, 2025',
    img: 'https://images.unsplash.com/photo-1620916566395-044f9003ced4?w=80&h=80&fit=crop',
  },
  {
    id: 2,
    name: 'Hydrating Moisturizer',
    amount: 'Rs 1,899',
    date: '2nd, May, 2025',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop',
  },
];

const activities = [
  { id: 1, label: 'Order', percent: 48, icon: <ShoppingCart size={16} /> },
  { id: 2, label: 'Shipping', percent: 35, icon: <Truck size={16} /> },
  { id: 3, label: 'By Air Shipping', percent: 75, icon: <Plane size={16} /> },
];

const RightPanel = () => {
  return (
    <aside className="right-panel">
      <div className="right-panel-header">
        <button className="rp-icon-btn" aria-label="Messages">
          <Mail size={20} />
        </button>
        <button className="rp-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="rp-notification-dot" />
        </button>
      </div>

      <div className="rp-profile">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
          alt="Admin"
          className="rp-avatar"
        />
        <div>
          <h3>Emily Connor</h3>
          <p>Store Admin</p>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-card-top">
          <span className="rp-card-type">Revenue Card</span>
          <div className="rp-card-logo">
            <span className="rp-circle red" />
            <span className="rp-circle orange" />
          </div>
        </div>
        <p className="rp-card-number">**** **** **** 5467</p>
        <p className="rp-card-name">EMILY CONNOR</p>
      </div>

      <div className="rp-limit">
        <div className="rp-limit-header">
          <span>Weekly Revenue Limit</span>
          <span className="rp-limit-value">Rs 120,000 / Rs 234,000</span>
        </div>
        <div className="rp-progress-bar">
          <div className="rp-progress-fill" style={{ width: '51%' }} />
        </div>
      </div>

      <div className="rp-section">
        <h4>Payment History</h4>
        <div className="rp-payment-list">
          {paymentHistory.map((item) => (
            <div key={item.id} className="rp-payment-item">
              <img src={item.img} alt={item.name} />
              <div className="rp-payment-info">
                <span className="rp-payment-name">{item.name}</span>
                <span className="rp-payment-amount">Received {item.amount}</span>
              </div>
              <span className="rp-payment-date">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rp-section">
        <h4>Recent Activities</h4>
        <div className="rp-activities">
          {activities.map((item) => (
            <div key={item.id} className="rp-activity-item">
              <div className="rp-activity-header">
                <span className="rp-activity-icon">{item.icon}</span>
                <span className="rp-activity-label">{item.label}</span>
                <span className="rp-activity-percent">{item.percent}%</span>
              </div>
              <div className="rp-activity-bar">
                <div className="rp-activity-fill" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
