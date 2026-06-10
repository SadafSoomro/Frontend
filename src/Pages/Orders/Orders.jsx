import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Trash, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Package
} from 'lucide-react';
import { fetchAllOrdersApi, updateOrderStatusApi, deleteOrderApi } from '../../API/api';

const statusConfig = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  confirmed: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: '0.78rem',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

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

  useEffect(() => { fetchOrders(); }, []);

  const toggleRow = (id) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await updateOrderStatusApi(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: data.status } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order permanently? This cannot be undone.')) return;
    try {
      await deleteOrderApi(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const paymentLabel = (method) =>
    method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Card' : 'Bank Transfer';

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered' || o.status === 'confirmed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Orders</h1>
          <p className="text-secondary">View and manage all customer orders.</p>
        </div>
        <button className="secondary" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Orders', value: orders.length, color: 'var(--accent-primary)' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b' },
          { label: 'Delivered', value: deliveredCount, color: '#22c55e' },
          { label: 'Cancelled', value: cancelledCount, color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '1rem 1.5rem', flex: '1', minWidth: 120 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card table-section">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ opacity: 0.5 }}>No orders yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td>
                      <button
                        onClick={() => toggleRow(order._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                        title="View items"
                      >
                        {expandedRows[order._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem',
                        color: 'var(--accent-primary)', letterSpacing: '0.5px',
                      }}>
                        {order.trackingNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.user?.name || '—'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{order.user?.email || ''}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>Rs.{Number(order.grandTotal).toLocaleString()}</div>
                      {order.discountAmount > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>
                          -{order.discountPercent}% off ({order.promoCode})
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {paymentLabel(order.paymentMethod)}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td>
                      <div className="action-btns" style={{ flexWrap: 'wrap', gap: '4px' }}>
                        {order.status === 'pending' && (
                          <>
                            <button
                              className="icon-btn-small"
                              style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}
                              onClick={() => handleStatusChange(order._id, 'delivered')}
                              title="Mark as delivered"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              className="icon-btn-small"
                              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                              onClick={() => handleStatusChange(order._id, 'cancelled')}
                              title="Cancel order"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {(order.status === 'delivered' || order.status === 'confirmed') && (
                          <button
                            className="icon-btn-small"
                            style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
                            onClick={() => handleStatusChange(order._id, 'pending')}
                            title="Mark as pending"
                          >
                            <Clock size={15} />
                          </button>
                        )}
                        {(order.status === 'delivered' || order.status === 'confirmed') && (
                          <button
                            className="icon-btn-small"
                            style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                            onClick={() => handleStatusChange(order._id, 'cancelled')}
                            title="Cancel order"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                        {order.status === 'cancelled' && (
                          <>
                            <button
                              className="icon-btn-small"
                              style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
                              onClick={() => handleStatusChange(order._id, 'pending')}
                              title="Mark as pending"
                            >
                              <Clock size={15} />
                            </button>
                            <button
                              className="icon-btn-small"
                              style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}
                              onClick={() => handleStatusChange(order._id, 'delivered')}
                              title="Mark as delivered"
                            >
                              <CheckCircle size={15} />
                            </button>
                          </>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(order._id)}
                          title="Delete order"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row — Order Items */}
                  {expandedRows[order._id] && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                        <div style={{
                          background: 'var(--glass-bg)',
                          borderRadius: 8,
                          margin: '0 0.5rem 0.75rem',
                          padding: '1rem 1.25rem',
                          borderLeft: '3px solid var(--accent-primary)',
                        }}>
                          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ship To</span>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {order.shippingInfo?.address || '—'}, {order.shippingInfo?.city || ''}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Rs.{Number(order.subtotal).toLocaleString()}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Shipping</span>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {order.shippingFee === 0 ? 'FREE' : `Rs.${Number(order.shippingFee).toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items Ordered</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'var(--card-bg)', borderRadius: 8, padding: '8px 12px',
                              }}>
                                {item.img && (
                                  <img
                                    src={item.img}
                                    alt={item.name}
                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.brand}</p>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>×{item.quantity}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rs.{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
