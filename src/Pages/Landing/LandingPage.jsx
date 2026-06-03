import React from 'react';

/* ── Color Palette: Lilac Theme ── */
const C = {
  bg:        '#f7f3fc',   /* soft lilac white */
  bgLight:   '#ffffff',
  bgSection: '#f0e9f9',   /* light lilac */
  primary:   '#7c4fa0',   /* deep lilac/purple */
  accent:    '#b48dd4',   /* mid lilac */
  accentSoft:'#e3d0f5',   /* pale lilac */
  dark:      '#2d1f3d',   /* near-black purple */
  textMid:   '#7a6690',   /* muted lilac text */
  textLight: '#b8a8cc',   /* light muted text */
  border:    '#e4d8f2',   /* lilac border */
  white:     '#ffffff',
};

/* ── Reusable SVG Icons ── */
const HeartIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.6" style={{ cursor: 'pointer' }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const BagIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.6" style={{ cursor: 'pointer' }}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const UserIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.6" style={{ cursor: 'pointer' }}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoSVG = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="44" stroke={C.accent} strokeWidth="3" fill="none"/>
    <circle cx="50" cy="50" r="7" fill={C.accent}/>
    <path d="M50 18 Q62 34 50 50 Q38 34 50 18Z" fill={C.accent} opacity="0.7"/>
    <path d="M50 82 Q62 66 50 50 Q38 66 50 82Z" fill={C.accent} opacity="0.7"/>
    <path d="M18 50 Q34 62 50 50 Q34 38 18 50Z" fill={C.accent} opacity="0.7"/>
    <path d="M82 50 Q66 62 50 50 Q66 38 82 50Z" fill={C.accent} opacity="0.7"/>
  </svg>
);

/* ── Font style helper ── */
const serif   = "'Georgia', 'Times New Roman', serif";
const sansSerif = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

