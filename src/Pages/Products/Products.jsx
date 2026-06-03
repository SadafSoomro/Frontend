import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash, X, Upload, Loader2, Image as ImageIcon, CheckCircle, Info, Tag, Package, Layers } from 'lucide-react';
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

  const [previews, setPreviews] = useState({
    main: null,
    gallery: []
  });

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

      const mainPreview = assetUrl(product.main_image);
      const galleryPreviews = product.gallery_images.map(img => assetUrl(img));

      setPreviews({
        main: mainPreview,
        gallery: galleryPreviews
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
          if (img instanceof File) {
            data.append('gallery_images', img);
          } else {
            // Keep existing images if they are URLs
            data.append('gallery_images', img);
          }
        });
      } else if (key === 'skin_type' || key === 'concerns') {
        const arrayValues = Array.isArray(formData[key]) ? formData[key] : formData[key].split(',').map(s => s.trim()).filter(s => s !== '');
        arrayValues.forEach(val => data.append(key, val)); // Send without [] for better compatibility or handle in backend
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

    if (!result.error) {
      handleCloseModal();
    }
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
    <div className="crud-page animate-fade-in">
      <div className="page-header">
        <div className="header-text">
          <h1>Products</h1>
          <p className="text-secondary">Manage your high-performance skincare catalog.</p>
        </div>
        <button className="primary add-product-btn" onClick={() => handleOpenModal()}>
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
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
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
                          <img
                            src={assetUrl(product.main_image)}
                            alt={product.name}
                          />
                        </div>
                        <div className="product-text">
                          <span className="product-name">{product.name}</span>
                          <span className="product-sku">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {product.category_id?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <div className="price-display">
                        <span className="current-price">${product.price.toFixed(2)}</span>
                        {product.discount_price && (
                          <span className="old-price">${product.discount_price.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock_quantity < 10 ? 'low' : ''}`}>
                        {product.stock_quantity} in stock
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn-small edit-btn" onClick={() => handleOpenModal(product)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                          <Trash size={16} />
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
          <div className="modal-content glass-card product-modal animate-fade-in">
            <div className="modal-header">
              <div className="title-with-icon">
                {editingProduct && <Edit2 size={24} className="text-accent" />}
                <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              </div>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            {productError && (
              <div className="error-msg" style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: '#ef4444', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Info size={18} />
                <span>{productError}</span>
              </div>
            )}

            {/* Tabs removed as per request for single page view */}

            <form onSubmit={handleSubmit} className="product-form" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="product-form-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <section className="form-section">
                  <div className="section-header-mini">
                    <Info size={18} />
                    <h3>Basic Information</h3>
                  </div>
                  <div className="tab-pane">
                    <div className="form-group">
                      <label>Product Name</label>
                      <div className="input-with-button">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Vitamin C Radiance Serum"
                          required
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                        <button type="button" className="btn-secondary-small" onClick={generateSlug}>Generate Slug</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Slug (URL key)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="vitamin-c-radiance-serum"
                        required
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          required
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Brand</label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="e.g. SkinGlo"
                          required
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Short Description</label>
                      <input
                        type="text"
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="Brief overview for search results..."
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Full Description</label>
                      <textarea
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed product story and features..."
                        required
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-header-mini">
                    <Tag size={18} />
                    <h3>Pricing & Stock</h3>
                  </div>
                  <div className="tab-pane">
                    <div className="row">
                      <div className="form-group">
                        <label>Price ($)</label>
                        <input
                          type="number" step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Discount Price ($)</label>
                        <input
                          type="number" step="0.01"
                          value={formData.discount_price}
                          onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>Stock Quantity</label>
                        <input
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          required
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label>SKU (Stock Keeping Unit)</label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g. SRUM-VC-001"
                          required
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-header-mini">
                    <ImageIcon size={18} />
                    <h3>Product Media</h3>
                  </div>
                  <div className="tab-pane">
                    <div className="image-upload-section">
                      <label>Main Product Image (Thumbnail)</label>
                      <div className="main-upload-area" style={{ padding: '40px' }}>
                        {previews.main ? (
                          <div className="main-preview-large">
                            <img src={previews.main} alt="Main" />
                            <button type="button" className="remove-main" onClick={() => { setPreviews({ ...previews, main: null }); setFormData({ ...formData, main_image: null }) }}>
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <label className="upload-box-large" style={{ gap: '20px' }}>
                            <input type="file" accept="image/*" onChange={handleMainImageChange} hidden />
                            <Upload size={48} />
                            <span style={{ fontSize: '1.2rem' }}>Upload Main Image</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="gallery-upload-section" style={{ marginTop: '40px' }}>
                      <label>Gallery Images (Multiple)</label>
                      <div className="gallery-grid">
                        {previews.gallery.map((img, index) => (
                          <div key={index} className="gallery-preview-item" style={{ width: '150px', height: '150px' }}>
                            <img src={img} alt={`Gallery ${index}`} />
                            <button type="button" className="remove-gallery" onClick={() => handleRemoveGalleryImage(index)}>
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <label className="upload-box-small" style={{ width: '150px', height: '150px' }}>
                          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} hidden />
                          <Plus size={32} />
                        </label>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-header-mini">
                    <Layers size={18} />
                    <h3>Detailed Specifications & SEO</h3>
                  </div>
                  <div className="tab-pane">
                    <div className="form-group">
                      <label>Ingredients</label>
                      <textarea
                        rows="4"
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        placeholder="List of active and inactive ingredients..."
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Benefits</label>
                      <textarea
                        rows="3"
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        placeholder="Key benefits of using this product..."
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="row">
                      <div className="form-group">
                        <label>Skin Types (comma separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(formData.skin_type) ? formData.skin_type.join(', ') : formData.skin_type}
                          onChange={(e) => setFormData({ ...formData, skin_type: e.target.value.split(',').map(s => s.trim()) })}
                          placeholder="Dry, Oily, Sensitive..."
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Concerns (comma separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(formData.concerns) ? formData.concerns.join(', ') : formData.concerns}
                          onChange={(e) => setFormData({ ...formData, concerns: e.target.value.split(',').map(s => s.trim()) })}
                          placeholder="Acne, Aging, Dullness..."
                          style={{ padding: '15px', fontSize: '1.1rem' }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>How to Use</label>
                      <textarea
                        rows="4"
                        value={formData.how_to_use}
                        onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                        placeholder="Application instructions..."
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Meta Title (SEO)</label>
                      <input
                        type="text"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Meta Description (SEO)</label>
                      <textarea
                        rows="3"
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="modal-footer" style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                <button type="button" className="secondary" onClick={handleCloseModal} disabled={submitting} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Cancel</button>
                <button type="submit" className="primary" style={{ backgroundColor: 'var(--accent-pink)', padding: '16px 40px', fontSize: '1.1rem' }} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      <span>{editingProduct ? 'Update Product' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .product-modal {
          width: 100% !important;
          max-width: 820px !important;
        }

        .modal-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
          padding-bottom: 12px;
          overflow-x: auto;
        }

        .modal-tabs button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .modal-tabs button:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(139, 92, 246, 0.08);
        }

        .modal-tabs button.active {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
        }

        .product-info-cell {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .product-img-small {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
        }

        .product-img-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-text {
          display: flex;
          flex-direction: column;
        }

        .product-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .product-sku {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .category-tag {
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .price-display {
          display: flex;
          flex-direction: column;
        }

        .current-price {
          font-weight: 700;
          color: var(--accent-pink);
        }

        .old-price {
          font-size: 0.8rem;
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .stock-badge {
          font-size: 0.85rem;
          color: #4ade80;
        }

        .stock-badge.low {
          color: #f87171;
          font-weight: 600;
        }

        .status-badge {
          text-transform: capitalize;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-badge.inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .input-with-button {
          display: flex;
          gap: 10px;
        }

        .btn-secondary-small {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 0 15px;
          border-radius: 12px;
          font-size: 0.8rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .main-upload-area {
          margin-top: 10px;
        }

        .upload-box-large {
          height: 180px;
          border: 2px dashed var(--glass-border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.3s;
        }

        .upload-box-large:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: var(--accent-pink);
          color: white;
        }

        .main-preview-large {
          height: 180px;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }

        .main-preview-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .gallery-preview-item {
          aspect-ratio: 1/1;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--glass-border);
        }

        .gallery-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-box-small {
          aspect-ratio: 1/1;
          border: 2px dashed var(--glass-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.3s;
        }

        .upload-box-small:hover {
          border-color: var(--accent-pink);
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
          animation: modalFadeIn 0.25s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          width: 100%;
          max-width: 960px; /* Wider for single page layout */
          background: #000; /* Pure black background as requested */
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 24px;
          padding: 48px;
          position: relative;
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 0 80px rgba(0, 0, 0, 1), 0 0 50px rgba(139, 92, 246, 0.15);
          animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.6) transparent;
        }

        .section-header-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          color: #a78bfa;
          border-bottom: 1px solid rgba(167, 139, 250, 0.1);
          padding-bottom: 10px;
        }

        .section-header-mini h3 {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-section {
          background: rgba(255, 255, 255, 0.02);
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .modal-content::-webkit-scrollbar {
          width: 5px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
          border-radius: 10px;
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .remove-main, .remove-gallery {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 77, 77, 0.9);
          border: none;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 5;
        }

        .remove-gallery {
          width: 20px;
          height: 20px;
          top: 5px;
          right: 5px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input {
          width: 20px;
          height: 20px;
          accent-color: var(--accent-pink);
        }

        .tab-pane {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .edit-btn:hover { border-color: var(--accent-pink); }
        
        .loading-state {
          padding: 100px;
          text-align: center;
          color: var(--text-muted);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        .add-product-btn {
          margin-left: 20px;
          padding: 12px 24px !important;
          background-color: var(--accent-pink) !important;
        }

        .add-product-btn:hover {
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Products;

