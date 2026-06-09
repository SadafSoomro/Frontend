import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash, X, Upload, Loader2, Image as ImageIcon, CheckCircle, Info, Tag, Layers } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, clearProductError } from '../../Store/Slices/ProductSlice';
import { getCategories } from '../../Store/Slices/CategorySlice';
import { assetUrl } from '../../config';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading: productsLoading, error: productError, submitting } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
    brand: '',
    main_image: null,
    gallery_images: [],
    status: 'active',
    is_featured: false
  });

  const [previews, setPreviews] = useState({ main: null, gallery: [] });

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
  }, [dispatch]);

  const handleOpenModal = (product = null) => {
    dispatch(clearProductError());
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        category_id: product.category_id?._id || product.category_id,
        price: product.price.toString(),
        discount_price: product.discount_price?.toString() || '',
        stock_quantity: product.stock_quantity.toString(),
      });
      setPreviews({
        main: assetUrl(product.main_image),
        gallery: product.gallery_images.map(img => assetUrl(img)),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', slug: '', description: '',
        price: '', discount_price: '', stock_quantity: '', sku: '',
        category_id: '', brand: '',
        main_image: null, gallery_images: [],
        status: 'active', is_featured: false
      });
      setPreviews({ main: null, gallery: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setPreviews({ main: null, gallery: [] });
    dispatch(clearProductError());
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, main_image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviews({ ...previews, main: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({ ...formData, gallery_images: [...formData.gallery_images, ...files] });
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, gallery: [...prev.gallery, reader.result] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryImage = (index) => {
    const newGallery = [...formData.gallery_images];
    newGallery.splice(index, 1);
    const newPreviews = [...previews.gallery];
    newPreviews.splice(index, 1);
    setFormData({ ...formData, gallery_images: newGallery });
    setPreviews({ ...previews, gallery: newPreviews });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Auto-generate slug from name if empty
    let slug = formData.slug;
    if (!slug || slug.trim() === '') {
      slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Auto-generate SKU if empty
    let sku = formData.sku;
    if (!sku || sku.trim() === '') {
      sku = 'SKU-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    const updatedFormData = { ...formData, slug, sku };

    const data = new FormData();
    Object.keys(updatedFormData).forEach(key => {
      if (key === 'gallery_images') {
        updatedFormData.gallery_images.forEach(img => {
          data.append('gallery_images', img);
        });
      } else if (updatedFormData[key] !== null && updatedFormData[key] !== undefined) {
        data.append(key, updatedFormData[key]);
      }
    });

    let result;
    if (editingProduct) {
      result = await dispatch(updateProduct({ id: editingProduct._id, formData: data }));
    } else {
      result = await dispatch(createProduct(data));
    }
    if (!result.error) handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const generateSlug = () => {
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Products</h1>
          <p className="text-secondary">Manage your high-performance skincare catalog.</p>
        </div>
        <button className="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {(productsLoading || categoriesLoading) ? (
        <div className="loading-state">
          <Loader2 className="animate-spin" size={40} />
          <p>Loading catalog...</p>
        </div>
      ) : (
        <div className="glass-card table-section">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="text-secondary">No products found. Start by adding one.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-info-cell">
                        <div className="product-img-small">
                          <img src={assetUrl(product.main_image)} alt={product.name} />
                        </div>
                        <div className="product-text">
                          <span className="product-name">{product.name}</span>
                          <span className="product-sku">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-tag">{product.category_id?.name || 'Uncategorized'}</span></td>
                    <td>
                      <div className="price-display">
                        <span className="current-price">${product.price.toFixed(2)}</span>
                        {product.discount_price && <span className="old-price">${product.discount_price.toFixed(2)}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock_quantity < 10 ? 'low' : ''}`}>
                        {product.stock_quantity} in stock
                      </span>
                    </td>
                    <td><span className={`status-badge ${product.status}`}>{product.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small" onClick={() => handleOpenModal(product)}><Edit2 size={16} /></button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}><Trash size={16} /></button>
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
          <div className="modal-content modal-md modal-scroll">
            <div className="modal-header">
              <div className="title-with-icon">
                {editingProduct && <Edit2 size={20} className="text-accent" />}
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              </div>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            {productError && (
              <div className="form-error"><Info size={18} /><span>{productError}</span></div>
            )}

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="form-group">
                <label>Product Name</label>
                <div className="input-with-button">
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Vitamin C Radiance Serum" required />
                  <button type="button" className="btn-secondary-small" onClick={generateSlug}>Generate Slug</button>
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. SkinGlo" required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed product story and features..." required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Original Price (Rs.)</label>
                  <input type="number" step="0.01" value={formData.discount_price} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Main Product Image</label>
                <div className="main-upload-area">
                  {previews.main ? (
                    <div className="main-preview-large">
                      <img src={previews.main} alt="Main" />
                      <button type="button" className="remove-main" onClick={() => { setPreviews({ ...previews, main: null }); setFormData({ ...formData, main_image: null }); }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-box-large">
                      <input type="file" accept="image/*" onChange={handleMainImageChange} hidden />
                      <Upload size={28} />
                      <span>Upload Main Image</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Gallery Images</label>
                <div className="gallery-grid">
                  {previews.gallery.map((img, index) => (
                    <div key={index} className="gallery-preview-item">
                      <img src={img} alt={`Gallery ${index}`} />
                      <button type="button" className="remove-gallery" onClick={() => handleRemoveGalleryImage(index)}><X size={12} /></button>
                    </div>
                  ))}
                  <label className="upload-box-small">
                    <input type="file" accept="image/*" multiple onChange={handleGalleryChange} hidden />
                    <Plus size={20} />
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} id="is_featured" />
                  <label htmlFor="is_featured" style={{ margin: 0 }}>Featured</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /><span>Processing...</span></>
                  ) : (
                    <><CheckCircle size={18} /><span>{editingProduct ? 'Update Product' : 'Publish Product'}</span></>
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

export default Products;