const LandingPage = () => {
  const features = [
    { num: '01', title: 'Natural Ingredients', desc: "Carefully sourced botanicals and actives that work in harmony with your skin's natural biology." },
    { num: '02', title: 'Dermatologist Tested', desc: "Every product is clinically tested and approved by leading dermatologists for all skin types." },
    { num: '03', title: 'Sustainable & Clean', desc: "Cruelty-free, vegan formulas in eco-conscious packaging. Good for you and the planet." },
  ];

  const products = [
    { name: 'Hydra-Boost Serum', price: '$58', tag: 'BESTSELLER' },
    { name: 'Vitamin C Brightening Cream', price: '$72', tag: 'NEW' },
    { name: 'Aloe Calm Essence', price: '$44', tag: 'POPULAR' },
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: C.bg, fontFamily: sansSerif, overflowX: 'hidden', color: C.dark }}>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 80px', background: C.bgLight,
        borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <LogoSVG size={30} />
          <span style={{ fontSize: '0.52rem', letterSpacing: '0.22em', color: C.accent, fontWeight: '700', fontFamily: sansSerif }}>BEAUTIFULLY</span>
        </div>

        <div style={{ display: 'flex', gap: '50px' }}>
          {[['Home', true], ['About', false], ['Store', false], ['Contact', false]].map(([link, active]) => (
            <a key={link} href="#" style={{
              textDecoration: 'none',
              color: active ? C.primary : C.textLight,
              fontWeight: active ? '700' : '400',
              fontSize: '0.95rem',
              fontFamily: sansSerif,
              borderBottom: active ? `2px solid ${C.primary}` : 'none',
              paddingBottom: '2px',
            }}>{link}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          <HeartIcon /> <BagIcon /> <UserIcon />
        </div>
      </nav>

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section style={{ display: 'grid', gridTemplateColumns: '55% 45%', minHeight: 'calc(100vh - 66px)', position: 'relative' }}>

        {/* LEFT */}
        <div style={{ padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(3rem, 5.5vw, 5.5rem)',
            fontWeight: '900', color: C.dark,
            lineHeight: '1.02', letterSpacing: '-0.025em', margin: 0,
          }}>
            GET THE SKIN<br />
            YOU WANT<br />
            TO FEEL
          </h1>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
            <div style={{ maxWidth: '200px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.16em', color: C.primary, margin: '0 0 10px', textTransform: 'uppercase', fontFamily: sansSerif }}>AGING BEAUTY</p>
              <p style={{ fontSize: '0.85rem', color: C.textMid, lineHeight: '1.65', margin: '0 0 18px', fontFamily: sansSerif }}>
                Lorem ipsum dolor sit amet,<br />consectetur adipiscing elit.
              </p>
              <a href="#" style={{ textDecoration: 'none', color: C.primary, fontWeight: '700', fontSize: '0.9rem', borderBottom: `2px solid ${C.primary}`, paddingBottom: '2px', fontFamily: sansSerif }}>
                Product Catalogue
              </a>
            </div>

            <div style={{
              width: '220px', height: '200px', borderRadius: '14px',
              overflow: 'hidden', background: C.accentSoft, flexShrink: 0,
              boxShadow: `0 8px 30px rgba(124,79,160,0.15)`,
            }}>
              <img src="/hero-model.png" alt="Serum application" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%' }} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Outline circle */}
          <div style={{ position: 'absolute', top: '25px', right: '60px', width: '75px', height: '75px', borderRadius: '50%', border: `1.5px solid ${C.accentSoft}`, zIndex: 2 }} />

          {/* Large rounded-left photo with lilac tint overlay */}
          <div style={{
            position: 'absolute', top: '30px', right: 0,
            width: '90%', height: '65%',
            borderTopLeftRadius: '180px', borderBottomLeftRadius: '180px',
            overflow: 'hidden', background: C.accentSoft,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(180,141,212,0.15)', zIndex: 1 }} />
            <img src="/hero-model.png" alt="Skincare Model" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          </div>

          {/* Asterisk lines in lilac */}
          <div style={{ position: 'absolute', left: '-30px', top: '55%', transform: 'translateY(-50%)', zIndex: 5 }}>
            <svg width="78" height="78" viewBox="0 0 78 78">
              <line x1="39" y1="0"  x2="39" y2="78" stroke={C.accentSoft} strokeWidth="1.5"/>
              <line x1="0"  y1="39" x2="78" y2="39" stroke={C.accentSoft} strokeWidth="1.5"/>
              <line x1="9"  y1="9"  x2="69" y2="69" stroke={C.accentSoft} strokeWidth="1.5"/>
              <line x1="69" y1="9"  x2="9"  y2="69" stroke={C.accentSoft} strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Location + Contact */}
          <div style={{ position: 'absolute', bottom: '50px', right: '40px', left: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', marginBottom: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: C.textLight, textTransform: 'uppercase', margin: '0 0 2px', fontFamily: sansSerif }}>LOCATION</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: C.dark, margin: 0, fontFamily: sansSerif }}>4172 B. Street</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: C.textLight, textTransform: 'uppercase', margin: '0 0 2px', fontFamily: sansSerif }}>CONTACT</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: C.dark, margin: 0, fontFamily: sansSerif }}>806-517-1530</p>
              </div>
            </div>
            <p style={{ fontSize: '0.76rem', color: C.textLight, lineHeight: '1.55', margin: 0, textAlign: 'right', fontFamily: sansSerif }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.<br />
              Praesent id odio scelerisque, imperdiet risus et, gravida
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES SECTION ══════════════ */}
      <section style={{ padding: '100px 80px', background: C.bgLight, borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: C.accent, textTransform: 'uppercase', marginBottom: '16px', fontFamily: sansSerif }}>OUR APPROACH</p>
        <h2 style={{ fontFamily: serif, fontSize: '2.8rem', fontWeight: '800', color: C.dark, marginBottom: '70px', maxWidth: '500px', lineHeight: '1.15' }}>
          Science Meets<br />Natural Beauty
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '50px' }}>
          {features.map(({ num, title, desc }) => (
            <div key={num} style={{ borderTop: `2px solid ${C.accent}`, paddingTop: '28px' }}>
              <p style={{ fontSize: '0.75rem', color: C.accent, letterSpacing: '0.12em', marginBottom: '14px', fontFamily: sansSerif }}>{num}</p>
              <h3 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: '700', color: C.dark, marginBottom: '12px' }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', color: C.textMid, lineHeight: '1.65', fontFamily: sansSerif }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ PRODUCTS SECTION ══════════════ */}
      <section style={{ padding: '100px 80px', background: C.bgSection }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: C.accent, textTransform: 'uppercase', marginBottom: '12px', fontFamily: sansSerif }}>BESTSELLERS</p>
            <h2 style={{ fontFamily: serif, fontSize: '2.6rem', fontWeight: '800', color: C.dark, margin: 0 }}>Our Signature Range</h2>
          </div>
          <a href="#" style={{ textDecoration: 'none', color: C.primary, fontWeight: '700', fontSize: '0.88rem', borderBottom: `2px solid ${C.primary}`, paddingBottom: '2px', fontFamily: sansSerif }}>
            View All Products →
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {products.map(({ name, price, tag }) => (
            <div key={name} style={{ cursor: 'pointer' }}>
              <div style={{
                width: '100%', height: '360px',
                background: C.accentSoft,
                borderRadius: '16px', marginBottom: '20px',
                position: 'relative', overflow: 'hidden',
                boxShadow: `0 6px 24px rgba(124,79,160,0.1)`,
              }}>
                <img src="/hero-model.png" alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  background: C.primary, color: C.white,
                  fontSize: '0.62rem', letterSpacing: '0.15em',
                  padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontFamily: sansSerif,
                }}>{tag}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: C.dark, margin: '0 0 4px', fontFamily: sansSerif }}>{name}</p>
                  <p style={{ fontSize: '0.85rem', color: C.textLight, margin: 0, fontFamily: sansSerif }}>Skincare</p>
                </div>
                <p style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: '800', color: C.primary, margin: 0 }}>{price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section style={{
        padding: '100px 80px',
        background: C.primary,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px',
      }}>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: C.accentSoft, textTransform: 'uppercase', marginBottom: '14px', fontFamily: sansSerif }}>LIMITED OFFER</p>
          <h2 style={{ fontFamily: serif, fontSize: '3rem', fontWeight: '800', color: C.white, margin: '0 0 20px', lineHeight: '1.1' }}>
            Your Skin Routine<br />Starts Here
          </h2>
          <p style={{ fontSize: '0.95rem', color: C.accentSoft, lineHeight: '1.65', maxWidth: '400px', margin: 0, fontFamily: sansSerif }}>
            Discover a curated skincare ritual tailored to your unique needs. Science-backed formulas that deliver visible results.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
          <button style={{ padding: '16px 36px', background: C.white, color: C.primary, border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', fontFamily: sansSerif }}>Shop Now</button>
          <button style={{ padding: '16px 36px', background: 'transparent', color: C.white, border: `1.5px solid ${C.accentSoft}`, borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', fontFamily: sansSerif }}>Learn More</button>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ padding: '50px 80px', background: C.bgLight, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <LogoSVG size={26} />
            <span style={{ fontSize: '0.52rem', letterSpacing: '0.22em', color: C.accent, fontWeight: '700', fontFamily: sansSerif }}>BEAUTIFULLY</span>
          </div>
          <div style={{ display: 'flex', gap: '40px' }}>
            {['Home', 'About', 'Store', 'Contact', 'Privacy'].map(link => (
              <a key={link} href="#" style={{ textDecoration: 'none', color: C.textLight, fontSize: '0.85rem', fontFamily: sansSerif }}>{link}</a>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: C.textLight, margin: 0, fontFamily: sansSerif }}>© 2026 Beautifully. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
