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
  Truck,
  Leaf,
  ShoppingCart,
  Heart,
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
import HeroCarousel from './HeroCarousel';
import './LandingPage.css';

const collections = [
  { key: 'skincare', name: 'Skincare', match: /skin\s*care|serum|cleanser|face wash|peel/ },
  { key: 'makeup', name: 'Makeup', match: /make[ -]?up|lipstick|lip liner|foundation|mascara|concealer|primer|nail polish/ },
  { key: 'haircare', name: 'Hair Care', match: /hair|shampoo|conditioner/ },
  { key: 'bodycare', name: 'Body Care', match: /body|bath/ },
  { key: 'babycare', name: 'Baby Care', match: /baby/ },
  { key: 'sunscreen', name: 'Sunscreen', match: /sunscreen|sun care|sunblock|spf/ },
  { key: 'fragrance', name: 'Fragrance', match: /fragrance|perfume|cologne/ },
  { key: 'tools', name: 'Tools & Accessories', match: /tools|accessor|brush|sponge/ },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('makskin-favourites'));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
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

  const collectionsWithCategories = collections.map(collection => ({
    ...collection,
    categories: categories.filter(category => {
      const name = category.name.toLowerCase();
      if (collection.key === 'makeup' && name.includes('remover')) return false;
      if (collection.key === 'haircare' && name.includes('baby')) return false;
      return collection.match.test(name) || category.description?.trim().toLowerCase() === collection.key;
    }),
  }));
  const displayCategories = collectionsWithCategories.slice(0, 4);
  const categoryTiles = [
    ...collectionsWithCategories.filter(collection => collection.categories.length).map(collection => ({
      _id: collection.key,
      name: collection.name,
      image: collection.categories.find(category => category.image)?.image,
    })),
    ...categories.filter(category => !collectionsWithCategories.some(collection =>
      collection.categories.some(member => member._id === category._id))),
  ];
  const selectedCollection = collectionsWithCategories.find(collection => collection.key === activeTab);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Filter products based on active tab AND search query
  const hasFeaturedProducts = products.some(product => product.is_featured);
  const filteredProducts = products.filter((product) => {
    const matchesTab = searchQuery.trim() || activeTab === 'catalog' ||
      (activeTab === 'all' && (product.is_featured || !hasFeaturedProducts)) ||
      (activeTab === 'sale' && product.on_sale === true) ||
      (activeTab === 'saved' && savedIds.includes(product._id)) ||
      selectedCollection?.categories.some(category => category._id === product.category_id?._id) ||
      product.category_id?._id === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : product.name?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.category_id?.name?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  // Extract unique brand names from products for marquee
  const brandNames = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const handleNavClick = (tabId, sectionId) => {
    setSearchQuery('');
    setActiveTab(tabId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSaved = (id) => {
    const next = savedIds.includes(id) ? savedIds.filter(savedId => savedId !== id) : [...savedIds, id];
    setSavedIds(next);
    localStorage.setItem('makskin-favourites', JSON.stringify(next));
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/', message: 'Please login to add items to your cart.' } });
      return;
    }
    const isSaleLive = product.on_sale === true;
    const activePrice = isSaleLive ? product.price : (product.discount_price || product.price);
    const discount = (isSaleLive && product.discount_price)
      ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
      : 0;

    dispatch(addToCart({
      id: product._id,
      brand: product.brand,
      name: product.name,
      price: activePrice,
      originalPrice: activePrice,
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
        <div className="benefit-item"><Truck size={14} /><span>Fast &amp; Secure Delivery</span></div>
        <div className="benefit-item"><RotateCcw size={14} /><span>Easy Returns</span></div>
        <div className="benefit-item"><Lock size={14} /><span>Secure Payment</span></div>
      </div>

      {/* ── STICKY DARK HEADER ── */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="brand-logo-container">
            <span className="logo-text-box"><Leaf aria-hidden="true" />makskin</span>
          </Link>

          <nav className="header-nav">
            <ul>
              <li><Link to="/" className="nav-link-btn home-nav-link" onClick={() => { setSearchQuery(''); setActiveTab('all'); window.scrollTo(0, 0); }}>Home</Link></li>
              {displayCategories.map((cat) => (
                <li key={cat._id || cat.key}>
                  <button onClick={() => handleNavClick(cat._id || cat.key, 'products-section')} className="nav-link-btn">{cat.name}</button>
                </li>
              ))}
              <li><a href="#brands" className="nav-link-btn">Shop All Brands</a></li>
              <li><button onClick={() => handleNavClick('sale', 'products-section')} className="nav-link-btn sale-badge-btn">Sale</button></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="landing-search-wrapper" ref={searchRef}>
              <button className="action-icon-btn" onClick={() => { searchRef.current?.querySelector('input')?.focus(); }} title="Search">
                <Search size={18} />
              </button>
              <input
                type="search"
                placeholder="Search for products, brands..."
                aria-label="Search products and brands"
                className="landing-search-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery.trim() && (
                <div className="search-results-dropdown">
                  {filteredProducts.length === 0 ? (
                    <div className="search-no-result">No products found for "{searchQuery}"</div>
                  ) : (
                    filteredProducts.slice(0, 6).map((product) => (
                      <div key={product._id} className="search-result-item">
                        <img src={assetUrl(product.main_image)} alt={product.name} className="search-result-img" />
                        <Link className="search-result-info" to={`/product/${product._id}`}>
                          <span className="search-result-brand">{product.brand}</span>
                          <span className="search-result-name">{product.name}</span>
                          <span className="search-result-price">Rs.{(product.on_sale === true ? product.price : (product.discount_price || product.price))?.toLocaleString()}</span>
                        </Link>
                        <button
                          className="search-add-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                            setSearchQuery('');
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
            <button className="action-icon-btn" aria-label="Favourites" onClick={() => handleNavClick('saved', 'products-section')}><Heart size={22} /></button>
            <button className="action-icon-btn bag-btn-wrapper" title="Shopping Bag" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={22} />
              {totalCartQuantity > 0 && (
                <span className="cart-badge-dot">{totalCartQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── FULL-WIDTH HERO BANNER WITH FADING CAROUSEL ── */}
      <HeroCarousel onShop={(category) => handleNavClick(category, 'products-section')} />
      <div className="store-assurances">
        <div><Leaf /><span><strong>100% Authentic Products</strong><small>Original products from trusted brands</small></span></div>
        <div><Truck /><span><strong>Fast Delivery</strong><small>Across Pakistan</small></span></div>
        <div><RotateCcw /><span><strong>Easy Returns</strong><small>Hassle-free returns</small></span></div>
        <div><ShieldCheck /><span><strong>Secure Payment</strong><small>Multiple payment options</small></span></div>
      </div>

      {/* ── SHOP BY CATEGORY SECTION ── */}
      <section className="categories-section">
        <div className="categories-header-container">
          <h2 className="categories-title"><Leaf size={21} /> Shop By Category</h2>
          <button className="store-text-button" onClick={() => handleNavClick('catalog', 'products-section')}>View All Products <ArrowRight size={16} /></button>
        </div>
        <div className="categories-grid-wrapper">
          <div className="categories-grid">
            {categoryTiles.map((cat) => (
              <button
                type="button"
                className={`category-item ${activeTab === (cat._id || cat.key) ? "selected" : ""}`}
                key={cat._id}
                onClick={() => handleNavClick(cat._id || cat.key, 'products-section')}
              >
                <div className="category-circle">
                  <div className="category-circle-inner-bg">
                    {cat.image ? <img src={assetUrl(cat.image)} alt="" className="category-img" /> : <Leaf size={25} aria-hidden="true" />}
                  </div>
                </div>
                <span className="category-label">{cat.name}</span>
              </button>
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
                : ({ sale: 'Sale', saved: 'Favourites' })[activeTab] || selectedCollection?.name || categories.find(c => c._id === activeTab)?.name || 'Products'}
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
                  className={`tab-btn ${activeTab === (cat._id || cat.key) ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat._id || cat.key)}
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
                const isSaleLive = product.on_sale === true;
                const activePrice = isSaleLive ? product.price : (product.discount_price || product.price);
                const discount = (isSaleLive && product.discount_price)
                  ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
                  : 0;
                return (
                  <div className="product-card" key={product._id}>
                    <button className="product-save" type="button" aria-label={`Save ${product.name}`} aria-pressed={savedIds.includes(product._id)} onClick={() => toggleSaved(product._id)}>
                      <Heart size={16} fill={savedIds.includes(product._id) ? 'currentColor' : 'none'} />
                    </button>
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
                        <span className="product-price">Rs.{activePrice.toLocaleString()} PKR</span>
                        {(isSaleLive && product.discount_price) && (
                          <>
                            <span className="product-original-price">Rs.{product.discount_price.toLocaleString()}</span>
                            <span className="product-off-label">{discount}% OFF</span>
                          </>
                        )}
                      </div>
                      <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart size={16} /> Add to Cart
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
        {banners.length > 0 && (
          <section className="store-campaigns" aria-label="Store promotions">
            {banners.map(banner => (
              <img key={banner._id} src={assetUrl(banner.image)} alt={banner.title || 'Makskin promotion'} loading="lazy" />
            ))}
          </section>
        )}
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
                  <button onClick={() => handleNavClick(cat._id || cat.key, 'products-section')} className="footer-nav-btn">{cat.name}</button>
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
