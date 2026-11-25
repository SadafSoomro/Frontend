import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CreditCard,
  Truck,
  Leaf,
  Tag,
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  ShoppingBag,
  Mail,
  CircleHelp,
  Phone,
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
import { categoryDepartment, departments, productDepartment } from './catalogDepartments';
import { upcomingProducts } from './upcomingProducts';
import { defaultProductFilters, matchesProductFilters, productPrice } from '../../lib/catalogFilters';
import './LandingPage.css';
import './SummerStorefront.css';

const heroSlides = [
  { image: '/luxury/luminosity.webp', label: 'Luminosity. Multiplied.', artworkText: true, department: 'makeup' },
  { image: '/luxury/skincare.jpg', label: 'The Skincare Edit', description: 'Daily essentials for your skincare routine', department: 'skincare' },
  { image: '/luxury/makeup.jpg', label: 'The Makeup Edit', description: 'Discover colours and finishes for every look', department: 'makeup' },
];

const benefits = [
  { icon: ShieldCheck, short: 'Authentic Products', title: '100% Authentic Products', detail: 'Guaranteed original & trusted brands' },
  { icon: Truck, short: 'Fast & Secure Delivery', title: 'Fast Delivery', detail: 'Across Pakistan' },
  { icon: RotateCcw, short: 'Easy Returns (7 Days)', title: 'Easy Returns', detail: '7-day hassle-free returns' },
  { icon: CreditCard, short: 'Secure Payment', title: 'Secure Payment', detail: 'Multiple safe payment options' },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { search, hash } = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(search);
    const department = departments.find(item => item.id === params.get('department'));
    return department ? `department:${department.id}` : (params.get('category') || 'all');
  });

  useEffect(() => {
    if (hash !== '#products-section') return;
    const frame = window.requestAnimationFrame(() => document.getElementById('products-section')?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, [hash]);
  const [productFilters, setProductFilters] = useState(defaultProductFilters);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('makskin-favourites'));
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [heroManuallySelected, setHeroManuallySelected] = useState(false);
  const heroRef = useRef(null);
  const activeSlide = heroSlides[activeBanner];

  useEffect(() => {
    if (heroManuallySelected || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      const hero = heroRef.current;
      if (!hero || document.hidden || hero.matches(':hover, :focus-within')) return;
      const next = (activeBanner + 1) % heroSlides.length;
      if (hero.querySelectorAll('.luxury-hero-image')[next]?.naturalWidth) setActiveBanner(next);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroManuallySelected, activeBanner]);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (desktop.matches) mobileMenuRef.current?.close();
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  const searchRef = useRef(null);
  const promotionalScrollRef = useRef(null);
  const categoryRowRef = useRef(null);
  const categoryInteraction = useRef(0);
  const categoryTouching = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canHover = window.matchMedia('(hover: hover)');
    let frame;
    let previousTime = performance.now();
    let position;

    const advance = (now) => {
      const row = categoryRowRef.current;
      const travelled = Math.min(now - previousTime, 50) * 0.035;
      previousTime = now;
      frame = window.requestAnimationFrame(advance);

      if (!row || reducedMotion.matches || document.hidden || categoryTouching.current ||
        (canHover.matches && row.matches(':hover')) || row.matches(':has(:focus-visible)') ||
        Date.now() < categoryInteraction.current) {
        position = undefined;
        return;
      }

      const first = row.children[0];
      const duplicate = row.children[departments.length];
      if (!first || !duplicate) return;
      const cycle = duplicate.offsetLeft - first.offsetLeft;
      if (cycle < 1) return;
      if (position === undefined || Math.abs(position - row.scrollLeft) > 2) position = row.scrollLeft;
      position = (position + travelled) % cycle;
      row.scrollLeft = position;
    };

    frame = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const delayCategoryScroll = () => {
    categoryInteraction.current = Date.now() + 6500;
  };

  const finishCategoryTouch = (event) => {
    if (event.touches.length) return;
    categoryTouching.current = false;
    delayCategoryScroll();
  };

  const moveCategories = (direction) => {
    const row = categoryRowRef.current;
    if (!row?.firstElementChild) return;
    delayCategoryScroll();
    const end = row.scrollWidth - row.clientWidth;
    const step = row.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap);
    const atEdge = direction > 0 ? row.scrollLeft >= end - 2 : row.scrollLeft <= 2;
    const left = atEdge ? (direction > 0 ? 0 : end) : Math.max(0, Math.min(end, row.scrollLeft + direction * step));
    row.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

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

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const promoBanners = [
    ...banners.filter(banner => banner.image).map(banner => ({
      img: assetUrl(banner.image), brand: banner.title || 'Makskin promotion',
    })),
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
  const categoriesById = new Map(categories.map(category => [category._id, category]));
  const selectedDepartment = departments.find(department => activeTab === `department:${department.id}`);
  const filteredProducts = products.filter((product) => {
    const categoryId = product.category_id?._id ?? product.category_id;
    const matchesDepartment = selectedDepartment &&
      productDepartment(product, categoriesById.get(categoryId))?.id === selectedDepartment.id;
    const matchesTab = searchQuery.trim() ||
      matchesDepartment ||
      activeTab === 'catalog' ||
      (activeTab === 'all' && product.is_featured) ||
      (activeTab === 'saved' && savedIds.includes(product._id)) ||
      (activeTab === 'sale' && product.on_sale === true) ||
      categoryId === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : product.name?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.category_id?.name?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const filterBrands = [...new Set(filteredProducts.map(product => product.brand).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const hasProductFilters = Object.values(productFilters).some(Boolean);
  const invalidPriceRange = productFilters.min !== '' && productFilters.max !== '' &&
    Number(productFilters.min) > Number(productFilters.max);
  const visibleProducts = invalidPriceRange ? [] : filteredProducts.filter(product => matchesProductFilters(product, productFilters));
  const updateProductFilter = (key, value) => setProductFilters(previous => ({ ...previous, [key]: value }));

  const catalogNames = new Set(filteredProducts.map(product => product.name.trim().toLowerCase()));
  const upcomingNames = (hasProductFilters ? [] : upcomingProducts[selectedDepartment?.id] || [])
    .filter(name => !catalogNames.has(name.toLowerCase()) && name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  // Extract unique brand names from products for marquee
  const brandNames = [...new Set(products.map((p) => p.brand))];

  const handleNavClick = (tabId, sectionId) => {
    setSearchQuery('');
    setActiveTab(tabId);
    setProductFilters(defaultProductFilters);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSaved = (id) => {
    const next = savedIds.includes(id) ? savedIds.filter(savedId => savedId !== id) : [...savedIds, id];
    localStorage.setItem('makskin-favourites', JSON.stringify(next));
    setSavedIds(next);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/', message: 'Please login to add items to your cart.' } });
      return;
    }
    const isSaleLive = product.on_sale === true;
    const activePrice = productPrice(product);
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

  const departmentOptions = (department) => categories.filter(category => categoryDepartment(category)?.id === department.id);
  const shopDepartment = (department) => handleNavClick(`department:${department.id}`, 'products-section');
  const mobileMenuAction = (action) => {
    mobileMenuRef.current?.close();
    action();
  };

  return (
    <div className="landing-layout">
      <div className="summer-storefront">

      {/* ── BENEFIT RIBBON ── */}
      <div className="benefit-ribbon">
        {benefits.map(({ icon, short }) => (
          <div className="benefit-item" key={short}>{React.createElement(icon, { size: 21, 'aria-hidden': true })}<span>{short}</span></div>
        ))}
      </div>

      {/* ── STICKY DARK HEADER ── */}
      <header className="landing-header">
        <div className="header-container">
          <button type="button" className="summer-mobile-menu-button" aria-label="Open shopping menu"
            aria-haspopup="dialog" aria-controls="summer-mobile-menu" onClick={() => mobileMenuRef.current?.showModal()}>
            <Menu size={23} aria-hidden="true" />
          </button>
          <Link to="/" className="brand-logo-container">
            <span className="logo-text-box"><Leaf aria-hidden="true" />makskin</span>
          </Link>

          <nav className="header-nav">
            <ul>
              <li><Link className="nav-link-btn summer-home" to="/" aria-current="page" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link></li>
              {departments.slice(0, 4).map(department => (
                <li key={department.id}>
                  <details className="summer-menu">
                    <summary className="nav-link-btn">{department.name}<ChevronDown size={13} aria-hidden="true" /></summary>
                    <div className="summer-menu-options">
                      {departmentOptions(department).length > 0 ? departmentOptions(department).map(category => (
                        <button key={category._id} className="nav-link-btn" onClick={event => {
                          event.currentTarget.closest('details').open = false;
                          handleNavClick(category._id, 'products-section');
                        }}>{category.name}</button>
                      )) : <span>No categories available</span>}
                    </div>
                  </details>
                </li>
              ))}
              <li><button className="nav-link-btn" onClick={() => shopDepartment(departments[5])}>Fragrance</button></li>
              <li><a href="#brands" className="nav-link-btn">Shop All Brands</a></li>
              <li><button onClick={() => handleNavClick('sale', 'products-section')} className="nav-link-btn sale-badge-btn">Sale <Tag size={14} aria-hidden="true" /></button></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="landing-search-wrapper" ref={searchRef}>
              <button className="action-icon-btn" onClick={() => searchRef.current?.querySelector('input')?.focus()} title="Search">
                <Search size={18} />
              </button>
              <input
                type="search"
                placeholder="Search for products, brands..."
                aria-label="Search products and brands"
                className="landing-search-input"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={event => setSearchQuery(event.target.value)}
              />
              {searchOpen && searchQuery.trim() && (
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
                          <span className="search-result-price">Rs.{(product.on_sale === true ? product.price : (product.discount_price || product.price))?.toLocaleString()}</span>
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
            <div className="summer-account-actions">
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
            <button className="action-icon-btn" title="Favourites" aria-label="Favourites" onClick={() => handleNavClick('saved', 'products-section')}><Heart size={26} /></button>
            <button className="action-icon-btn bag-btn-wrapper" title="Shopping Bag" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={26} />
              {totalCartQuantity > 0 && (
                <span className="cart-badge-dot">{totalCartQuantity}</span>
              )}
            </button>
            </div>
          </div>
        </div>
      </header>

      <dialog className="summer-mobile-menu" id="summer-mobile-menu" ref={mobileMenuRef} aria-labelledby="summer-mobile-menu-title"
        onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
        <div className="summer-mobile-menu-content">
          <div className="summer-mobile-menu-header">
            <h2 id="summer-mobile-menu-title"><Leaf size={23} aria-hidden="true" /> Makskin</h2>
            <button type="button" aria-label="Close shopping menu" onClick={() => mobileMenuRef.current?.close()}><X size={23} /></button>
          </div>
          <nav aria-label="Mobile shopping menu">
            <button type="button" onClick={() => mobileMenuAction(() => window.scrollTo({ top: 0, behavior: 'smooth' }))}>Home</button>
            {departments.map(department => (
              <button type="button" key={department.id} onClick={() => mobileMenuAction(() => shopDepartment(department))}>
                <img src={`/category-photos/${department.id}.jpg`} alt="" width="40" height="32" />{department.name}
              </button>
            ))}
            <a href="#brands" onClick={() => mobileMenuRef.current?.close()}>Shop All Brands</a>
            <button type="button" onClick={() => mobileMenuAction(() => handleNavClick('sale', 'products-section'))}>
              <Tag size={18} aria-hidden="true" /> Sale
            </button>
          </nav>
        </div>
      </dialog>

      {/* ── FULL-WIDTH HERO BANNER WITH FADING CAROUSEL ── */}
      <section className="luxury-hero" aria-label="Beauty collections" ref={heroRef}>
        <div className="luxury-hero-stage" style={{ backgroundImage: `url("${activeSlide.image}")` }}>
          <div className="luxury-hero-matte" aria-hidden="true" />
          {heroSlides.map((slide, index) => (
            <img key={slide.image} src={slide.image}
              alt={slide.artworkText && index === activeBanner ? slide.label : ''}
              aria-hidden={index !== activeBanner || undefined}
              className={`luxury-hero-image ${activeBanner === index ? 'active' : ''}`}
              fetchPriority={index === 0 ? 'high' : 'auto'} />
          ))}
          {activeSlide.artworkText ? (
            <h1 className="luxury-visually-hidden">{activeSlide.label}</h1>
          ) : (
            <div className="luxury-hero-copy">
              <h1>{activeSlide.label}</h1>
              <p>{activeSlide.description}</p>
            </div>
          )}
        </div>
        <div className="luxury-hero-controls">
          <button className="luxury-shop-button" type="button" onClick={() => handleNavClick(`department:${activeSlide.department}`, 'products-section')}>
            Shop {activeSlide.department === 'skincare' ? 'Skincare' : 'Makeup'} <ArrowRight size={16} />
          </button>
          <div className="summer-dots" aria-label="Select a banner">
            {heroSlides.map((slide, index) => (
              <button key={slide.image} type="button" aria-label={slide.label} aria-pressed={index === activeBanner} onClick={() => { setHeroManuallySelected(true); setActiveBanner(index); }} />
            ))}
          </div>
        </div>
      </section>

      <div className="summer-benefits">
        {benefits.map(({ icon, title, detail }) => (
          <div key={title}>{React.createElement(icon, { 'aria-hidden': true })}<span><strong>{title}</strong><small>{detail}</small></span></div>
        ))}
      </div>

      <section className="summer-categories" id="summer-categories">
        <div className="summer-category-header">
          <h2><Leaf aria-hidden="true" /> Shop By Category</h2>
        </div>
        <div className="summer-category-carousel">
          <button className="summer-category-arrow" type="button" onClick={() => moveCategories(-1)} aria-label="Scroll categories left" aria-controls="summer-category-row"><ChevronLeft size={21} /></button>
          <div className="summer-category-grid" id="summer-category-row" ref={categoryRowRef} onTouchStart={() => { categoryTouching.current = true; }}
            onTouchEnd={finishCategoryTouch} onTouchCancel={finishCategoryTouch} onWheel={delayCategoryScroll}>
            {[...departments, ...departments].map((department, index) => {
              const duplicate = index >= departments.length;
              return (
                <button type="button" className="summer-category" key={`${department.id}-${index}`}
                  aria-pressed={selectedDepartment?.id === department.id}
                  aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined}
                  onClick={() => shopDepartment(department)}>
                  <img src={`/category-photos/${department.id}.jpg`} alt="" width="480" height="300" />
                  <span>{department.name}</span>
                </button>
              );
            })}
          </div>
          <button className="summer-category-arrow" type="button" onClick={() => moveCategories(1)} aria-label="Scroll categories right" aria-controls="summer-category-row"><ChevronRight size={21} /></button>
        </div>
      </section>
      </div>

      <main className="landing-main summer-main">

        {/* ── PRODUCTS SECTION WITH TABS ── */}
        <section className="bestsellers-section" id="products-section">
          <div className="section-header-row">
            <div className="summer-bestsellers-heading">
              <h2 className="section-title">
                <Leaf aria-hidden="true" />
                {activeTab === 'all' ? 'Bestsellers' : activeTab === 'catalog' ? 'All Products' : activeTab === 'saved' ? 'Favourites' : activeTab === 'sale' ? 'Sale' : selectedDepartment?.name || categories.find(category => category._id === activeTab)?.name || 'Products'}
              </h2>
              {activeTab === 'all' && <span className="summer-most-loved"><Heart size={18} aria-hidden="true" /> Most Loved Products</span>}
            </div>
            <div className="category-tabs-container">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleNavClick('all', 'products-section')}
              >
                Bestsellers
              </button>
              <button type="button" className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => handleNavClick('catalog', 'products-section')}>All Products</button>
              {displayCategories.map(cat => (
                <button
                  key={cat._id}
                  className={`tab-btn ${activeTab === cat._id ? 'active' : ''}`}
                  onClick={() => handleNavClick(cat._id, 'products-section')}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="catalog-filters">
            <legend>Filter products</legend>
            <label>Brand
              <select value={productFilters.brand} onChange={event => updateProductFilter('brand', event.target.value)}>
                <option value="">All brands</option>
                {filterBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </label>
            <label>Min. price (PKR)
              <input type="number" inputMode="numeric" min="0" placeholder="Any" value={productFilters.min} onChange={event => updateProductFilter('min', event.target.value)} />
            </label>
            <label>Max. price (PKR)
              <input type="number" inputMode="numeric" min="0" placeholder="Any" value={productFilters.max} onChange={event => updateProductFilter('max', event.target.value)} />
            </label>
            <label className="catalog-stock-filter">
              <input type="checkbox" checked={productFilters.inStock} onChange={event => updateProductFilter('inStock', event.target.checked)} /> In stock only
            </label>
            {hasProductFilters && <button type="button" onClick={() => setProductFilters(defaultProductFilters)}>Clear filters</button>}
          </fieldset>
          {invalidPriceRange && <p className="catalog-filter-message" role="status">Minimum price must be less than or equal to maximum price.</p>}
          <div className="products-grid">
            {visibleProducts.length === 0 && upcomingNames.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                <ShoppingBag size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ fontSize: '18px', fontWeight: 500 }}>No products found</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>{hasProductFilters ? 'Try adjusting your filters.' : selectedDepartment ? 'This category has no products yet.' : 'Try selecting a different category.'}</p>
              </div>
            ) : (
              visibleProducts.map((product) => {
                const isSaleLive = product.on_sale === true;
                const activePrice = productPrice(product);
                const discount = (isSaleLive && product.discount_price)
                  ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
                  : 0;
                const installment = Math.round(activePrice / 3);
                return (
                  <div className="product-card" key={product._id}>
                    {discount > 0 && (
                      <span className="product-discount-badge">-{discount}%</span>
                    )}
                    <button className="summer-save-product" type="button" aria-label={`Save ${product.name} to favourites`} aria-pressed={savedIds.includes(product._id)} onClick={() => toggleSaved(product._id)}>
                      <Heart size={27} aria-hidden="true" />
                    </button>
                    <Link to={`/product/${product._id}`} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                      <div className="product-img-wrapper">
                        <img src={assetUrl(product.main_image)} alt={product.name} loading="lazy" />
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
                          <span className="product-review-count">({product.reviews})</span>
                        )}
                      </div>
                      <div className="product-price-row">
                        <span className="product-price">Rs.{activePrice.toLocaleString()} PKR</span>
                        {(isSaleLive && product.discount_price) && (
                          <>
                            <span className="product-original-price">Rs.{product.discount_price.toLocaleString()}</span>
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
                        <ShoppingCart size={21} aria-hidden="true" /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            {upcomingNames.map(name => (
              <article className="product-card summer-upcoming-card" key={name}>
                <div className="product-img-wrapper">
                  <img src={`/category-photos/${selectedDepartment.id}.jpg`} alt="" width="480" height="300" loading="lazy" />
                </div>
                <div className="product-info">
                  <span className="product-brand">{selectedDepartment.name}</span>
                  <h3 className="product-name">{name}</h3>
                  <span className="summer-upcoming-label">Coming soon</span>
                </div>
              </article>
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

        {/* ── PROMOTIONAL BANNERS CAROUSEL ── */}
        <section className="promotional-banners-section">
          <div className="promo-banners-wrapper" ref={promotionalScrollRef}>
            <div className="promo-banners-track">
              {[...promoBanners, ...promoBanners].map((banner, i) => (
                <div key={`promo-${i}`} className="promo-banner-card">
                  <img src={banner.img} alt={banner.brand} className="promo-banner-img" loading="lazy" />
                  {banner.discount && <div className="promo-banner-overlay">
                    <div className="promo-banner-brand-text">
                      <h4>{banner.brand}</h4>
                      <p>{banner.title}</p>
                    </div>
                    <div className="promo-banner-discount">
                      <span className="flat-text">FLAT</span>
                      <strong className="discount-val">{banner.discount}</strong>
                      <span className="off-text">OFF</span>
                    </div>
                  </div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROMO BANNER ── */}
        <section className="promo-banner-section summer-sale">
          <div className="summer-sale-content">
            <div className="summer-sale-label"><Leaf size={23} aria-hidden="true" /> LIMITED TIME OFFER</div>
            <h2>SUPER <span>SUMMER</span> SALE</h2>
            <h3>Flat <span>30%</span> Off on Premium Skincare Routine Kits</h3>
            <p>Upgrade your summer beauty ritual with dermatologically tested bundles designed for ultimate hydration, brightening, and barrier repair.</p>
            <div className="summer-sale-actions">
              <button type="button" onClick={() => handleNavClick('sale', 'products-section')}>Shop The Sale <ArrowRight size={20} /></button>
              <span><Truck size={24} aria-hidden="true" /> Free shipping on orders over Rs. 2,000</span>
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
      <footer className="landing-footer summer-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo"><Leaf aria-hidden="true" /> makskin</span>
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
              <li><a href="#returns"><RotateCcw size={21} aria-hidden="true" /> Easy Returns</a></li>
              <li><a href="#shipping"><Truck size={21} aria-hidden="true" /> Shipping Policy</a></li>
              <li><a href="#faq"><CircleHelp size={21} aria-hidden="true" /> FAQ</a></li>
              <li><a href="#contact"><Phone size={21} aria-hidden="true" /> Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Newsletter</h4>
            <p>Subscribe for sales notifications, beauty tips, and product releases.</p>
            <div className="subscribe-form">
              <Mail size={21} aria-hidden="true" />
              <input type="email" placeholder="Your email address" aria-label="Email" />
              <button type="button">Join</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="summer-footer-bar">
            <div className="summer-footer-benefits">
              {benefits.map(({ icon, short }) => <span key={short}>{React.createElement(icon, { size: 24, 'aria-hidden': true })} {short}</span>)}
            </div>
            <p>? 2026 Makskin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
