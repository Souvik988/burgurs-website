import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../commerce/CartContext';
import { motionAllowed } from '../v6/Motion';
import './order.css';

/* A spinning "order direct" seal. Appears after the first screen on every page except cart/checkout,
   spins faster while you scroll, wobbles when something lands in the bag. */
export function OrderBadge() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const [show, setShow] = useState(false);
  const ring = useRef(null);
  const root = useRef(null);
  const hidden = pathname.startsWith('/cart') || pathname.startsWith('/checkout');
  const lastCount = useRef(count);

  useEffect(() => {
    if (hidden) return;
    // On touch screens the seal tucks away while you scroll down (so it never covers what you are
    // reading) and slides back when you pause or scroll up.
    const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
    let lastY = scrollY, idle = 0;
    const onScroll = () => {
      const footer = document.querySelector('.footer-invite') || document.querySelector('.footer-wordmark');
      const nearFooter = footer && footer.getBoundingClientRect().top < innerHeight * .85;
      setShow(scrollY > innerHeight * .6 && !nearFooter);
      if (!touch || !root.current) return;
      const dy = scrollY - lastY; lastY = scrollY;
      if (dy > 6) root.current.classList.add('is-away');
      else if (dy < -6) root.current.classList.remove('is-away');
      clearTimeout(idle);
      idle = setTimeout(() => root.current?.classList.remove('is-away'), 900);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => { removeEventListener('scroll', onScroll); clearTimeout(idle); };
  }, [hidden, pathname]);

  useEffect(() => {
    if (hidden || !motionAllowed() || !ring.current) return;
    const spin = { speed: 1 };
    const rot = gsap.quickSetter(ring.current, 'rotation', 'deg');
    let angle = 0;
    const tick = (_, dt) => { angle += dt * .02 * spin.speed; rot(angle); };
    gsap.ticker.add(tick);
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { spin.speed = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 8); gsap.to(spin, { speed: 1, duration: 1.2, ease: 'power2.out', overwrite: true }); } });
    return () => { gsap.ticker.remove(tick); st.kill(); };
  }, [hidden]);

  useEffect(() => {
    if (count > lastCount.current && root.current && motionAllowed()) gsap.fromTo(root.current.querySelector('.ob-core'), { scale: .7, rotation: -20 }, { scale: 1, rotation: 0, duration: .8, ease: 'elastic.out(1, .35)' });
    lastCount.current = count;
  }, [count]);

  if (hidden) return null;
  const label = count ? `Open your bag, ${count} item${count === 1 ? '' : 's'}` : 'Order direct and save 10 percent';
  return <Link ref={root} to={count ? '/cart' : '/menu'} className={`order-badge ${show ? 'is-on' : ''}`} aria-label={label} tabIndex={show ? 0 : -1} aria-hidden={!show}>
    <svg ref={ring} className="ob-ring" viewBox="0 0 200 200" aria-hidden="true">
      <defs><path id="ob-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
      <text><textPath href="#ob-circle" startOffset="0" textLength="458" lengthAdjust="spacingAndGlyphs">{count ? 'YOUR BAG IS WAITING · CHECK OUT NOW · ' : 'ORDER DIRECT · SAVE 10% · ORDER DIRECT · SAVE 10% · '}</textPath></text>
    </svg>
    <span className="ob-core"><img src="/assets/v8/stickers/bag.webp" alt="" />{count > 0 && <b className="ob-count">{count}</b>}</span>
  </Link>;
}

/* When an ADD TO BAG button is pressed, a copy of the food photo arcs into the bag. */
export function useFlyToBag() {
  useEffect(() => {
    const onClick = e => {
      const btn = e.target.closest?.('.add-to-bag');
      if (!btn || !motionAllowed()) return;
      const holder = btn.closest('article, .cf-result, .hof-card, .item-detail, .dialog-inner, .menu-card');
      const src = holder?.querySelector('img:not([aria-hidden="true"])')?.currentSrc;
      const visibleBadge = document.querySelector('.order-badge.is-on .ob-core');
      const target = visibleBadge || document.querySelector('.cart-header-link');
      if (!src || !target) return;
      const from = btn.getBoundingClientRect(), to = target.getBoundingClientRect();
      const img = document.createElement('img');
      img.src = src; img.alt = ''; img.className = 'fly-to-bag';
      document.body.appendChild(img);
      const sx = from.left + from.width / 2 - 45, sy = from.top - 70;
      const dx = to.left + to.width / 2 - 45 - sx, dy = to.top + to.height / 2 - 45 - sy;
      gsap.set(img, { x: sx, y: sy, scale: .4, rotation: -20 });
      gsap.timeline({ onComplete: () => img.remove() })
        .to(img, { scale: 1, rotation: 0, duration: .25, ease: 'back.out(2.5)' })
        .to(img, { x: sx + dx, duration: .75, ease: 'power1.inOut' }, '>')
        .to(img, { y: sy + Math.min(dy, -80) - 120, duration: .32, ease: 'power2.out' }, '<')
        .to(img, { y: sy + dy, duration: .43, ease: 'power2.in' }, '>')
        .to(img, { scale: .2, rotation: 25, opacity: 0, duration: .3, ease: 'power2.in' }, '-=.25')
        .add(() => { const t = document.querySelector('.cart-header-link'); if (t) gsap.fromTo(t, { scale: 1.35 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' }); });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
