import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, TrendingUp, RefreshCw, DollarSign, Package } from 'lucide-react';
import { fetchAllOrdersApi } from '../../API/api';
import './Wallet.css';

const Wallet = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchAllOrdersApi();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate wallet amount (sum of grandTotal for all delivered orders)
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalAmount = deliveredOrders.reduce((sum, order) => sum + Number(order.grandTotal), 0);
  
  // Calculate this month's revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOrders = deliveredOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthAmount = thisMonthOrders.reduce((sum, order) => sum + Number(order.grandTotal), 0);

  return (
    <div className="wallet-page animate-fade-in">
      <div className="page-header">
        <div className="header-text">
          <h1>Wallet</h1>
          <p className="text-secondary">Track revenue from all delivered orders.</p>
        </div>
        <button className="secondary" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="wallet-dashboard">
        <div className="wallet-main-card">
          <div className="wallet-icon-wrapper">
            <WalletIcon size={32} />
          </div>
          <div className="wallet-info">
            <p className="wallet-label">Total Revenue (Delivered)</p>
            <h2 className="wallet-balance">Rs. {totalAmount.toLocaleString()}</h2>
          </div>
        </div>

        <div className="wallet-stats-grid">
          <div className="wallet-stat-card">
            <div className="stat-header">
              <TrendingUp size={20} className="stat-icon" style={{ color: '#22c55e' }} />
              <span>This Month</span>
            </div>
            <h3 className="stat-value">Rs. {thisMonthAmount.toLocaleString()}</h3>
            <p className="stat-desc">From {thisMonthOrders.length} delivered orders</p>
          </div>
          
          <div className="wallet-stat-card">
            <div className="stat-header">
              <Package size={20} className="stat-icon" style={{ color: '#3b82f6' }} />
              <span>Total Delivered</span>
            </div>
            <h3 className="stat-value">{deliveredOrders.length}</h3>
            <p className="stat-desc">Orders successfully completed</p>
          </div>

          <div className="wallet-stat-card">
            <div className="stat-header">
              <DollarSign size={20} className="stat-icon" style={{ color: '#f59e0b' }} />
              <span>Average Order Value</span>
            </div>
            <h3 className="stat-value">
              Rs. {deliveredOrders.length ? Math.round(totalAmount / deliveredOrders.length).toLocaleString() : 0}
            </h3>
            <p className="stat-desc">Across all delivered orders</p>
          </div>
        </div>
      </div>

      <div className="wallet-recent-transactions glass-card">
        <h3>Recent Delivered Orders</h3>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading transactions...</p>
        ) : deliveredOrders.length === 0 ? (
          <div className="empty-wallet">
            <Package size={48} />
            <p>No delivered orders yet to accumulate money.</p>
          </div>
        ) : (
          <table className="wallet-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date Delivered</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {deliveredOrders.slice(0, 10).map(order => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id">{order.trackingNumber}</span>
                  </td>
                  <td>{order.user?.name || 'Guest'}</td>
                  <td>{new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</td>
                  <td className="amount-cell">+ Rs. {Number(order.grandTotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Wallet;
