import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { addToCart } from '../../Store/Slices/CartSlice';
import API from '../../API/api';
import { assetUrl } from '../../config';
import { 
  ArrowLeft, Star, ShoppingBag, Plus, Minus, CheckCircle, 
  ShieldCheck, RotateCcw, Lock, ChevronDown, ChevronUp, AlertCircle, Sparkles 
} from 'lucide-react';
import './ProductDetailsPage.css';

const StarRating = ({ rating, size = 16, onClick = null, hoverRating = 0, onHover = null, onLeave = null }) => {
  return (
    <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const isFilled = onClick 
          ? (hoverRating ? s <= hoverRating : s <= rating)
          : s <= Math.floor(rating) || (s - 0.5 <= rating);

        return (
          <button
            type="button"
            key={s}
            onClick={onClick ? () => onClick(s) : null}
            onMouseEnter={onHover ? () => onHover(s) : null}
            onMouseLeave={onLeave ? onLeave : null}
            disabled={!onClick}
            className={onClick ? `interactive-star-btn ${isFilled ? 'filled' : ''}` : ''}
            style={{
              background: 'none',
              border: 'none',
              cursor: onClick ? 'pointer' : 'default',
              padding: 0
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              color="#f59e0b"
            />
          </button>
        );
      })}
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart Alert Modal State
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProductDetails, setAddedProductDetails] = useState(null);

  // Gallery State
  const [activeImage, setActiveImage] = useState('');
  
  // Tabs State
  const [openTab, setOpenTab] = useState('description'); // 'description' | 'ingredients' | 'howtouse'
  
  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Review Submission State
  const [eligibility, setEligibility] = useState({ eligible: false, message: '' });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch product data and reviews
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await API.get(`/products/get/${id}`);
        setProduct(data);
        setActiveImage(data.main_image);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const { data } = await API.get(`/reviews/${id}`);
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err.message);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Check review eligibility when authenticated user loads page
  useEffect(() => {
    const checkEligibility = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await API.get(`/reviews/${id}/eligibility`);
        setEligibility(data);
      } catch (err) {
        console.error('Error checking eligibility:', err.message);
      }
    };

    checkEligibility();
  }, [id, isAuthenticated, reviewSuccess]);

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}`, message: 'Please login to add items to your cart.' } });
      return;
    }
    const discount = product.discount_price
      ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
      : 0;

    const cartItemPayload = {
      id: product._id,
      brand: product.brand,
      name: product.name,
      price: product.price,
      originalPrice: product.discount_price || product.price,
      discount,
      img: assetUrl(product.main_image),
    };

    // Dispatch multiple times to add selected quantity
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(cartItemPayload));
    }

    setAddedProductDetails({
      name: product.name,
      brand: product.brand,
      quantity,
      img: assetUrl(product.main_image),
      price: product.price
    });
    setShowCartModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      return setReviewError('Please write a comment for your review.');
    }

    setSubmittingReview(true);
    try {
      const { data } = await API.post(`/reviews/${id}`, { rating, comment });
      setReviews((prev) => [data.review, ...prev]);
      setComment('');
      setRating(5);
      setReviewSuccess(true);
      alert('✓ Review submitted successfully! Thank you.');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="product-detail-layout">
        <div className="product-detail-main" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-layout">
        <div className="product-detail-main" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2>Error loading product</h2>
          <p>{error || 'Product details could not be loaded.'}</p>
          <Link to="/" className="back-to-home-link" style={{ marginTop: '20px', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-layout">
      {/* ── BENEFIT RIBBON ── */}
      <div className="benefit-ribbon" style={{ background: '#fdfcfb', borderBottom: '1px solid #ebdcd3', display: 'flex', justifyContent: 'center', gap: '24px', padding: '8px 24px', fontSize: '0.75rem', fontWeight: 600, color: '#705b50' }}>
        <div className="benefit-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} color="#e21b26" /><span>Authentic Products</span></div>
        <div className="benefit-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RotateCcw size={14} color="#e21b26" /><span>Easy Returns</span></div>
        <div className="benefit-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14} color="#e21b26" /><span>Secure Payment</span></div>
      </div>

      <main className="product-detail-main">
        <Link to="/" className="back-to-home-link">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="product-grid">
          {/* Left Column: Image Gallery */}
          <div className="product-gallery-pane">
            <div className="main-image-viewport">
              <img src={assetUrl(activeImage)} alt={product.name} />
            </div>

            {(product.gallery_images && product.gallery_images.length > 0) && (
              <div className="thumbnails-row">
                <button 
                  onClick={() => setActiveImage(product.main_image)}
                  className={`thumbnail-box ${activeImage === product.main_image ? 'active' : ''}`}
                >
                  <img src={assetUrl(product.main_image)} alt="Main view" />
                </button>
                {product.gallery_images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`thumbnail-box ${activeImage === imgUrl ? 'active' : ''}`}
                  >
                    <img src={assetUrl(imgUrl)} alt={`Gallery view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="product-info-pane">
            <span className="detail-brand">{product.brand}</span>
            <h1 className="detail-name">{product.name}</h1>
            
            <div className="detail-rating-row">
              <StarRating rating={Number(averageRating)} />
              <span className="detail-rating-text">
                {averageRating > 0 ? `${averageRating} / 5.0` : 'No reviews yet'} ({reviews.length} reviews)
              </span>
            </div>

            {product.on_sale && (
              <div className="detail-sale-banner">
                <Sparkles size={16} />
                <span>SPECIAL CAMPAIGN: {product.sale_name} (-{product.sale_discount}%)</span>
              </div>
            )}

            <div className="detail-price-row">
              <span className="detail-price">Rs.{product.price?.toLocaleString()} PKR</span>
              {product.discount_price && (
                <>
                  <span className="detail-original-price">Rs.{product.discount_price?.toLocaleString()}</span>
                  <span className="detail-discount-tag">
                    {Math.round(((product.discount_price - product.price) / product.discount_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            <div className="detail-actions-row">
              <div className="detail-qty-picker">
                <button className="qty-pick-btn" onClick={() => handleQuantityChange(quantity - 1)}>
                  <Minus size={14} />
                </button>
                <span className="qty-pick-value">{quantity}</span>
                <button className="qty-pick-btn" onClick={() => handleQuantityChange(quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>

              <button className="detail-add-to-cart-btn" onClick={handleAddToCartClick}>
                <ShoppingBag size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Add to Cart
              </button>
            </div>

            <div className="detail-meta-list">
              <div className="meta-item"><strong>SKU:</strong> {product.sku}</div>
              {product.category_id && (
                <div className="meta-item"><strong>Category:</strong> {product.category_id.name}</div>
              )}
              <div className="meta-item"><strong>Availability:</strong> {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}</div>
            </div>

            {/* Accordions */}
            <div className="details-tabs-container">
              {/* Description Tab Toggle */}
              <div>
                <button className="tab-header-btn" onClick={() => setOpenTab(openTab === 'description' ? '' : 'description')}>
                  <span>Product Details</span>
                  {openTab === 'description' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openTab === 'description' && (
                  <div className="tab-content-panel">
                    <p>{product.short_description || product.description}</p>
                    {product.benefits && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Benefits:</strong>
                        <p>{product.benefits}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ingredients Tab Toggle */}
              {product.ingredients && (
                <div>
                  <button className="tab-header-btn" onClick={() => setOpenTab(openTab === 'ingredients' ? '' : 'ingredients')}>
                    <span>Ingredients</span>
                    {openTab === 'ingredients' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openTab === 'ingredients' && (
                    <div className="tab-content-panel">
                      <p>{product.ingredients}</p>
                    </div>
                  )}
                </div>
              )}

              {/* How to Use Tab Toggle */}
              {product.how_to_use && (
                <div>
                  <button className="tab-header-btn" onClick={() => setOpenTab(openTab === 'howtouse' ? '' : 'howtouse')}>
                    <span>How to Use</span>
                    {openTab === 'howtouse' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openTab === 'howtouse' && (
                    <div className="tab-content-panel">
                      <p>{product.how_to_use}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <section className="reviews-section-container">
          <h2 className="reviews-section-title">Customer Reviews</h2>

          <div className="reviews-overview-card">
            <div className="rating-summary-left">
              <span className="summary-big-num">{averageRating > 0 ? averageRating : '0.0'}</span>
              <StarRating rating={Number(averageRating)} size={20} />
              <span className="summary-total-text">Based on {reviews.length} reviews</span>
            </div>

            <div className="rating-eligibility-notice">
              {isAuthenticated ? (
                eligibility.eligible ? (
                  <div>
                    <strong style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle size={16} /> Verified Buyer
                    </strong>
                    <span>You have purchased and received this item. Feel free to leave a review below!</span>
                  </div>
                ) : (
                  <span style={{ color: '#888' }}>{eligibility.message || 'Checking order status...'}</span>
                )
              ) : (
                <span>Please <Link to="/login" style={{ color: '#e21b26', fontWeight: 700 }}>Login</Link> to review this product. Only verified buyers who purchased this product can leave reviews.</span>
              )}
            </div>
          </div>

          {/* Review Submission Form */}
          {isAuthenticated && eligibility.eligible && (
            <div className="submit-review-box">
              <h4>Write a Review</h4>
              <form onSubmit={handleReviewSubmit}>
                {reviewError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>
                    ❌ {reviewError}
                  </p>
                )}

                <div className="star-interactive-row">
                  <span>Your Rating:</span>
                  <StarRating 
                    rating={rating} 
                    size={24} 
                    onClick={(s) => setRating(s)}
                    hoverRating={hoverRating}
                    onHover={(s) => setHoverRating(s)}
                    onLeave={() => setHoverRating(0)}
                  />
                </div>

                <textarea
                  className="review-textarea"
                  placeholder="Share your experience with this product... What did you like or dislike? How does it feel on your skin?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />

                <button 
                  type="submit" 
                  className="submit-review-btn" 
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list-wrapper">
            {reviewsLoading ? (
              <p style={{ opacity: 0.5, textAlign: 'center', padding: '24px 0' }}>Loading product reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ opacity: 0.5, textAlign: 'center', padding: '24px 0' }}>No reviews yet. Be the first to leave a review!</p>
            ) : (
              reviews.map((review) => (
                <div className="review-comment-card" key={review._id}>
                  <div className="review-comment-hdr">
                    <span className="reviewer-name">{review.userName}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="reviewer-rating">
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ── CUSTOM ADD TO CART SUCCESS MODAL ── */}
      {showCartModal && addedProductDetails && (
        <div className="cart-success-backdrop" onClick={() => setShowCartModal(false)}>
          <div className="cart-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-circle">
              <CheckCircle size={36} />
            </div>
            
            <h3 className="modal-title">
              Added to Cart!
            </h3>
            <p className="modal-subtitle">
              Item has been successfully added to your shopping cart.
            </p>

            <div className="modal-product-preview">
              <img 
                src={addedProductDetails.img} 
                alt={addedProductDetails.name} 
                className="modal-product-img" 
              />
              <div className="modal-product-info">
                <span className="modal-product-brand">{addedProductDetails.brand}</span>
                <h4 className="modal-product-name">{addedProductDetails.name}</h4>
                <div className="modal-product-meta">
                  <span>Qty: {addedProductDetails.quantity}</span>
                  <span className="modal-product-divider">|</span>
                  <span>Rs.{(addedProductDetails.price * addedProductDetails.quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button 
              className="modal-btn-primary" 
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag size={16} />
              View Cart & Checkout
            </button>
            
            <button 
              className="modal-btn-secondary" 
              onClick={() => setShowCartModal(false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
