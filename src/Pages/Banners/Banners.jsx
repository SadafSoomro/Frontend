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
      const imageUrl = assetUrl(banner.image);
      setPreviewImage(imageUrl);
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
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
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

    if (!result.error) {
      handleCloseModal();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      dispatch(deleteBanner(id));
    }
  };

  return (
    <div className="crud-page animate-fade-in">
      <div className="page-header">
        <div className="header-text">
          <h1>Banners</h1>
          <p className="text-secondary">Manage the promotional banners displayed on your homepage.</p>
        </div>
        <button className="primary" style={{ backgroundColor: 'var(--accent-purple, #a855f7)' }} onClick={() => handleOpenModal()}>
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
                <th>IMAGE</th>
                <th>TITLE</th>
                <th>DESCRIPTION</th>
                <th>ACTIONS</th>
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
                        <img 
                          src={assetUrl(banner.image)} 
                          alt={banner.title} 
                        />
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{banner.title}</td>
                    <td className="text-secondary banner-desc-cell">{banner.description}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small edit-banner-btn" onClick={() => handleOpenModal(banner)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(banner._id)}>
                          <Trash size={16} />
                          <span>Delete</span>
                        </button>
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
          <div className="modal-content glass-card animate-fade-in">
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            {error && (
              <div className="error-msg" style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: '#ef4444', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Banner Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. New Season Sale"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Promotional text for the banner..."
                  required 
                />
              </div>
              <div className="form-group">
                <label>Banner Image</label>
                <div className="image-upload-wrapper">
                  {previewImage ? (
                    <div className="image-preview-container">
                      <img src={previewImage} alt="Preview" />
                      <button type="button" className="remove-img" onClick={() => {setPreviewImage(null); setFormData({...formData, image: null})}}>
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                      <Upload size={40} />
                      <span>Upload Banner Image</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="primary" style={{ backgroundColor: 'var(--accent-purple, #a855f7)' }} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Save Banner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px;
          gap: 20px;
          color: var(--text-secondary);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .banner-preview-small {
          width: 120px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
        }
        
        .banner-preview-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-desc-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edit-banner-btn:hover {
            border-color: var(--accent-purple, #a855f7) !important;
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2) !important;
        }

        .crud-page .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        
        .table-section {
          overflow-x: auto;
        }

        .action-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .icon-btn-small {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);

          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .delete-btn {
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .delete-btn:hover {
          background: rgba(255, 77, 77, 0.2);
          border-color: #ff4d4d;
          box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
          transform: translateY(-2px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-start; /* Changed from center to bring it down naturally with padding */
          padding: 80px 20px; /* Increased top padding to "nechay lao" */
          overflow-y: auto; /* Allow scrolling on the overlay instead of inside the modal */
          animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          width: 100%;
          max-width: 680px;
          background: linear-gradient(145deg, #13152a, #0e1020);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6), 0 0 50px rgba(139, 92, 246, 0.1);
          animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          /* Removed overflow-y: auto to prevent internal scrolling as requested */
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
        }

        .modal-header h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 77, 77, 0.15);
          border-color: rgba(255, 77, 77, 0.3);
          color: #ff6b6b;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: #fff;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.06);
          outline: none;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .image-upload-wrapper {
          border: 2px dashed rgba(139, 92, 246, 0.25);
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          transition: all 0.2s;
          background: rgba(139, 92, 246, 0.03);
        }

        .image-upload-wrapper:hover {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.06);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s;
        }

        .upload-placeholder:hover {
          color: #fff;
        }

        .image-preview-container {
          position: relative;
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .image-preview-container img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .remove-img {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .remove-img:hover {
          background: #ef4444;
          transform: scale(1.1);
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(139, 92, 246, 0.15);
        }

        .modal-footer .primary {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.92rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .modal-footer .primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }

        .modal-footer .secondary {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.92rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-footer .secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.25);
          color: #fff;
        }

        button.primary {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Banners;

