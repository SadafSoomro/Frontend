import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash, X, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  fetchAllCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
} from '../../API/api';

const emptyForm = {
  code: '',
  discountPercent: '',
  description: '',
  isActive: true,
  expiresAt: '',
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchAllCouponsApi();
      setCoupons(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      description: coupon.description || '',
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingCoupon(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.code.trim()) return setFormError('Coupon code is required.');
    if (!formData.discountPercent || formData.discountPercent < 1 || formData.discountPercent > 100) {
      return setFormError('Discount must be between 1 and 100.');
    }
    setSaving(true);
    try {
      if (editingCoupon) {
        const { data } = await updateCouponApi(editingCoupon._id, formData);
        setCoupons((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      } else {
        const { data } = await createCouponApi(formData);
        setCoupons((prev) => [data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    try {
      await deleteCouponApi(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const { data } = await updateCouponApi(coupon._id, { isActive: !coupon.isActive });
      setCoupons((prev) => prev.map((c) => (c._id === data._id ? data : c)));
    } catch (err) {
      alert('Failed to update coupon status');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Coupons</h1>
          <p className="text-secondary">Manage discount coupons used at checkout.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary" onClick={fetchCoupons} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="primary" onClick={handleOpenCreate}>
            <Plus size={18} /> Add Coupon
          </button>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card table-section">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Tag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ opacity: 0.5 }}>No coupons yet. Create your first coupon!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: 'var(--glass-bg)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      letterSpacing: '1px',
                      color: 'var(--accent-primary)',
                    }}>
                      {coupon.code}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: 'var(--accent-cyan)',
                    }}>
                      {coupon.discountPercent}% OFF
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {coupon.description || '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: coupon.isActive ? 'var(--accent-success, #22c55e)' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: '0.8rem',
                      }}
                      title="Toggle active status"
                    >
                      {coupon.isActive
                        ? <><ToggleRight size={20} /> Active</>
                        : <><ToggleLeft size={20} /> Inactive</>}
                    </button>
                  </td>
                  <td>
                    {coupon.expiresAt ? (
                      <span style={{ color: isExpired(coupon.expiresAt) ? '#ef4444' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {formatDate(coupon.expiresAt)}
                        {isExpired(coupon.expiresAt) && <span style={{ marginLeft: 4, fontSize: '0.75rem', color: '#ef4444' }}>(Expired)</span>}
                      </span>
                    ) : <span style={{ color: 'var(--text-secondary)' }}>No expiry</span>}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {formatDate(coupon.createdAt)}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn-small" onClick={() => handleOpenEdit(coupon)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(coupon._id)} title="Delete">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="crud-form">
              {formError && <div className="error-msg" style={{ marginBottom: '0.75rem' }}>{formError}</div>}

              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. SUMMER20"
                  required
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '1px' }}
                />
              </div>

              <div className="form-group">
                <label>Discount Percentage * (1–100)</label>
                <input
                  type="number"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Summer Sale discount"
                />
              </div>

              <div className="form-group">
                <label>Expiry Date (optional — leave blank for no expiry)</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Active (can be used at checkout)</label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
