import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RotateCcw,
  Lock,
  ArrowLeft,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { fetchMyOrdersApi, cancelMyOrderApi } from '../../API/api';
import '../Landing/LandingPage.css';
import './MyOrders.css';

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  confirmed: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className="my-order-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="status-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [cancellingId, setCancellingId] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchMyOrdersApi();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleRow = (id) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingId(id);
    try {
      const { data } = await cancelMyOrderApi(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: data.status } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId('');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const paymentLabel = (method) =>
    method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Card' : 'Bank Transfer';

  const currentOrders = orders.filter((o) => o.status === 'pending');
  const pastOrders = orders.filter((o) => o.status !== 'pending');

  const renderOrderCard = (order) => (
    <div className="my-order-card" key={order._id}>
      <div className="my-order-card-header">
        <button
          type="button"
          className="my-order-expand-btn"
          onClick={() => toggleRow(order._id)}
          aria-expanded={!!expandedRows[order._id]}
        >
          {expandedRows[order._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <div className="my-order-main-info">
          <span className="my-order-tracking">{order.trackingNumber}</span>
          <span className="my-order-date">{formatDate(order.createdAt)}</span>
        </div>

        <div className="my-order-meta">
          <span className="my-order-total">Rs.{Number(order.grandTotal).toLocaleString()}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="my-order-summary-row">
        <span>{(order.items || []).length} item(s)</span>
        <span>{paymentLabel(order.paymentMethod)}</span>
        {order.shippingInfo?.city && <span>{order.shippingInfo.city}</span>}
      </div>

      {order.status === 'pending' && (
        <div className="my-order-actions">
          <button
            type="button"
            className="cancel-order-btn"
            onClick={() => handleCancel(order._id)}
            disabled={cancellingId === order._id}
          >
            <XCircle size={14} />
            {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}

      {expandedRows[order._id] && (
        <div className="my-order-details">
          <div className="my-order-shipping">
            <span>Ship to</span>
            <p>
              {order.shippingInfo?.address || '—'}
              {order.shippingInfo?.city ? `, ${order.shippingInfo.city}` : ''}
              {order.shippingInfo?.zipCode ? ` (${order.shippingInfo.zipCode})` : ''}
            </p>
          </div>

          <p className="my-order-items-title">Items</p>
          <div className="my-order-items-list">
            {(order.items || []).map((item, idx) => (
              <div className="my-order-item-row" key={`${order._id}-${idx}`}>
                {item.img && <img src={item.img} alt={item.name} />}
                <div className="my-order-item-info">
                  <p>{item.name}</p>
                  <span>{item.brand}</span>
                </div>
                <span className="my-order-item-qty">×{item.quantity}</span>
                <span className="my-order-item-price">
                  Rs.{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="my-order-totals">
            <div><span>Subtotal</span><span>Rs.{Number(order.subtotal).toLocaleString()}</span></div>
            {order.discountAmount > 0 && (
              <div className="discount-line">
                <span>Discount ({order.promoCode})</span>
                <span>- Rs.{Number(order.discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div>
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `Rs.${Number(order.shippingFee).toLocaleString()}`}</span>
            </div>
            <div className="grand-line">
              <span>Total</span>
              <span>Rs.{Number(order.grandTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="my-orders-page-layout">
      <div className="benefit-ribbon">
        <div className="benefit-item"><ShieldCheck size={14} /><span>Authentic Products</span></div>
        <div className="benefit-item"><RotateCcw size={14} /><span>Easy Returns</span></div>
        <div className="benefit-item"><Lock size={14} /><span>Secure Payment</span></div>
      </div>

      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="brand-logo-container">
            <span className="logo-text-box">makskin</span>
          </Link>
          <div className="my-orders-header-title">
            <Package size={16} />
            <span>My Orders</span>
          </div>
          <div className="header-actions">
            <Link to="/" className="action-icon-btn back-store-btn" title="Back to Shop">
              <ArrowLeft size={16} /> <span className="back-store-text">Back to Store</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="my-orders-main">
        <div className="my-orders-toolbar">
          <div>
            <h1>Your Orders</h1>
            <p>Track current and previous orders with live status updates.</p>
          </div>
          <button type="button" className="refresh-orders-btn" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && <div className="my-orders-error">{error}</div>}

        {loading ? (
          <p className="my-orders-loading">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="my-orders-empty">
            <Package size={48} />
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here with its status.</p>
            <Link to="/" className="shop-now-btn">Start Shopping</Link>
          </div>
        ) : (
          <>
            {currentOrders.length > 0 && (
              <section className="my-orders-section">
                <h2>Current Orders ({currentOrders.length})</h2>
                <div className="my-orders-list">{currentOrders.map(renderOrderCard)}</div>
              </section>
            )}

            {pastOrders.length > 0 && (
              <section className="my-orders-section">
                <h2>Previous Orders ({pastOrders.length})</h2>
                <div className="my-orders-list">{pastOrders.map(renderOrderCard)}</div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
