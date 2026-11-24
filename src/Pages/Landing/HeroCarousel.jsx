import { useEffect, useState } from 'react';
import { ArrowRight, Leaf, Pause, Play } from 'lucide-react';

const slides = [
  { image: 'skincare', title: 'Discover Your', highlight: 'Perfect Skincare', description: 'Premium skincare and self-care essentials for healthy, glowing skin.', category: 'skincare' },
  { image: 'makeup', title: 'Find Your', highlight: 'Signature Makeup', description: 'From everyday favourites to statement shades, find makeup for every look.', category: 'makeup' },
  { image: 'beauty-routine', title: 'Build Your', highlight: 'Beauty Routine', description: 'Discover skincare prep and makeup essentials that belong in your daily routine.', category: 'catalog' },
];

export default function HeroCarousel({ onShop }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(false);
  const slide = slides[active];

  useEffect(() => {
    if (paused || hovered) return;
    const timer = window.setTimeout(() => setActive((active + 1) % slides.length), 5000);
    return () => window.clearTimeout(timer);
  }, [active, hovered, paused]);

  return (
    <section className="hero-banner" aria-label="Beauty collections" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {slides.map(({ image }, index) => (
        <div key={image} className={`hero-slide ${index === active ? 'active' : ''}`}>
          <img src={`/banners/${image}.jpg`} className="hero-bg-img" alt="" fetchPriority={index === 0 ? 'high' : 'low'} />
        </div>
      ))}
      <div className="hero-gradient-overlay" />
      <div className="hero-content">
        <div className="hero-tag"><Leaf size={15} aria-hidden="true" /> SUMMER COLLECTION 2026</div>
        <h1 className="hero-headline">{slide.title}<br /><span className="hero-highlight">{slide.highlight}</span></h1>
        <p className="hero-sub">{slide.description}</p>
        <div className="hero-cta-group">
          <button className="hero-cta-primary" onClick={() => onShop(slide.category)}>Shop Now <ArrowRight size={17} /></button>
          <button className="hero-cta-secondary" onClick={() => onShop('sale')}>Shop Sale</button>
        </div>
        <div className="hero-controls">
          {slides.map(({ image, highlight }, index) => (
            <button key={image} type="button" className={`hero-dot ${index === active ? 'active' : ''}`} aria-label={highlight} aria-pressed={index === active} onClick={() => setActive(index)} />
          ))}
          <button type="button" className="hero-play" aria-label={paused ? 'Play banner rotation' : 'Pause banner rotation'} onClick={() => setPaused(!paused)}>
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>
    </section>
  );
}
