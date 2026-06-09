import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { addToCart, removeFromCart, updateQuantity } from '../../Store/Slices/CartSlice';
import { getProducts } from '../../Store/Slices/ProductSlice';
import { getCategories } from '../../Store/Slices/CategorySlice';
import { getBanners } from '../../Store/Slices/BannerSlice';
import { assetUrl } from '../../config';
import {
  ShieldCheck,
  RotateCcw,
  Lock,
  Search,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Star,
  X,
  Trash2,
  Plus,
  Minus,
  LogOut,
  Settings,
} from 'lucide-react';
import './LandingPage.css';

const StarRating = ({ rating }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={12}
        fill={s <= Math.floor(rating) ? '#f59e0b' : (s - 0.5 <= rating ? '#f59e0b' : 'none')}
        color="#f59e0b"
      />
    ))}
  </div>
);

const LandingPage = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const userMenuRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { banners } = useSelector((state) => state.banners);

  // Fetch data from API on mount
  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(getBanners());
  }, [dispatch]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hero banner auto-advance
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Filter products based on active tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === 'all') return product.is_featured;
    const productCat = (product.category_id?.description || '').toLowerCase().replace(/\s+/g, '');
    const tabNormalized = activeTab.toLowerCase().replace(/\s+/g, '');
    return productCat === tabNormalized;
  });

  // Extract unique brand names from products for marquee
  const brandNames = [...new Set(products.map((p) => p.brand))];

  const handleNavClick = (tabId, sectionId) => {
    setActiveTab(tabId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/', message: 'Please login to add items to your cart.' } });
      return;
    }
    const discount = product.discount_price
      ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
      : 0;
    dispatch(addToCart({
      id: product._id,
      brand: product.brand,
      name: product.name,
      price: product.price,
      originalPrice: product.discount_price || product.price,
      discount,
      img: assetUrl(product.main_image),
    }));
    setCartOpen(true);
  };

  return (
    <div className="landing-layout">

      {/* ── BENEFIT RIBBON ── */}
      <div className="benefit-ribbon">
        <div className="benefit-item"><ShieldCheck size={14} /><span>Authentic Products</span></div>
        <div className="benefit-item"><RotateCcw size={14} /><span>Easy Returns</span></div>
        <div className="benefit-item"><Lock size={14} /><span>Secure Payment</span></div>
      </div>

      {/* ── STICKY DARK HEADER ── */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="brand-logo-container">
            <span className="logo-text-box">makskin</span>
          </Link>

          <nav className="header-nav">
            <ul>
              <li><button onClick={() => handleNavClick('all', 'products-section')} className="nav-link-btn sale-badge-btn">Sale</button></li>
              <li><button onClick={() => handleNavClick('makeup', 'products-section')} className="nav-link-btn">Makeup</button></li>
              <li><button onClick={() => handleNavClick('skincare', 'products-section')} className="nav-link-btn">Skin Care</button></li>
              <li><button onClick={() => handleNavClick('haircare', 'products-section')} className="nav-link-btn">Hair Care</button></li>
              <li><button onClick={() => handleNavClick('babycare', 'products-section')} className="nav-link-btn">Baby Care</button></li>
              <li><button onClick={() => handleNavClick('perfumes', 'products-section')} className="nav-link-btn">Perfumes</button></li>
              <li><button onClick={() => handleNavClick('candle', 'products-section')} className="nav-link-btn">Candle</button></li>
              <li><a href="#brands" className="nav-link-btn">Shop All Brands</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className={`landing-search-wrapper ${searchOpen ? 'open' : ''}`}>
              <button className="action-icon-btn" onClick={() => setSearchOpen(!searchOpen)} title="Search">
                <Search size={18} />
              </button>
              {searchOpen && (
                <input type="text" placeholder="Search products..." className="landing-search-input" autoFocus />
              )}
            </div>
            {isAuthenticated ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  className="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title="My Account"
                >
                  <User size={18} />
                  <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-name">{user?.name}</span>
                      <span className="user-dropdown-email">{user?.email}</span>
                    </div>
                    <Link to="/profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={16} /> Edit Profile
                    </Link>
                    <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={16} /> Admin Dashboard
                    </Link>
                    <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="action-icon-btn" title="My Account"><User size={18} /></Link>
            )}
            <button className="action-icon-btn bag-btn-wrapper" title="Shopping Bag" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={18} />
              {totalCartQuantity > 0 && (
                <span className="cart-badge-dot">{totalCartQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── FULL-WIDTH HERO BANNER WITH FADING CAROUSEL ── */}
      <section className="hero-banner" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Stacked banner images with fade transition */}
        {banners.map((banner, index) => (
          <img
            key={banner._id}
            src={assetUrl(banner.image)}
            alt={banner.title || `Hero Banner ${index + 1}`}
            className="hero-bg-img"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: activeBanner === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 1,
            }}
          />
        ))}
        <div className="hero-gradient-overlay" style={{ position: 'relative', zIndex: 2 }} />
        <div className="hero-content" style={{ position: 'relative', zIndex: 3 }}>
          <div className="hero-tag">
            <Sparkles size={14} />
            <span>SUMMER COLLECTION 2026</span>
          </div>
          <h1 className="hero-headline">
            Discover Your<br />
            <span className="hero-highlight">Perfect Skincare</span>
          </h1>
          <p className="hero-sub">
            Shop 150+ authentic beauty brands with guaranteed delivery,
            easy returns, and exclusive members‑only discounts.
          </p>
          <div className="hero-cta-group">
            <button className="hero-cta-primary" onClick={() => handleNavClick('all', 'products-section')}>
              Shop Now <ArrowRight size={16} />
            </button>
            <button className="hero-cta-secondary" onClick={() => handleNavClick('all', 'products-section')}>
              Flat 30% OFF →
            </button>
          </div>
        </div>
        {/* Dot indicators */}
        {banners.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              zIndex: 4,
            }}
          >
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveBanner(index)}
                aria-label={`Go to banner ${index + 1}`}
                style={{
                  width: activeBanner === index ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: activeBanner === index ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SHOP BY CATEGORY SECTION ── */}
      <section className="categories-section">
        <div className="categories-header-container">
          <h2 className="categories-title">Shop By Category</h2>
        </div>
        <div className="categories-grid-wrapper">
          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                className="category-item"
                key={cat._id}
                onClick={() => handleNavClick(cat.description, 'products-section')}
              >
                <div className="category-circle">
                  <div className="category-circle-inner-bg">
                    <img src={assetUrl(cat.image)} alt={cat.name} className="category-img" />
                  </div>
                </div>
                <span className="category-label">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="landing-main">

        {/* ── PRODUCTS SECTION WITH TABS ── */}
        <section className="bestsellers-section" id="products-section">
          <div className="section-header-row">
            <h2 className="section-title">
              {activeTab === 'all' ? 'Bestsellers' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('care', ' Care')}
            </h2>
            <div className="category-tabs-container">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Bestsellers
              </button>
              <button
                className={`tab-btn ${activeTab === 'skincare' ? 'active' : ''}`}
                onClick={() => setActiveTab('skincare')}
              >
                Skin Care
              </button>
              <button
                className={`tab-btn ${activeTab === 'haircare' ? 'active' : ''}`}
                onClick={() => setActiveTab('haircare')}
              >
                Hair Care
              </button>
              <button
                className={`tab-btn ${activeTab === 'makeup' ? 'active' : ''}`}
                onClick={() => setActiveTab('makeup')}
              >
                Makeup
              </button>
              <button
                className={`tab-btn ${activeTab === 'babycare' ? 'active' : ''}`}
                onClick={() => setActiveTab('babycare')}
              >
                Baby Care
              </button>
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                <ShoppingBag size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ fontSize: '18px', fontWeight: 500 }}>No products found</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>Try selecting a different category.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const discount = product.discount_price
                  ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
                  : 0;
                const installment = Math.round(product.price / 3);
                return (
                  <div className="product-card" key={product._id}>
                    {discount > 0 && (
                      <span className="product-discount-badge">{discount}% OFF</span>
                    )}
                    <div className="product-img-wrapper">
                      <img src={assetUrl(product.main_image)} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <span className="product-brand">{product.brand}</span>
                      <p className="product-name">{product.name}</p>
                      <div className="product-rating-row">
                        <StarRating rating={product.rating || 0} />
                        {product.reviews > 0 && (
                          <span className="product-review-count">{product.reviews} reviews</span>
                        )}
                      </div>
                      <div className="product-price-row">
                        <span className="product-price">Rs.{product.price.toLocaleString()} PKR</span>
                        {product.discount_price && (
                          <>
                            <span className="product-original-price">Rs.{product.discount_price.toLocaleString()}</span>
                            <span className="product-off-label">{discount}% OFF</span>
                          </>
                        )}
                      </div>
                      <div className="product-installment">
                        <span className="installment-badge">B</span>
                        <span className="installment-label">Pay only</span>
                        <strong className="installment-price">Rs.{installment.toLocaleString()}</strong>
                        <span className="installment-label">now</span>
                      </div>
                      <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── BRANDS MARQUEE ── */}
        <section className="brands-strip-section" id="brands">
          <div className="brands-strip-header">
            <h2>Home to 150+</h2>
            <p>Authentic Brands</p>
          </div>
          <div className="brands-marquee-wrapper">
            <div className="brands-marquee-track">
              {[...brandNames, ...brandNames].map((b, i) => (
                <span key={i} className="brand-marquee-item">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROMO BANNER ── */}
        <section className="promo-banner-section">
          <div className="wide-promo-banner">
            <div className="promo-gradient-overlay" />
            <div className="promo-content">
              <div className="promo-tag">
                <Sparkles size={16} />
                <span>LIMITED TIME EXCLUSIVE</span>
              </div>
              <h2>SUPER SUMMER SALE</h2>
              <h3>Flat 30% Off on Premium Skincare Routine Kits</h3>
              <p>
                Upgrade your summer beauty ritual with dermatologically tested bundles
                designed for ultimate hydration, brightening, and barrier repair.
              </p>
              <div className="promo-actions">
                <button className="promo-shop-btn" onClick={() => handleNavClick('all', 'products-section')}>Shop The Sale <ArrowRight size={16} /></button>
                <span className="promo-shipping-notice">Free shipping on orders over Rs. 2,000</span>
              </div>
            </div>
            <div className="promo-image-pane">
              <img
                src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&h=450&fit=crop"
                alt="Summer Sale"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ── SLIDE-OUT CART DRAWER ── */}
      <div className={`cart-drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
        <div className="cart-drawer-container" onClick={(e) => e.stopPropagation()}>
          <div className="cart-drawer-header">
            <div className="header-title-wrapper">
              <ShoppingBag size={20} className="bag-icon" />
              <h3>Shopping Bag ({totalCartQuantity})</h3>
            </div>
            <button className="close-cart-btn" onClick={() => setCartOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="cart-drawer-items-wrapper">
            {cartItems.length === 0 ? (
              <div className="cart-empty-state">
                <ShoppingBag size={48} className="empty-bag-icon" />
                <p className="empty-title">Your shopping bag is empty</p>
                <p className="empty-sub">Add products to your bag to check out!</p>
                <button className="empty-shop-btn" onClick={() => setCartOpen(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div className="cart-drawer-item" key={item.id}>
                    <div className="cart-item-img-pane">
                      <img src={item.img} alt={item.name} />
                    </div>
                    <div className="cart-item-info-pane">
                      <span className="item-brand">{item.brand}</span>
                      <p className="item-name">{item.name}</p>
                      <div className="item-price-quantity-row">
                        <span className="item-price-calc">
                          Rs.{item.price.toLocaleString()} x {item.quantity}
                        </span>
                        <div className="item-quantity-controls">
                          <button
                            className="qty-btn"
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="remove-item-btn"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      title="Remove product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-drawer-footer">
              <div className="subtotal-row">
                <span>Subtotal:</span>
                <span className="subtotal-amount">Rs.{totalCartPrice.toLocaleString()} PKR</span>
              </div>
              <p className="tax-shipping-info">Shipping calculated at checkout. Taxes included.</p>
              <div className="checkout-cta-row">
                <button
                  className="view-cart-btn"
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/cart');
                  }}
                >
                  View Bag
                </button>
                <button
                  className="drawer-checkout-btn"
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/checkout');
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">makskin</span>
            <p>Your one‑stop destination for authentic cosmetics, clean skincare, and premium beauty essentials.</p>
          </div>
          <div className="footer-links-col">
            <h4>Shop</h4>
            <ul>
              <li><button onClick={() => handleNavClick('makeup', 'products-section')} className="footer-nav-btn">Makeup</button></li>
              <li><button onClick={() => handleNavClick('skincare', 'products-section')} className="footer-nav-btn">Skin Care</button></li>
              <li><button onClick={() => handleNavClick('haircare', 'products-section')} className="footer-nav-btn">Hair Care</button></li>
              <li><button onClick={() => handleNavClick('babycare', 'products-section')} className="footer-nav-btn">Baby Care</button></li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#returns">Easy Returns</a></li>
              <li><a href="#shipping">Shipping Policy</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Newsletter</h4>
            <p>Subscribe for sales notifications, beauty tips, and product releases.</p>
            <div className="subscribe-form">
              <input type="email" placeholder="Your email address" aria-label="Email" />
              <button type="button">Join</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Makskin. All rights reserved. Authentic Products, Guaranteed.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
