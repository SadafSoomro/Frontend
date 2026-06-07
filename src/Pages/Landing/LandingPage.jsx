import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity } from '../../Store/Slices/CartSlice';
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
} from 'lucide-react';
import './LandingPage.css';

const brandSlides = [
  {
    id: 1,
    title: 'THE ORDINARY',
    subtitle: 'CLINICAL FORMULATIONS',
    bg: '#e8ecef',
    img: 'https://images.unsplash.com/photo-1620916566395-044f9003ced4?w=450&h=550&fit=crop',
    desc: 'Sincerity in Formulation',
    badge: 'NEW',
  },
  {
    id: 2,
    title: 'REVOLUTION',
    subtitle: 'MAKEUP REVOLUTION LONDON',
    bg: '#fcddec',
    img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=450&h=550&fit=crop',
    desc: 'POUT LIP OIL',
    badge: 'HOT',
  },
  {
    id: 3,
    title: 'CeraVe',
    subtitle: 'DEVELOPED WITH DERMATOLOGISTS',
    bg: '#e2f0d9',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=450&h=550&fit=crop',
    desc: 'HYDRATING MOISTURIZER',
    badge: 'FLAT 20% OFF',
  },
  {
    id: 4,
    title: 'BIOAQUA',
    subtitle: 'NATURAL ESSENCE SKINCARE',
    bg: '#d2ebec',
    img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=450&h=550&fit=crop',
    desc: 'AVOCADO EYE MASK',
    badge: 'Flat 20% Off',
  },
  {
    id: 5,
    title: 'LOREAL PARIS',
    subtitle: 'BECAUSE YOU ARE WORTH IT',
    bg: '#f9f0e6',
    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=450&h=550&fit=crop',
    desc: 'REVITALIFT SERUM',
    badge: 'BESTSELLER',
  },
];

