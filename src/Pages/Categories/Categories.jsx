import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash, X, Upload, Loader2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, clearError } from '../../Store/Slices/CategorySlice';
import { assetUrl } from '../../config';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, submitting } = useSelector((state) => state.categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: null, isActive: true });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleOpenModal = (category = null) => {
    dispatch(clearError());
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description, 
        image: category.image,
        isActive: category.isActive !== undefined ? category.isActive : true
      });
      if (category.image) {
        const imageUrl = assetUrl(category.image);
        setPreviewImage(imageUrl);
      } else {
        setPreviewImage(null);
      }
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: null, isActive: true });
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
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('isActive', formData.isActive);
    
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    } else if (editingCategory && typeof formData.image === 'string') {
      data.append('image', formData.image);
    }

    let result;
    if (editingCategory) {
      result = await dispatch(updateCategory({ id: editingCategory._id, formData: data }));
    } else {
      result = await dispatch(createCategory(data));
    }

    if (!result.error) {
      handleCloseModal();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
    }
  };

  return (
    <div className="crud-page animate-fade-in">
      <div className="page-header">
        <div className="header-text">
          <h1>Categories</h1>
          <p className="text-secondary">Organize your products into logical groups.</p>
        </div>
        <button className="primary" style={{ backgroundColor: 'var(--accent-cyan)' }} onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className="glass-card table-section">
          <table>
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="text-secondary">No categories found. Click "Add Category" to create one.</p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <div className="category-preview-small">
                        {category.image ? (
                          <img 
                            src={assetUrl(category.image)} 
                            alt={category.name} 
                          />
                        ) : (
                          <div className="no-image-placeholder">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{category.name}</td>
                    <td className="text-secondary description-cell">{category.description}</td>
                    <td>
                      <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small edit-category-btn" onClick={() => handleOpenModal(category)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(category._id)}>
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
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
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

            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Serums"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="4"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Tell customers what this category is about..."
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category Image</label>
                <div className="image-upload-wrapper">
                  {previewImage ? (
                    <div className="image-preview-container">
                      <img src={previewImage} alt="Preview" />
                      <button type="button" className="remove-img" onClick={() => {setPreviewImage(null); setFormData({...formData, image: null})}}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                      <Upload size={40} />
                      <span>Upload Category Image</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                  />
                  <span>Active Category</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="primary" style={{ backgroundColor: 'var(--accent-cyan)' }} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : 'Save Category'}
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

        .category-preview-small {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
        }
        
        .category-preview-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image-placeholder {
          color: var(--text-muted);
        }

        .description-cell {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-badge.inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .image-upload-wrapper {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s;
          margin-bottom: 15px;
          background: rgba(255, 255, 255, 0.01);
        }

        .image-upload-wrapper:hover {
          border-color: var(--accent-cyan);
          background: rgba(77, 243, 255, 0.02);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .upload-placeholder:hover {
          color: white;
        }

        .image-preview-container {
          position: relative;
          max-width: 100%;
          max-height: 250px;
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          margin: 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .image-preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-img {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(255, 77, 77, 0.8);
          border: none;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .checkbox-group {
          margin-top: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .edit-category-btn:hover {
            border-color: var(--accent-cyan) !important;
            box-shadow: 0 4px 12px rgba(77, 243, 255, 0.2) !important;
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
          align-items: flex-start; /* Align to top */
          padding: 80px 20px; /* Top padding for offset */
          overflow-y: auto; /* Enable page-level scrolling */
          animation: modalFadeIn 0.3s ease-out;
        }

        .modal-content {
          width: 100%;
          max-width: 800px;
          background: #000; /* Pure black */
          border: 1px solid rgba(77, 243, 255, 0.2);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          box-shadow: 0 0 60px rgba(0, 0, 0, 1), 0 0 30px rgba(77, 243, 255, 0.1);
          animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .close-btn:hover {
          background: rgba(255, 77, 77, 0.15);
          border-color: rgba(255, 77, 77, 0.3);
          color: #ff6b6b;
          transform: rotate(90deg);
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .form-group input, .form-group textarea {
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

        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--accent-cyan);
          background: rgba(77, 243, 255, 0.05);
          outline: none;
          box-shadow: 0 0 20px rgba(77, 243, 255, 0.1);
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(139, 92, 246, 0.15);
        }

        .modal-footer .primary, .modal-footer .secondary {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .modal-footer .secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.7);
        }

        button.primary {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default Categories;

