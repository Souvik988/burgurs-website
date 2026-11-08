import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { motionAllowed } from '../v6/Motion';
import './footer-wordmark.css';

/* Footer "dre's" with burger ingredients tossed up one after another: each one launches from
   below the letters, spins up to a peak above them, then drops back down in front of the
   wordmark and out of the bottom — on a loop, like a lazy juggling act. */
const ITEMS = [
  { src: '/assets/v8/footer/lettuce.webp', name: 'lettuce', w: .11 },
  { src: '/assets/v8/footer/tomato.webp', name: 'tomato', w: .085 },
  { src: '/assets/v8/footer/cheese.webp', name: 'cheese', w: .075 },
  { src: '/assets/v8/footer/patty.webp', name: 'patty', w: .115 },
  { src: '/assets/v8/footer/bun.webp', name: 'bun', w: .13 },
];
const REST_X = [.08, .34, .55, .78, .92]; // static positions when motion is off
const GAP = .62; // seconds between one toss and the next

export default function FooterWordmark() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!motionAllowed()) { el.classList.add('is-static'); return; }
    el.classList.remove('is-static');
    const items = [...el.querySelectorAll('.fw-item')];
    let W = el.clientWidth, H = el.clientHeight;
    const ro = new ResizeObserver(() => { W = el.clientWidth; H = el.clientHeight; });
    ro.observe(el);

    const toss = (img, i) => {
      const w = W * ITEMS[i].w;
      const x0 = gsap.utils.random(.04, .88) * W;
      const x1 = gsap.utils.clamp(0, W - w, x0 + gsap.utils.random(-.18, .18) * W);
      const peak = gsap.utils.random(-.22, .12) * H; // above the letter tops
      const spin = gsap.utils.random([-1, 1]) * gsap.utils.random(200, 420);
      const up = gsap.utils.random(.75, .95), down = gsap.utils.random(.85, 1.05);
      gsap.killTweensOf(img);
      gsap.set(img, { width: w, x: x0, y: H * 1.05, rotation: gsap.utils.random(-30, 30), autoAlpha: 1 });
      gsap.timeline()
        .to(img, { x: (x0 + x1) / 2, duration: up, ease: 'none' }, 0)
        .to(img, { y: peak, duration: up, ease: 'power2.out' }, 0)
        .to(img, { x: x1, duration: down, ease: 'none' }, up)
        .to(img, { y: H * 1.12, duration: down, ease: 'power2.in' }, up)
        .to(img, { rotation: `+=${spin}`, duration: up + down, ease: 'none' }, 0);
    };

    // One ingredient launches every GAP seconds, in turn, only while the footer is on screen.
    let i = 0, call = null;
    const next = () => { toss(items[i % items.length], i % items.length); i++; call = gsap.delayedCall(GAP, next); };
    gsap.set(items, { autoAlpha: 0 });
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!call) next(); }
      else { call?.kill(); call = null; }
    }, { rootMargin: '100px' });
    io.observe(el);

    // Tap: everything in the air gets an extra flick upward before falling.
    const field = el.querySelector('.fw-field');
    const flick = () => items.forEach((img, k) => {
      if (gsap.getProperty(img, 'y') > H) return;
      gsap.killTweensOf(img, 'y');
      gsap.timeline({ delay: k * .04 })
        .to(img, { y: `-=${H * .35}`, duration: .28, ease: 'power2.out' })
        .to(img, { y: H * 1.15, duration: .85, ease: 'power2.in' });
    });
    field.addEventListener('pointerdown', flick);

    return () => { call?.kill(); io.disconnect(); ro.disconnect(); field.removeEventListener('pointerdown', flick); gsap.killTweensOf(items); };
  }, []);

  return <div className="footer-wordmark-wrap">
    <div className="footer-wordmark fw-play" ref={root}>
      <Link to="/" className="fw-text" aria-label="Dre’s Burgers home">dre’s</Link>
      <div className="fw-field" aria-hidden="true">
        {ITEMS.map((it, i) => <img key={it.name} className={`fw-item fw-${it.name}`} src={it.src} alt="" draggable="false" style={{ '--rest-x': `${REST_X[i] * 100}%` }} />)}
      </div>
    </div>
  </div>;
}
