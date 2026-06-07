import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
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
      setPreviewImage(category.image ? assetUrl(category.image) : null);
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
      reader.onloadend = () => setPreviewImage(reader.result);
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
    if (!result.error) handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Categories</h1>
          <p className="text-secondary">Organize your products into logical groups.</p>
        </div>
        <button className="primary" onClick={() => handleOpenModal()}>
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
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
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
                          <img src={assetUrl(category.image)} alt={category.name} />
                        ) : (
                          <div className="no-image-placeholder"><ImageIcon size={16} /></div>
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
                        <button className="icon-btn-small" onClick={() => handleOpenModal(category)}><Edit2 size={16} /></button>
                        <button className="delete-btn" onClick={() => handleDelete(category._id)}><Trash size={16} /></button>
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
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            {error && <div className="form-error"><span>{error}</span></div>}

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Serums" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell customers what this category is about..." required />
              </div>
              <div className="form-group">
                <label>Category Image</label>
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
                      <span>Upload Category Image</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span>Active Category</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Saving...</span></>
                  ) : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
