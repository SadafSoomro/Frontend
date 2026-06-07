import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash, X, Upload, Loader2 } from 'lucide-react';
import { getBanners, createBanner, updateBanner, deleteBanner, clearError } from '../../Store/Slices/BannerSlice';
import { assetUrl } from '../../config';

const Banners = () => {
  const dispatch = useDispatch();
  const { banners, loading, error, submitting } = useSelector((state) => state.banners);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', image: null });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    dispatch(getBanners());
  }, [dispatch]);

  const handleOpenModal = (banner = null) => {
    dispatch(clearError());
    if (banner) {
      setEditingBanner(banner);
      setFormData({ title: banner.title, description: banner.description, image: banner.image });
      setPreviewImage(assetUrl(banner.image));
    } else {
      setEditingBanner(null);
      setFormData({ title: '', description: '', image: null });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
    dispatch(clearError());
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    } else if (editingBanner && typeof formData.image === 'string') {
      data.append('image', formData.image);
    }

    let result;
    if (editingBanner) {
      result = await dispatch(updateBanner({ id: editingBanner._id, formData: data }));
    } else {
      result = await dispatch(createBanner(data));
    }
    if (!result.error) handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      dispatch(deleteBanner(id));
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Banners</h1>
          <p className="text-secondary">Manage the promotional banners displayed on your homepage.</p>
        </div>
        <button className="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Loading banners...</p>
        </div>
      ) : (
        <div className="glass-card table-section">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="text-secondary">No banners found. Click "Add Banner" to create one.</p>
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner._id}>
                    <td>
                      <div className="banner-preview-small">
                        <img src={assetUrl(banner.image)} alt={banner.title} />
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{banner.title}</td>
                    <td className="text-secondary banner-desc-cell">{banner.description}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small" onClick={() => handleOpenModal(banner)}><Edit2 size={16} /></button>
                        <button className="delete-btn" onClick={() => handleDelete(banner._id)}><Trash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            {error && <div className="form-error"><span>{error}</span></div>}

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="form-group">
                <label>Banner Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. New Season Sale" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Promotional text for the banner..." required />
              </div>
              <div className="form-group">
                <label>Banner Image</label>
                <div className="image-upload-wrapper">
                  {previewImage ? (
                    <div className="image-preview-container">
                      <img src={previewImage} alt="Preview" />
                      <button type="button" className="remove-img" onClick={() => { setPreviewImage(null); setFormData({ ...formData, image: null }); }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                      <Upload size={32} />
                      <span>Upload Banner Image</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /><span>Saving...</span></>
                  ) : (
                    <><Plus size={18} /><span>Save Banner</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
