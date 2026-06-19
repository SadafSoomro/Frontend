import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash, X, RefreshCw, ToggleLeft, ToggleRight, Calendar, Sparkles } from 'lucide-react';
import {
  fetchAllSalesApi,
  createSaleApi,
  updateSaleApi,
  deleteSaleApi,
  fetchProductsApi
} from '../../API/api';

const emptyForm = {
  name: '',
  discountPercentage: '',
  startDate: '',
  endDate: '',
  targetType: 'all',
  percentageOfProducts: 30,
  specificProducts: [],
  isActive: true,
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchSalesAndProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetchAllSalesApi(),
        fetchProductsApi()
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingSale(null);
    setFormData(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      name: sale.name,
      discountPercentage: sale.discountPercentage,
      startDate: sale.startDate ? sale.startDate.slice(0, 16) : '',
      endDate: sale.endDate ? sale.endDate.slice(0, 16) : '',
      targetType: sale.targetType,
      percentageOfProducts: sale.percentageOfProducts || 30,
      specificProducts: sale.appliedProducts ? sale.appliedProducts.map(p => typeof p === 'string' ? p : p._id) : [],
      isActive: sale.isActive,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => {
      const exists = prev.specificProducts.includes(productId);
      const updated = exists
        ? prev.specificProducts.filter(id => id !== productId)
        : [...prev.specificProducts, productId];
      return { ...prev, specificProducts: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) return setFormError('Campaign name is required.');
    if (!formData.discountPercentage || formData.discountPercentage < 1 || formData.discountPercentage > 99) {
      return setFormError('Discount must be between 1 and 99 percent.');
    }
    if (!formData.startDate) return setFormError('Start date is required.');
    if (!formData.endDate) return setFormError('End date is required.');
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return setFormError('Start date must be before end date.');
    }
    if (formData.targetType === 'specific' && formData.specificProducts.length === 0) {
      return setFormError('Please select at least one product.');
    }
    if (formData.targetType === 'percentage' && (!formData.percentageOfProducts || formData.percentageOfProducts < 1 || formData.percentageOfProducts > 100)) {
      return setFormError('Please provide a valid target product percentage (1-100).');
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        discountPercentage: Number(formData.discountPercentage),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        targetType: formData.targetType,
        percentageOfProducts: formData.targetType === 'percentage' ? Number(formData.percentageOfProducts) : null,
        specificProducts: formData.targetType === 'specific' ? formData.specificProducts : [],
        isActive: formData.isActive,
      };

      if (editingSale) {
        const { data } = await updateSaleApi(editingSale._id, payload);
        // Refresh sales list since DB populates fields
        fetchSalesAndProducts();
      } else {
        const { data } = await createSaleApi(payload);
        fetchSalesAndProducts();
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save sale campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale campaign? This cannot be undone.')) return;
    try {
      await deleteSaleApi(id);
      setSales((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sale campaign');
    }
  };

  const handleToggleActive = async (sale) => {
    try {
      const { data } = await updateSaleApi(sale._id, { isActive: !sale.isActive });
      setSales((prev) => prev.map((s) => (s._id === sale._id ? { ...s, isActive: data.isActive } : s)));
    } catch (err) {
      alert('Failed to update campaign status');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCampaignStatusText = (sale) => {
    if (!sale.isActive) return { text: 'Disabled', class: 'inactive' };
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    if (now < start) return { text: 'Scheduled', class: 'completed' }; // green/yellow
    if (now > end) return { text: 'Expired', class: 'inactive' };
    return { text: 'Live Now', class: 'active' };
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Sale Campaigns</h1>
          <p className="text-secondary">Schedule and configure product discounts, dates, and percentage scopes.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary" onClick={fetchSalesAndProducts} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="primary" onClick={handleOpenCreate}>
            <Plus size={18} /> New Sale Campaign
          </button>
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card table-section">
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading campaigns...</p>
        ) : sales.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ opacity: 0.5 }}>No sale campaigns yet. Launch one today!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Discount</th>
                <th>Scope Type</th>
                <th>Products Count</th>
                <th>Active Period</th>
                <th>Timeline Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const status = getCampaignStatusText(sale);
                return (
                  <tr key={sale._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {sale.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                        {sale.discountPercentage}% OFF
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                      {sale.targetType === 'all' && 'All Products'}
                      {sale.targetType === 'percentage' && `${sale.percentageOfProducts}% Random Products`}
                      {sale.targetType === 'specific' && 'Selected Products'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {sale.targetType === 'all' ? products.length : (sale.appliedProducts?.length || 0)}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>Start: {formatDateTime(sale.startDate)}</div>
                      <div>End: {formatDateTime(sale.endDate)}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(sale)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          color: sale.isActive ? '#22c55e' : 'var(--text-secondary)',
                          fontWeight: 600, fontSize: '0.8rem',
                        }}
                        title="Toggle Active/Inactive"
                      >
                        {sale.isActive
                          ? <><ToggleRight size={20} /> Active</>
                          : <><ToggleLeft size={20} /> Inactive</>}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small" onClick={() => handleOpenEdit(sale)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(sale._id)} title="Delete">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-md modal-scroll">
            <div className="modal-header">
              <h2>{editingSale ? 'Edit Sale Campaign' : 'Create Sale Campaign'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="crud-form">
              {formError && <div className="error-msg" style={{ marginBottom: '1rem', padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px' }}>{formError}</div>}

              <div className="form-group">
                <label>Campaign Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Clearance Sale"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Percentage (1-99%) *</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                    min="1"
                    max="99"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', height: '44px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        style={{ width: '18px', height: '18px', margin: 0 }}
                      />
                      <span>Campaign Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Scope *</label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                  required
                >
                  <option value="all">Apply to All Products</option>
                  <option value="percentage">Apply to a Random Percentage of Products</option>
                  <option value="specific">Apply to Specific Selected Products</option>
                </select>
              </div>

              {formData.targetType === 'percentage' && (
                <div className="form-group animate-fade-in">
                  <label>Percentage of Products to Select (1-100%) *</label>
                  <input
                    type="number"
                    name="percentageOfProducts"
                    value={formData.percentageOfProducts}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    placeholder="e.g. 30"
                  />
                  <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>
                    When saved, the system will randomly select this percentage of products to apply the sale to.
                  </p>
                </div>
              )}

              {formData.targetType === 'specific' && (
                <div className="form-group animate-fade-in" style={{ border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '6px', background: 'var(--glass-bg)' }}>
                  <label style={{ marginBottom: '8px', display: 'block' }}>Select Products *</label>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {products.map(product => (
                      <label key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.specificProducts.includes(product._id)}
                          onChange={() => handleProductToggle(product._id)}
                          style={{ width: '16px', height: '16px', margin: 0 }}
                        />
                        <span>{product.brand} - {product.name} (Rs.{product.price})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
