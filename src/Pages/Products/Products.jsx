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
    short_description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
    brand: '',
    skin_type: [],
    concerns: [],
    ingredients: '',
    how_to_use: '',
    benefits: '',
    main_image: null,
    gallery_images: [],
    status: 'active',
    is_featured: false,
    meta_title: '',
    meta_description: ''
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
        name: '', slug: '', description: '', short_description: '',
        price: '', discount_price: '', stock_quantity: '', sku: '',
        category_id: '', brand: '', skin_type: [], concerns: [],
        ingredients: '', how_to_use: '', benefits: '',
        main_image: null, gallery_images: [],
        status: 'active', is_featured: false,
        meta_title: '', meta_description: ''
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
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'gallery_images') {
        formData.gallery_images.forEach(img => {
          data.append('gallery_images', img);
        });
      } else if (key === 'skin_type' || key === 'concerns') {
        const arrayValues = Array.isArray(formData[key])
          ? formData[key]
          : formData[key].split(',').map(s => s.trim()).filter(s => s !== '');
        arrayValues.forEach(val => data.append(key, val));
      } else if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
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
          <div className="modal-content modal-lg modal-scroll">
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
              <div className="form-two-columns">
                {/* ── Left Column ── */}
                <div className="form-column">
                  <section className="form-section">
                    <div className="section-header-mini">
                      <Info size={16} />
                      <h3>Basic Information</h3>
                    </div>
                    <div className="form-group">
                      <label>Product Name</label>
                      <div className="input-with-button">
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Vitamin C Radiance Serum" required />
                        <button type="button" className="btn-secondary-small" onClick={generateSlug}>Generate Slug</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Slug (URL key)</label>
                      <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="vitamin-c-radiance-serum" required />
                    </div>
                    <div className="form-row">
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
                    </div>
                    <div className="form-group">
                      <label>Short Description</label>
                      <input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} placeholder="Brief overview for search results..." />
                    </div>
                    <div className="form-group">
                      <label>Full Description</label>
                      <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed product story and features..." required />
                    </div>
                  </section>

                  <section className="form-section">
                    <div className="section-header-mini">
                      <Tag size={16} />
                      <h3>Pricing & Stock</h3>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price ($)</label>
                        <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Discount Price ($)</label>
                        <input type="number" step="0.01" value={formData.discount_price} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Stock Quantity</label>
                        <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>SKU</label>
                        <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. SRUM-VC-001" required />
                      </div>
                    </div>
                  </section>
                </div>

                {/* ── Right Column ── */}
                <div className="form-column">
                  <section className="form-section">
                    <div className="section-header-mini">
                      <ImageIcon size={16} />
                      <h3>Product Media</h3>
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
                  </section>

                  <section className="form-section">
                    <div className="section-header-mini">
                      <Layers size={16} />
                      <h3>Specifications & SEO</h3>
                    </div>
                    <div className="form-group">
                      <label>Ingredients</label>
                      <textarea rows="2" value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} placeholder="Active and inactive ingredients..." />
                    </div>
                    <div className="form-group">
                      <label>Benefits</label>
                      <textarea rows="2" value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder="Key benefits..." />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Skin Types</label>
                        <input type="text" value={Array.isArray(formData.skin_type) ? formData.skin_type.join(', ') : formData.skin_type} onChange={(e) => setFormData({ ...formData, skin_type: e.target.value.split(',').map(s => s.trim()) })} placeholder="Dry, Oily, Sensitive" />
                      </div>
                      <div className="form-group">
                        <label>Concerns</label>
                        <input type="text" value={Array.isArray(formData.concerns) ? formData.concerns.join(', ') : formData.concerns} onChange={(e) => setFormData({ ...formData, concerns: e.target.value.split(',').map(s => s.trim()) })} placeholder="Acne, Aging, Dullness" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>How to Use</label>
                      <textarea rows="2" value={formData.how_to_use} onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })} placeholder="Application instructions..." />
                    </div>
                    <div className="form-group">
                      <label>Meta Title (SEO)</label>
                      <input type="text" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Meta Description (SEO)</label>
                      <textarea rows="2" value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} />
                    </div>
                  </section>
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