const storeProducts = [
  // Bestsellers
  {
    id: 1,
    brand: 'OneStop',
    name: 'Hot Air Brush',
    category: 'haircare',
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
    price: 4400,
    originalPrice: 5500,
    discount: 20,
    rating: 4.5,
    reviews: 124,
    installment: 1466,
    bestseller: true,
  },
  {
    id: 2,
    brand: 'ST London',
    name: 'Dual Wet & Dry Compact Powder',
    category: 'makeup',
    img: 'https://images.unsplash.com/photo-1631214524020-3c69888b8f2c?w=400&h=400&fit=crop',
    price: 2760,
    originalPrice: 3450,
    discount: 20,
    rating: 4.5,
    reviews: 200,
    installment: 920,
    bestseller: true,
  },
  {
    id: 3,
    brand: 'AXIS-Y',
    name: 'Dark Spot Correcting Glow Serum — 50ml',
    category: 'skincare',
    img: 'https://images.unsplash.com/photo-1620916566395-044f9003ced4?w=400&h=400&fit=crop',
    price: 4000,
    originalPrice: 5000,
    discount: 20,
    rating: 4.8,
    reviews: 87,
    installment: 1333,
    bestseller: true,
  },
  {
    id: 4,
    brand: 'Medicube',
    name: 'Collagen Night Wrapping Mask — 75ml',
    category: 'skincare',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    price: 5020,
    originalPrice: 6275,
    discount: 20,
    rating: 5,
    reviews: 43,
    installment: 1673,
    bestseller: true,
  },
  {
    id: 5,
    brand: 'CeraVe',
    name: 'Foaming Facial Cleanser',
    category: 'skincare',
    img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
    price: 3200,
    originalPrice: 4000,
    discount: 20,
    rating: 4.5,
    reviews: 65,
    installment: 1066,
    bestseller: true,
  },
  // Extra Skincare
  {
    id: 6,
    brand: 'The Ordinary',
    name: 'Niacinamide 10% + Zinc 1% — 30ml',
    category: 'skincare',
    img: 'https://images.unsplash.com/photo-1620916566395-044f9003ced4?w=400&h=400&fit=crop',
    price: 1800,
    originalPrice: 2250,
    discount: 20,
    rating: 4.8,
    reviews: 142,
    installment: 600,
  },
  {
    id: 7,
    brand: 'Dr. Althea',
    name: '345 Relief Cream — 50ml',
    category: 'skincare',
    img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop',
    price: 3600,
    originalPrice: 4500,
    discount: 20,
    rating: 4.7,
    reviews: 29,
    installment: 1200,
  },
  {
    id: 8,
    brand: 'COSRX',
    name: 'Advanced Snail 96 Mucin Power Essence — 100ml',
    category: 'skincare',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    price: 3900,
    originalPrice: 4875,
    discount: 20,
    rating: 4.9,
    reviews: 215,
    installment: 1300,
  },
  // Extra Haircare
  {
    id: 9,
    brand: 'Framesi',
    name: 'Morphosis Re-Structure Shampoo — 250ml',
    category: 'haircare',
    img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
    price: 2800,
    originalPrice: 3500,
    discount: 20,
    rating: 4.6,
    reviews: 18,
    installment: 933,
  },
  {
    id: 10,
    brand: "L'Oreal",
    name: 'Serie Expert Absolut Repair Mask — 250ml',
    category: 'haircare',
    img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400&h=400&fit=crop',
    price: 4200,
    originalPrice: 5250,
    discount: 20,
    rating: 4.8,
    reviews: 54,
    installment: 1400,
  },
  {
    id: 11,
    brand: 'Gosh',
    name: 'Hair Treatment Oil — 50ml',
    category: 'haircare',
    img: 'https://images.unsplash.com/photo-1522351015484-76f2c417b36a?w=400&h=400&fit=crop',
    price: 2400,
    originalPrice: 3000,
    discount: 20,
    rating: 4.5,
    reviews: 9,
    installment: 800,
  },
  // Extra Makeup
  {
    id: 12,
    brand: 'Maybelline',
    name: 'SuperStay Matte Ink Liquid Lipstick',
    category: 'makeup',
    img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    price: 1900,
    originalPrice: 2375,
    discount: 20,
    rating: 4.7,
    reviews: 320,
    installment: 633,
  },
  {
    id: 13,
    brand: 'ST London',
    name: 'Matte Liquid Concealer',
    category: 'makeup',
    img: 'https://images.unsplash.com/photo-1615396879814-4901929c543f?w=400&h=400&fit=crop',
    price: 1500,
    originalPrice: 1875,
    discount: 20,
    rating: 4.4,
    reviews: 14,
    installment: 500,
  },
  // Extra Babycare
  {
    id: 14,
    brand: 'CeraVe',
    name: 'Baby Wash & Shampoo — 237ml',
    category: 'babycare',
    img: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&h=400&fit=crop',
    price: 2900,
    originalPrice: 3625,
    discount: 20,
    rating: 4.8,
    reviews: 22,
    installment: 966,
  },
  {
    id: 15,
    brand: 'Babi Mild',
    name: 'Baby Cream & Lotion',
    category: 'babycare',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
    price: 1600,
    originalPrice: 2000,
    discount: 20,
    rating: 4.7,
    reviews: 31,
    installment: 533,
  },
];

