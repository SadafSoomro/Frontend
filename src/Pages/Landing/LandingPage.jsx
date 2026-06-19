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
  Package,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const categoriesScrollRef = useRef(null);
  const promotionalScrollRef = useRef(null);

  // Auto-scroll logic for Promotional Banners
  useEffect(() => {
    const promoContainer = promotionalScrollRef.current;
    if (!promoContainer) return;

    let promoAnimationId;
    let promoIsHovering = false;

    const startPromoScroll = () => {
      promoIsHovering = false;
      promoAnimationId = requestAnimationFrame(promoScrollLoop);
    };

    const stopPromoScroll = () => {
      promoIsHovering = true;
      cancelAnimationFrame(promoAnimationId);
    };

    const promoScrollLoop = () => {
      if (!promoIsHovering && promoContainer) {
        promoContainer.scrollLeft += 1;
        if (promoContainer.scrollLeft >= promoContainer.scrollWidth / 2) {
          promoContainer.scrollLeft = 0;
        }
      }
      promoAnimationId = requestAnimationFrame(promoScrollLoop);
    };

    promoAnimationId = requestAnimationFrame(promoScrollLoop);

    promoContainer.addEventListener('mouseenter', stopPromoScroll);
    promoContainer.addEventListener('mouseleave', startPromoScroll);
    promoContainer.addEventListener('touchstart', stopPromoScroll);
    promoContainer.addEventListener('touchend', startPromoScroll);

    return () => {
      cancelAnimationFrame(promoAnimationId);
      if (promoContainer) {
        promoContainer.removeEventListener('mouseenter', stopPromoScroll);
        promoContainer.removeEventListener('mouseleave', startPromoScroll);
        promoContainer.removeEventListener('touchstart', stopPromoScroll);
        promoContainer.removeEventListener('touchend', startPromoScroll);
      }
    };
  }, []);

  // Auto-scroll logic for Shop By Category
  useEffect(() => {
    const scrollContainer = categoriesScrollRef.current;
    if (!scrollContainer) return;

    let animationId;
    let isHovering = false;

    const startScroll = () => {
      isHovering = false;
      animationId = requestAnimationFrame(scrollLoop);
    };

    const stopScroll = () => {
      isHovering = true;
      cancelAnimationFrame(animationId);
    };

    const scrollLoop = () => {
      if (!isHovering && scrollContainer) {
        scrollContainer.scrollLeft += 0.8;
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scrollLoop);
    };

    animationId = requestAnimationFrame(scrollLoop);

    scrollContainer.addEventListener('mouseenter', stopScroll);
    scrollContainer.addEventListener('mouseleave', startScroll);
    scrollContainer.addEventListener('touchstart', stopScroll);
    scrollContainer.addEventListener('touchend', startScroll);

    return () => {
      cancelAnimationFrame(animationId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', stopScroll);
        scrollContainer.removeEventListener('mouseleave', startScroll);
        scrollContainer.removeEventListener('touchstart', stopScroll);
        scrollContainer.removeEventListener('touchend', startScroll);
      }
    };
  }, []);

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

  // Only show top 5 categories that have products
  const displayCategories = categories.filter(cat => 
    products.some(p => p.category_id?._id === cat._id)
  ).slice(0, 5);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
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

  const promoBanners = [
    { img: products.length > 0 && products[0].main_image ? assetUrl(products[0].main_image) : "/hero-model.png", brand: "KRYOLAN", title: "PROFESSIONAL MAKE-UP", discount: "15%" },
    { img: products.length > 1 && products[1].main_image ? assetUrl(products[1].main_image) : "/hero-model.png", brand: "ESTELIN", title: "SKINCARE", discount: "20%" },
    { img: products.length > 2 && products[2].main_image ? assetUrl(products[2].main_image) : "/hero-model.png", brand: "FRAMESI", title: "HAIR FASHION", discount: "15%" },
    { img: products.length > 3 && products[3].main_image ? assetUrl(products[3].main_image) : "/hero-model.png", brand: "LUSCIOUS", title: "LIVE NOW", discount: "20%" },
    { img: products.length > 4 && products[4].main_image ? assetUrl(products[4].main_image) : "/hero-model.png", brand: "L'ORÉAL", title: "PARIS", discount: "20%" },
    { img: products.length > 5 && products[5].main_image ? assetUrl(products[5].main_image) : "/hero-model.png", brand: "ONESKIN", title: "SKIN", discount: "15%" },
  ];

  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Filter products based on active tab AND search query
  const filteredProducts = products.filter((product) => {
    const matchesTab = searchQuery.trim()
      ? true
      : activeTab === 'all'
        ? product.is_featured
        : product.category_id?._id === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : product.name?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.category_id?.name?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
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
              {displayCategories.map((cat) => (
                <li key={cat._id}>
                  <button onClick={() => handleNavClick(cat._id, 'products-section')} className="nav-link-btn">{cat.name}</button>
                </li>
              ))}
              <li><a href="#brands" className="nav-link-btn">Shop All Brands</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className={`landing-search-wrapper ${searchOpen ? 'open' : ''}`} ref={searchRef}>
              <button className="action-icon-btn" onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(''); }} title="Search">
                <Search size={18} />
              </button>
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search products..."
                  className="landing-search-input"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              )}
              {searchQuery.trim() && (
                <div className="search-results-dropdown">
                  {filteredProducts.length === 0 ? (
                    <div className="search-no-result">No products found for "{searchQuery}"</div>
                  ) : (
                    filteredProducts.slice(0, 6).map((product) => (
                      <div
                        key={product._id}
                        className="search-result-item"
                        onClick={() => {
                          const el = document.getElementById('products-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                      >
                        <img src={assetUrl(product.main_image)} alt={product.name} className="search-result-img" />
                        <div className="search-result-info">
                          <span className="search-result-brand">{product.brand}</span>
                          <span className="search-result-name">{product.name}</span>
                          <span className="search-result-price">Rs.{product.price?.toLocaleString()}</span>
                        </div>
                        <button
                          className="search-add-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                            setSearchQuery('');
                            setSearchOpen(false);
                          }}
                        >
                          <ShoppingBag size={14} /> Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
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
                    <Link to="/my-orders" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Package size={16} /> My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <User size={16} /> Admin Dashboard
                      </Link>
                    )}
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
        <div className="categories-grid-wrapper" ref={categoriesScrollRef}>
          <div className="categories-grid">
            {[...categories, ...categories].map((cat, idx) => (
              <div
                className="category-item"
                key={`${cat._id}-${idx}`}
                onClick={() => handleNavClick(cat._id, 'products-section')}
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
              {activeTab === 'all' 
                ? 'Bestsellers' 
                : categories.find(c => c._id === activeTab)?.name || 'Products'}
            </h2>
            <div className="category-tabs-container">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Bestsellers
              </button>
              {displayCategories.map(cat => (
                <button
                  key={cat._id}
                  className={`tab-btn ${activeTab === cat._id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat._id)}
                >
                  {cat.name}
                </button>
              ))}
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
                    <Link to={`/product/${product._id}`} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                      <div className="product-img-wrapper">
                        <img src={assetUrl(product.main_image)} alt={product.name} />
                      </div>
                    </Link>
                    <div className="product-info">
                      <Link to={`/product/${product._id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                        <span className="product-brand">{product.brand}</span>
                        <p className="product-name" style={{ margin: '4px 0 0' }}>{product.name}</p>
                      </Link>
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

        {/* ── PROMOTIONAL BANNERS CAROUSEL ── */}
        <section className="promotional-banners-section">
          <div className="promo-banners-wrapper" ref={promotionalScrollRef}>
            <div className="promo-banners-track">
              {[...promoBanners, ...promoBanners].map((banner, i) => (
                <div key={`promo-${i}`} className="promo-banner-card">
                  <img src={banner.img} alt={banner.brand} className="promo-banner-img" />
                  <div className="promo-banner-overlay">
                    <div className="promo-banner-brand-text">
                      <h4>{banner.brand}</h4>
                      <p>{banner.title}</p>
                    </div>
                    <div className="promo-banner-discount">
                      <span className="flat-text">FLAT</span>
                      <strong className="discount-val">{banner.discount}</strong>
                      <span className="off-text">OFF</span>
                    </div>
                  </div>
                </div>
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
              {displayCategories.map(cat => (
                <li key={cat._id}>
                  <button onClick={() => handleNavClick(cat._id, 'products-section')} className="footer-nav-btn">{cat.name}</button>
                </li>
              ))}
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
