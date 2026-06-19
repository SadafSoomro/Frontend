import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { removeFromCart, updateQuantity } from '../../Store/Slices/CartSlice';
import { validateCouponApi } from '../../API/api';
import {
  ShieldCheck,
  RotateCcw,
  Lock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Apply promo/voucher code — validated against backend
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const formattedCode = promoCode.trim().toUpperCase();
    if (!formattedCode) {
      setPromoError('Please enter a voucher code.');
      return;
    }
    setPromoLoading(true);
    try {
      const { data } = await validateCouponApi(formattedCode);
      setDiscountPercent(data.discountPercent);
      setPromoSuccess(`Coupon "${data.code}" applied! ${data.discountPercent}% OFF your subtotal.`);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid or expired coupon code.');
      setDiscountPercent(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 200;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleCheckoutClick = () => {
    // Pass discount code state to checkout page via router state
    navigate('/checkout', {
      state: {
        discountPercent,
        discountAmount,
        promoCode: discountPercent > 0 ? promoCode : '',
      }
    });
  };

  return (
    <div className="cart-page-layout">
      {/* ── BENEFIT RIBBON ── */}
      <div className="benefit-ribbon">
        <div className="benefit-item"><ShieldCheck size={14} /><span>Authentic Products</span></div>
        <div className="benefit-item"><RotateCcw size={14} /><span>Easy Returns</span></div>
        <div className="benefit-item"><Lock size={14} /><span>Secure Payment</span></div>
      </div>

      {/* ── HEADER ── */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="brand-logo-container">
            <span className="logo-text-box">makskin</span>
          </Link>
          <div className="cart-header-title">
            <span>Shopping Cart</span>
          </div>
          <div className="header-actions">
            <Link to="/" className="action-icon-btn back-store-btn" title="Back to Shop">
              <ArrowLeft size={16} /> <span className="back-store-text">Back to Store</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="cart-main-container">
        {cartItems.length === 0 ? (
          <div className="cart-page-empty-state">
            <div className="empty-circle">
              <ShoppingBag size={48} />
            </div>
            <h2>Your Shopping Bag is Empty</h2>
            <p>Looks like you haven't added any products to your cart yet. Explore our premium collections to get started.</p>
            <Link to="/" className="continue-shopping-action">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-grid-container">
            {/* Left Column: Cart Items List */}
            <div className="cart-items-column">
              <div className="column-title-row">
                <h2>Your Items ({totalCartQuantity})</h2>
                <Link to="/" className="add-more-link">← Add more products</Link>
              </div>

              <div className="cart-items-table-header">
                <span className="th-product">Product</span>
                <span className="th-price">Price</span>
                <span className="th-qty">Quantity</span>
                <span className="th-total">Total</span>
              </div>

              <div className="cart-items-list-container">
                {cartItems.map((item) => (
                  <div className="cart-page-item-card" key={item.id}>
                    <div className="item-details-cell">
                      <div className="item-thumbnail">
                        <img src={item.img} alt={item.name} />
                      </div>
                      <div className="item-meta">
                        <span className="item-brand">{item.brand}</span>
                        <p className="item-name">{item.name}</p>
                        <button
                          className="item-remove-text-btn"
                          onClick={() => dispatch(removeFromCart(item.id))}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="item-price-cell">
                      <span className="price-label">Price:</span>
                      <span className="price-val">Rs.{item.price.toLocaleString()}</span>
                    </div>

                    <div className="item-qty-cell">
                      <span className="qty-label">Qty:</span>
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

                    <div className="item-total-cell">
                      <span className="total-label">Total:</span>
                      <span className="total-val">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary-column">
              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>Rs.{subtotal.toLocaleString()}</strong>
                </div>

                {discountPercent > 0 && (
                  <div className="summary-row discount-row-highlight">
                    <span>Discount ({discountPercent}%)</span>
                    <strong>- Rs.{discountAmount.toLocaleString()}</strong>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="free-shipping-tag">FREE</span>
                  ) : (
                    <span>Rs.{shippingFee.toLocaleString()}</span>
                  )}
                </div>

                {shippingFee > 0 && (
                  <div className="shipping-notice-box">
                    <p>Add <strong>Rs.{(2000 - subtotal).toLocaleString()}</strong> more to unlock <strong>FREE SHIPPING</strong>!</p>
                  </div>
                )}

                <div className="summary-divider" />

                {/* Promo Coupon Form */}
                <form onSubmit={handleApplyPromo} className="promo-code-form">
                  <div className="promo-input-group">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. MAKSKIN30)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={discountPercent > 0}
                    />
                     <button type="submit" disabled={discountPercent > 0 || promoLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {promoLoading ? (
                        <>
                          <Loader2 className="global-loading-spinner" size={14} />
                          Checking...
                        </>
                      ) : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="promo-msg error">{promoError}</p>}
                  {promoSuccess && <p className="promo-msg success">{promoSuccess}</p>}
                  {discountPercent > 0 && (
                    <button
                      type="button"
                      className="remove-promo-btn"
                      onClick={() => {
                        setDiscountPercent(0);
                        setPromoCode('');
                        setPromoSuccess('');
                      }}
                    >
                      Remove code
                    </button>
                  )}
                </form>

                <div className="summary-divider" />

                <div className="summary-row grand-total-row">
                  <span>Total Amount</span>
                  <span className="grand-total-val">Rs.{grandTotal.toLocaleString()} PKR</span>
                </div>

                <button className="proceed-checkout-btn" onClick={handleCheckoutClick}>
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                <div className="checkout-trust-indicators">
                  <div className="indicator-item">
                    <Lock size={12} />
                    <span>Secure SSL Encrypted Checkout</span>
                  </div>
                  <div className="payment-badges-row">
                    <span className="pay-badge visa">Visa</span>
                    <span className="pay-badge master">Mastercard</span>
                    <span className="pay-badge union">UnionPay</span>
                    <span className="pay-badge cod">Cash on Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-container simplified-footer">
          <div className="footer-brand">
            <span className="footer-logo">makskin</span>
            <p>100% authentic cosmetics, clean skincare, and premium beauty essentials.</p>
          </div>
          <div className="footer-bottom-info">
            <p>© 2026 Makskin. All rights reserved. Authentic Products, Guaranteed.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CartPage;