const categoryData = [
  { name: 'Baby Cream & Lotion', img: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=200&h=200&fit=crop', tab: 'babycare' },
  { name: 'Baby Shampoo', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop', tab: 'babycare' },
  { name: 'Liquid Lipsticks', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Sunscreen', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop', tab: 'skincare' },
  { name: 'Shampoo & Conditioner', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&h=200&fit=crop', tab: 'haircare' },
  { name: 'Foundation', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Mascara', img: 'https://images.unsplash.com/photo-1631214524020-3c69888b8f2c?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Hair Treatment', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop', tab: 'haircare' },
  { name: 'Lip Liners', img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Masks & Peels', img: 'https://images.unsplash.com/photo-1620916566395-044f9003ced4?w=200&h=200&fit=crop', tab: 'skincare' },
  { name: 'Face Wash & Cleansers', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop', tab: 'skincare' },
  { name: 'Makeup Remover', img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=200&h=200&fit=crop', tab: 'skincare' },
  { name: 'Nail Polish', img: 'https://images.unsplash.com/photo-1639739502660-84c205ad88df?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Lip Balm & Mask', img: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Body Wash', img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=200&h=200&fit=crop', tab: 'skincare' },
  { name: 'Primer', img: 'https://images.unsplash.com/photo-1615396879814-4901929c543f?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Candle', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=200&h=200&fit=crop', tab: 'candle' },
  { name: 'Concealers', img: 'https://images.unsplash.com/photo-1615396879555-d41599874a77?w=200&h=200&fit=crop', tab: 'makeup' },
  { name: 'Hair Dye', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop', tab: 'haircare' },
  { name: 'Serums', img: 'https://images.unsplash.com/photo-1620916566395-044f9003ced4?w=200&h=200&fit=crop', tab: 'skincare' },
];

const brandNames = [
  'COSRX', 'Dr. Althea', 'Framesi', 'REVOLUTION', 'AXIS-Y',
  'MAYBELLINE', 'ST LONDON', 'Medicube', 'CeraVe', 'L\'Oreal', 'Bioaqua', 'The Ordinary',
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
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' (bestsellers), 'skincare', 'haircare', 'makeup', 'babycare'
  const [cartOpen, setCartOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);

  const visibleSlides = 3;
  const maxIndex = brandSlides.length - visibleSlides;
  const nextSlide = () => setSlideIndex((prev) => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setSlideIndex((prev) => Math.max(prev - 1, 0));

  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const filteredProducts = storeProducts.filter((product) => {
    if (activeTab === 'all') return product.bestseller;
    return product.category === activeTab;
  });

  const handleNavClick = (tabId, sectionId) => {
    setActiveTab(tabId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setCartOpen(true); // Open the drawer immediately when an item is added
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
            <Link to="/login" className="action-icon-btn" title="My Account"><User size={18} /></Link>
            <button className="action-icon-btn bag-btn-wrapper" title="Shopping Bag" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={18} />
              {totalCartQuantity > 0 && (
                <span className="cart-badge-dot">{totalCartQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── FULL-WIDTH HERO BANNER ── */}
      <section className="hero-banner">
        <img
          src="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1600&h=580&fit=crop&crop=center"
          alt="Hero Banner — Premium Skincare Collection"
          className="hero-bg-img"
        />
        <div className="hero-gradient-overlay" />
        <div className="hero-content">
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
      </section>

      {/* ── SHOP BY CATEGORY SECTION ── */}
      <section className="categories-section">
        <div className="categories-header-container">
          <h2 className="categories-title">Shop By Category</h2>
        </div>
        <div className="categories-grid-wrapper">
          <div className="categories-grid">
            {categoryData.map((cat, i) => (
              <div
                className="category-item"
                key={i}
                onClick={() => handleNavClick(cat.tab, 'products-section')}
              >
                <div className="category-circle">
                  <div className="category-circle-inner-bg">
                    <img src={cat.img} alt={cat.name} className="category-img" />
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
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                {product.discount > 0 && (
                  <span className="product-discount-badge">{product.discount}% OFF</span>
                )}
                <div className="product-img-wrapper">
                  <img src={product.img} alt={product.name} />
                </div>
                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <p className="product-name">{product.name}</p>
                  <div className="product-rating-row">
                    <StarRating rating={product.rating} />
                    {product.reviews > 0 && (
                      <span className="product-review-count">{product.reviews} reviews</span>
                    )}
                  </div>
                  <div className="product-price-row">
                    <span className="product-price">Rs.{product.price.toLocaleString()} PKR</span>
                    <span className="product-original-price">Rs.{product.originalPrice.toLocaleString()}</span>
                    <span className="product-off-label">{product.discount}% OFF</span>
                  </div>
                  <div className="product-installment">
                    <span className="installment-badge">B</span>
                    <span className="installment-label">Pay only</span>
                    <strong className="installment-price">Rs.{product.installment.toLocaleString()}</strong>
                    <span className="installment-label">now</span>
                  </div>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
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

        {/* ── BRAND POSTER CAROUSEL ── */}
        <section className="carousel-section">
          <button className="slide-arrow prev" onClick={prevSlide} aria-label="Previous">
            <ChevronLeft size={24} />
          </button>
          <div className="carousel-wrapper">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${slideIndex * (100 / visibleSlides + 0.7)}%)` }}
            >
              {brandSlides.map((slide) => (
                <div key={slide.id} className="brand-slide-card" style={{ backgroundColor: slide.bg }}>
                  <div className="slide-img-wrapper">
                    <img src={slide.img} alt={slide.title} />
                    {slide.badge && <span className="slide-badge">{slide.badge}</span>}
                  </div>
                  <div className="slide-content">
                    <h3 className="slide-brand-title">{slide.title}</h3>
                    <p className="slide-brand-sub">{slide.subtitle}</p>
                    <p className="slide-brand-desc">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="slide-arrow next" onClick={nextSlide} aria-label="Next">
            <ChevronRight size={24} />
          </button>
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
