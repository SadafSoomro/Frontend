import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../Store/Slices/CartSlice';
import {
  ShieldCheck,
  RotateCcw,
  Lock,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Building,
  CheckCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);

  // Read discount data passed from CartPage router state
  const {
    discountPercent = 0,
    discountAmount = 0,
    promoCode = '',
  } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'card' | 'bank'
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderTrackingNumber, setOrderTrackingNumber] = useState('');

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 200;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);

    // Simulate backend checkout processing API call
    setTimeout(() => {
      // Generate unique tracking number (e.g. MS-189725)
      const randomId = Math.floor(100000 + Math.random() * 900000);
      setOrderTrackingNumber(`MS-${randomId}`);
      setLoading(false);
      setShowSuccessModal(true);

      // Clear the cart on successful order placement
      dispatch(clearCart());
    }, 1500);
  };

  return (
    <div className="checkout-page-layout">
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
          <div className="checkout-header-title">
            <Lock size={14} className="lock-icon" />
            <span>Secure Checkout</span>
          </div>
          <div className="header-actions">
            <Link to="/cart" className="action-icon-btn back-cart-btn" title="Back to Cart">
              <ArrowLeft size={16} /> <span className="back-cart-text">Back to Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTAINER ── */}
      <main className="checkout-main-container">
        {cartItems.length === 0 && !showSuccessModal ? (
          <div className="checkout-page-empty">
            <div className="empty-circle">
              <ShoppingBag size={40} />
            </div>
            <h2>No items to checkout</h2>
            <p>Your shopping bag is empty. Please add items to your cart before proceeding.</p>
            <Link to="/" className="return-store-btn">Shop Collections</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-grid-container">
            {/* Left Column: Shipping & Payment forms */}
            <div className="checkout-forms-column">
              {/* Shipping Details */}
              <div className="form-section-card">
                <div className="section-hdr">
                  <span className="step-num">1</span>
                  <h3>Shipping Information</h3>
                </div>

                <div className="form-grid-inputs">
                  <div className="form-group span-2">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="03XXXXXXXXX"
                      required
                    />
                  </div>

                  <div className="form-group span-2">
                    <label htmlFor="address">Street Address</label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House/Apartment number, street name, area"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode">Postal / Zip Code</label>
                    <input
                      id="zipCode"
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="e.g. 54000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="form-section-card">
                <div className="section-hdr">
                  <span className="step-num">2</span>
                  <h3>Payment Method</h3>
                </div>

                <div className="payment-options-group">
                  {/* Cash on Delivery */}
                  <label className={`payment-option-label ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <Truck size={20} className="option-icon" />
                    <div className="option-info">
                      <strong>Cash on Delivery (COD)</strong>
                      <span>Pay in cash when your order is delivered to your doorstep.</span>
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label className={`payment-option-label ${paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <CreditCard size={20} className="option-icon" />
                    <div className="option-info">
                      <strong>Credit / Debit Card</strong>
                      <span>Pay securely online with Visa, Mastercard, or UnionPay.</span>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`payment-option-label ${paymentMethod === 'bank' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                    />
                    <Building size={20} className="option-icon" />
                    <div className="option-info">
                      <strong>Direct Bank Transfer</strong>
                      <span>Transfer directly to our account. Order ships after confirmation.</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-input-details-subform">
                    <p className="subform-notice">Card payment fields are disabled in demo mode. Please select Cash on Delivery.</p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="card-input-details-subform">
                    <p className="bank-details-row">Bank: <strong>Habib Bank Limited (HBL)</strong></p>
                    <p className="bank-details-row">Account Name: <strong>Makskin Cosmetics</strong></p>
                    <p className="bank-details-row">IBAN: <strong>PK12 HABB 0192 8374 6509 2314</strong></p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order items summary & Checkout Action */}
            <div className="checkout-summary-column">
              <div className="order-summary-card">
                <h3>Order Summary</h3>

                {/* Items Mini-list */}
                <div className="mini-items-list">
                  {cartItems.map((item) => (
                    <div className="mini-item-row" key={item.id}>
                      <div className="mini-img-wrapper">
                        <img src={item.img} alt={item.name} />
                        <span className="mini-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="mini-item-details">
                        <p className="mini-name">{item.name}</p>
                        <span className="mini-brand">{item.brand}</span>
                      </div>
                      <span className="mini-price">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider" />

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>Rs.{subtotal.toLocaleString()}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="summary-row discount-row-highlight">
                    <span>Discount ({discountPercent}% {promoCode && `"${promoCode.toUpperCase()}"`})</span>
                    <span>- Rs.{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="free-shipping-tag">FREE</span>
                  ) : (
                    <span>Rs.{shippingFee.toLocaleString()}</span>
                  )}
                </div>

                <div className="summary-divider" />

                <div className="summary-row final-total-row">
                  <span>Total Due</span>
                  <span className="final-total-val">Rs.{grandTotal.toLocaleString()} PKR</span>
                </div>

                <button type="submit" className="place-order-btn" disabled={loading}>
                  {loading ? 'Processing Order...' : `Place Order (Rs.${grandTotal.toLocaleString()})`}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* ── ORDER SUCCESS MODAL OVERLAY ── */}
      {showSuccessModal && (
        <div className="order-success-backdrop">
          <div className="success-modal-card">
            <div className="success-icon-container">
              <CheckCircle size={52} className="check-icon" />
            </div>
            <h2>Order Placed Successfully!</h2>
            <div className="success-tag">
              <Sparkles size={14} />
              <span>THANK YOU FOR SHOPPING</span>
            </div>
            <p className="success-intro">Your order has been received and is currently being processed. An email receipt has been sent to your inbox.</p>

            <div className="order-meta-box">
              <div className="meta-row">
                <span>Order Tracking ID</span>
                <strong className="tracking-val">{orderTrackingNumber}</strong>
              </div>
              <div className="meta-row">
                <span>Payment Method</span>
                <strong className="payment-val">
                  {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}
                </strong>
              </div>
              <div className="meta-row">
                <span>Estimated Delivery</span>
                <strong className="delivery-val">3 - 5 Business Days</strong>
              </div>
            </div>

            <button className="success-home-redirect-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

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

export default CheckoutPage;
