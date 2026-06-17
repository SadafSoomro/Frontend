import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Trash, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Package, Truck
} from 'lucide-react';
import { fetchAllOrdersApi, updateOrderStatusApi, deleteOrderApi } from '../../API/api';

const statusConfig = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  delivered: { label: 'Dispatched', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.78rem',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const ActionButton = ({ onClick, color, icon, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      border: `1px solid ${color}55`, borderRadius: 6,
      padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: `${color}12`, color,
      opacity: disabled ? 0.55 : 1,
      transition: 'all 0.18s', whiteSpace: 'nowrap',
    }}
  >
    {icon} {label}
  </button>
);

const Orders = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [updatingId, setUpdatingId]   = useState('');

  const fetchOrders = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await fetchAllOrdersApi();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const toggleRow = (id) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await updateOrderStatusApi(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: data.status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally { setUpdatingId(''); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await deleteOrderApi(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const paymentLabel = (m) =>
    m === 'cod' ? 'Cash on Delivery' : m === 'card' ? 'Card' : 'Bank';

  const counts = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const renderActions = (order) => {
    const busy = updatingId === order._id;
    return (
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>

        {/* ── PENDING: Confirm or Cancel ── */}
        {order.status === 'pending' && (
          <>
            <ActionButton
              onClick={() => handleStatusChange(order._id, 'confirmed')}
              color="#3b82f6" icon={<CheckCircle size={13} />}
              label="Confirm" disabled={busy}
            />
            <ActionButton
              onClick={() => handleStatusChange(order._id, 'cancelled')}
              color="#ef4444" icon={<XCircle size={13} />}
              label="Cancel" disabled={busy}
            />
          </>
        )}

        {/* ── CONFIRMED: Deliver or Cancel ── */}
        {order.status === 'confirmed' && (
          <>
            <ActionButton
              onClick={() => handleStatusChange(order._id, 'delivered')}
              color="#22c55e" icon={<Truck size={13} />}
              label="Dispatch" disabled={busy}
            />
            <ActionButton
              onClick={() => handleStatusChange(order._id, 'cancelled')}
              color="#ef4444" icon={<XCircle size={13} />}
              label="Cancel" disabled={busy}
            />
          </>
        )}

        {/* ── DELIVERED: Revert only ── */}
        {order.status === 'delivered' && (
          <ActionButton
            onClick={() => handleStatusChange(order._id, 'pending')}
            color="#f59e0b" icon={<Clock size={13} />}
            label="Revert" disabled={busy}
          />
        )}

        {/* ── CANCELLED: Revert only ── */}
        {order.status === 'cancelled' && (
          <ActionButton
            onClick={() => handleStatusChange(order._id, 'pending')}
            color="#f59e0b" icon={<Clock size={13} />}
            label="Revert" disabled={busy}
          />
        )}

        {/* Delete always available */}
        <button
          onClick={() => handleDelete(order._id)}
          title="Delete order"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6,
            padding: '5px 8px', fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            transition: 'all 0.18s',
          }}
        >
          <Trash size={13} />
        </button>
      </div>
    );
  };

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

      {/* ── Quick Stats ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total',     value: counts.total,     color: 'var(--accent-primary)' },
          { label: 'Pending',   value: counts.pending,   color: '#f59e0b' },
          { label: 'Confirmed', value: counts.confirmed, color: '#3b82f6' },
          { label: 'Delivered', value: counts.delivered, color: '#22c55e' },
          { label: 'Cancelled', value: counts.cancelled, color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '1rem 1.5rem', flex: '1', minWidth: 100 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</p>
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
                  <tr style={{ opacity: updatingId === order._id ? 0.6 : 1, transition: 'opacity 0.2s' }}>
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
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent-primary)' }}>
                        {order.trackingNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{order.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.user?.email || ''}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>Rs.{Number(order.grandTotal).toLocaleString()}</div>
                      {order.discountAmount > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#22c55e' }}>
                          -{order.discountPercent}% ({order.promoCode})
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {paymentLabel(order.paymentMethod)}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td>{renderActions(order)}</td>
                  </tr>

                  {/* ── Expanded Items Row ── */}
                  {expandedRows[order._id] && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                        <div style={{
                          background: 'var(--glass-bg)', borderRadius: 8,
                          margin: '0 0.5rem 0.75rem', padding: '1rem 1.25rem',
                          borderLeft: '3px solid var(--accent-primary)',
                        }}>
                          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Ship To</span>
                              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '2px 0 0' }}>
                                {order.shippingInfo?.firstName || ''} {order.shippingInfo?.lastName || ''}<br />
                                {order.shippingInfo?.address || '—'}, {order.shippingInfo?.city || ''}
                                {order.shippingInfo?.phone ? ` · ${order.shippingInfo.phone}` : ''}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '2px 0 0' }}>Rs.{Number(order.subtotal).toLocaleString()}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Shipping</span>
                              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '2px 0 0' }}>
                                {order.shippingFee === 0 ? 'FREE' : `Rs.${Number(order.shippingFee).toLocaleString()}`}
                              </p>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Items Ordered
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'var(--card-bg)', borderRadius: 8, padding: '8px 12px',
                              }}>
                                {item.img && (
                                  <img src={item.img} alt={item.name}
                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                                )}
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{item.name}</p>
                                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>{item.brand}</p>
                                </div>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>×{item.quantity}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Rs.{(item.price * item.quantity).toLocaleString()}</span>
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
